import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  UserX, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  AlertTriangle,
  Camera,
  Watch,
  Laptop,
  Smartphone,
  Package,
  Calendar,
  Info,
  CheckCircle,
  Printer,
  Edit,
  Loader2
} from "lucide-react";
import { format, addDays } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { AppLayout } from "@/components/layout/AppLayout.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import { AvatarCustom } from "@/components/ui/avatar-custom.tsx";
import { StatusBadge } from "@/components/ui/status-badge.tsx";
import { FormField } from "@/components/ui/form-field.tsx";
import { StepIndicator } from "@/components/ui/step-indicator.tsx";
import { CategoryCard } from "@/components/ui/category-card.tsx";
import { PhotoCapture } from "@/components/ui/photo-capture.tsx";
import { InfoRow } from "@/components/ui/info-row.tsx";
import { useLoanFormStore } from "@/stores/loan-form-store.ts";
import { searchCustomers as searchCustomersApi, createCustomer, type Customer } from "@/services/customer-service";
import { createLoan } from "@/services/loan-service";
import gemmaryLogo from "@/assets/gemmary_logo.jpg";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { cn } from "@/lib/utils.ts";
import { toast } from "sonner";

const steps = [
  { number: 1, label: "Customer" },
  { number: 2, label: "Item Details" },
  { number: 3, label: "Loan Terms" },
  { number: 4, label: "Review & Print" },
];

const karatPurity: Record<string, number> = {
  "10k": 41.7,
  "14k": 58.3,
  "18k": 75,
  "21k": 87.5,
  "22k": 91.7,
  "24k": 99.9,
};

export default function NewLoan() {
  const navigate = useNavigate();
  const { step, setStep, customerData, setCustomerData, itemData, setItemData, loanTerms, setLoanTerms, reset } = useLoanFormStore();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [itemPhotos, setItemPhotos] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchResults, setSearchResults] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search customers from Supabase
  useEffect(() => {
    const search = async () => {
      if (!searchQuery || searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await searchCustomersApi(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Calculate loan values
  const appraisalValue = itemData.appraisalValue || 0;
  const principal = loanTerms.principal || 0;
  const interestRate = loanTerms.interestRate || 3;
  const period = loanTerms.period || 30;
  const serviceFee = loanTerms.serviceFee || 0;

  const loanPercentage = appraisalValue > 0 ? Math.round((principal / appraisalValue) * 100) : 0;
  const interest = Math.round(principal * (interestRate / 100) * (period / 30));
  const totalDue = principal + interest + serviceFee;
  const maturityDate = addDays(new Date(), period);

  const ticketNumber = useMemo(() => {
    const prefix = "PT";
    const date = format(new Date(), "yyMMdd");
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `${prefix}${date}-${random}`;
  }, []);

  const calculateGoldValue = () => {
    const weight = itemData.weight || 0;
    const pricePerGram = itemData.pricePerGram || 0;
    const karat = itemData.karat || "18k";
    const purity = karatPurity[karat] || 75;
    return Math.round(weight * pricePerGram * (purity / 100));
  };

  const handlePhotoCapture = (id: string, file: File) => {
    const url = URL.createObjectURL(file);
    setPhotos((prev) => ({ ...prev, [id]: url }));
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos((prev) => {
      const newPhotos = { ...prev };
      delete newPhotos[id];
      return newPhotos;
    });
  };

  const handleItemPhotoCapture = (id: string, file: File) => {
    const url = URL.createObjectURL(file);
    setItemPhotos((prev) => [...prev, url]);
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerData({
      fullName: customer.full_name,
      dateOfBirth: customer.date_of_birth,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      idType: customer.id_type,
      idNumber: customer.id_number,
    });
    setStep(2);
  };

  // Validation functions
  const isCustomerValid = () => {
    return !!(
      customerData.fullName &&
      customerData.dateOfBirth &&
      customerData.phone &&
      customerData.idType &&
      customerData.idNumber &&
      customerData.address &&
      photos["customer-photo"] &&
      photos["id-front"] &&
      photos["id-back"]
    );
  };

  const isItemValid = () => {
    const hasCategory = !!category;
    const hasPhotos = itemPhotos.length >= 2;
    const hasAppraisal = appraisalValue > 0;

    if (category === "gold") {
      return hasCategory && hasPhotos && hasAppraisal &&
        !!(itemData.goldType && itemData.weight && itemData.karat);
    }
    if (category === "electronics" || category === "mobile") {
      return hasCategory && hasPhotos && hasAppraisal &&
        !!(itemData.brand && itemData.model && itemData.condition);
    }
    return hasCategory && hasPhotos && hasAppraisal;
  };

  const isLoanTermsValid = () => {
    return principal > 0 && interestRate > 0 && period > 0;
  };

  const handleConfirmAndPrint = async () => {
    setIsProcessing(true);
    try {
      let customerId = selectedCustomer?.id;

      // If new customer, save to Supabase first
      if (isNewCustomer && !selectedCustomer) {
        const newCustomer = await createCustomer({
          full_name: customerData.fullName || '',
          date_of_birth: customerData.dateOfBirth || '',
          phone: customerData.phone || '',
          email: customerData.email || undefined,
          address: customerData.address || '',
          id_type: customerData.idType || '',
          id_number: customerData.idNumber || '',
          photo: photos["customer-photo"] || undefined,
          id_front_photo: photos["id-front"] || undefined,
          id_back_photo: photos["id-back"] || undefined,
          watchlist_status: 'clear',
        });
        customerId = newCustomer.id;
      }

      if (!customerId) {
        throw new Error('No customer selected');
      }

      // Create the loan
      await createLoan({
        ticket_number: ticketNumber,
        customer_id: customerId,
        status: 'active',
        item_category: category,
        item_description: category === 'gold'
          ? `${itemData.goldType} - ${itemData.weight}g ${itemData.karat}`
          : `${itemData.brand} ${itemData.model}`,
        item_photos: itemPhotos,
        appraisal_value: appraisalValue,
        gold_type: itemData.goldType,
        gold_weight: itemData.weight,
        gold_karat: itemData.karat,
        brand: itemData.brand,
        model: itemData.model,
        serial_number: itemData.serialNumber,
        item_condition: itemData.condition,
        principal: principal,
        interest_rate: interestRate,
        period_days: period,
        service_fee: serviceFee,
        interest_amount: interest,
        total_due: totalDue,
        maturity_date: maturityDate.toISOString(),
      });

      toast.success("Loan created successfully!", {
        description: `Ticket #${ticketNumber} has been generated`,
      });
      reset();
      navigate("/loans");
    } catch (error) {
      console.error('Error creating loan:', error);
      toast.error("Failed to create loan", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => step > 1 ? setStep(step - 1) : navigate("/")}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-heading font-semibold text-text-primary">
              New Loan
            </h1>
            <p className="text-text-secondary text-sm">
              Create a new pawn transaction
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={step} />

        {/* Step 1: Customer Search */}
        {step === 1 && !isNewCustomer && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-heading font-semibold">Find Customer</h2>
              <p className="text-text-secondary text-sm">Search by name, phone, or ID number</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                <Input
                  type="text"
                  placeholder="Search customer..."
                  className="pl-12 h-14 text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Search Results */}
              {isSearching && (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
                  <p className="text-text-secondary mt-2">Searching...</p>
                </div>
              )}
              {!isSearching && searchResults.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-text-tertiary">{searchResults.length} customers found</p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.map((customer) => (
                      <div
                        key={customer.id}
                        onClick={() => selectCustomer(customer)}
                        className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary cursor-pointer transition-all"
                      >
                        <AvatarCustom src={customer.photo} size="md" />
                        <div className="flex-1">
                          <p className="font-body font-semibold text-text-primary">{customer.full_name}</p>
                          <p className="text-sm text-text-secondary">{customer.phone}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-text-tertiary">Active Loans</p>
                          <p className="font-semibold text-primary">{customer.active_loans_count || 0}</p>
                        </div>
                        {customer.watchlist_status === "flagged" && (
                          <StatusBadge variant="warning">
                            <AlertTriangle className="w-3 h-3" />
                            Review
                          </StatusBadge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="text-center py-8 space-y-4">
                  <UserX className="w-12 h-12 text-text-tertiary mx-auto" />
                  <div>
                    <p className="text-text-secondary">No customer found</p>
                    <Button className="mt-4" onClick={() => setIsNewCustomer(true)}>
                      <Plus className="w-5 h-5 mr-2" />
                      Create New Customer
                    </Button>
                  </div>
                </div>
              )}

              {/* Initial State */}
              {searchQuery.length < 2 && (
                <div className="text-center py-8">
                  <Search className="w-12 h-12 text-text-tertiary mx-auto mb-4 opacity-50" />
                  <p className="text-text-secondary">Enter at least 2 characters to search</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsNewCustomer(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Register New Customer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 1b: New Customer KYC */}
        {step === 1 && isNewCustomer && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-heading font-semibold">Customer Information</h2>
              <p className="text-text-secondary text-sm">Complete KYC verification</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo Capture */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PhotoCapture
                  label="Customer Photo"
                  id="customer-photo"
                  captured={photos["customer-photo"]}
                  onCapture={handlePhotoCapture}
                  onRemove={handleRemovePhoto}
                />
                <PhotoCapture
                  label="ID Front"
                  id="id-front"
                  captured={photos["id-front"]}
                  onCapture={handlePhotoCapture}
                  onRemove={handleRemovePhoto}
                />
                <PhotoCapture
                  label="ID Back"
                  id="id-back"
                  captured={photos["id-back"]}
                  onCapture={handlePhotoCapture}
                  onRemove={handleRemovePhoto}
                />
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Full Name" required>
                  <Input
                    placeholder="Juan Dela Cruz"
                    value={customerData.fullName || ""}
                    onChange={(e) => setCustomerData({ fullName: e.target.value })}
                  />
                </FormField>

                <FormField label="Date of Birth" required>
                  <Input
                    type="date"
                    value={customerData.dateOfBirth || ""}
                    onChange={(e) => setCustomerData({ dateOfBirth: e.target.value })}
                  />
                </FormField>

                <FormField label="Mobile Number" required>
                  <Input
                    type="tel"
                    placeholder="+63 912 345 6789"
                    value={customerData.phone || ""}
                    onChange={(e) => setCustomerData({ phone: e.target.value })}
                  />
                </FormField>

                <FormField label="ID Type" required>
                  <Select
                    value={customerData.idType}
                    onValueChange={(value) => setCustomerData({ idType: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drivers_license">Driver's License</SelectItem>
                      <SelectItem value="umid">UMID</SelectItem>
                      <SelectItem value="philhealth">PhilHealth</SelectItem>
                      <SelectItem value="sss">SSS ID</SelectItem>
                      <SelectItem value="passport">Passport</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="ID Number" required>
                  <Input
                    placeholder="Enter ID number"
                    value={customerData.idNumber || ""}
                    onChange={(e) => setCustomerData({ idNumber: e.target.value })}
                  />
                </FormField>

                <FormField label="Email">
                  <Input
                    type="email"
                    placeholder="juan@email.com"
                    value={customerData.email || ""}
                    onChange={(e) => setCustomerData({ email: e.target.value })}
                  />
                </FormField>
              </div>

              <FormField label="Complete Address" required>
                <Textarea
                  rows={3}
                  placeholder="House/Unit No., Street, Barangay, City, Province"
                  value={customerData.address || ""}
                  onChange={(e) => setCustomerData({ address: e.target.value })}
                />
              </FormField>

              {/* Watchlist Status */}
              <div className="bg-muted border border-border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-success" />
                  <span className="text-success font-semibold">Watchlist Clear</span>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setIsNewCustomer(false)}>
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Back to Search
                </Button>
                <Button
                  onClick={() => {
                    if (!isCustomerValid()) {
                      toast.error("Please complete all required fields", {
                        description: "Fill in all customer details and capture all photos",
                      });
                      return;
                    }
                    setStep(2);
                  }}
                >
                  Continue to Item Details
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Item Details */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-heading font-semibold">Item Information</h2>
              <p className="text-text-secondary text-sm">Details about the collateral item</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-2">
                <label className="font-body font-medium text-text-primary text-sm">Item Category *</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <CategoryCard
                    icon={Watch}
                    label="Gold Jewelry"
                    selected={category === "gold"}
                    onClick={() => setCategory("gold")}
                  />
                  <CategoryCard
                    icon={Laptop}
                    label="Electronics"
                    selected={category === "electronics"}
                    onClick={() => setCategory("electronics")}
                  />
                  <CategoryCard
                    icon={Smartphone}
                    label="Mobile Devices"
                    selected={category === "mobile"}
                    onClick={() => setCategory("mobile")}
                  />
                  <CategoryCard
                    icon={Package}
                    label="Other Items"
                    selected={category === "other"}
                    onClick={() => setCategory("other")}
                  />
                </div>
              </div>

              {/* Item Photos */}
              <div className="space-y-2">
                <label className="font-body font-medium text-text-primary text-sm">Item Photos *</label>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                  {itemPhotos.map((photo, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={photo}
                        alt={`Item ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => setItemPhotos((prev) => prev.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 bg-error text-error-foreground rounded-full p-1 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {itemPhotos.length < 6 && (
                    <PhotoCapture
                      label=""
                      id={`item-${itemPhotos.length}`}
                      onCapture={handleItemPhotoCapture}
                    />
                  )}
                </div>
                <p className="text-xs text-text-tertiary">Upload 2-6 photos of the item</p>
              </div>

              {/* Gold Fields */}
              {category === "gold" && (
                <div className="space-y-4">
                  <h3 className="font-heading font-semibold text-lg">Gold Item Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Item Type" required>
                      <Select
                        value={itemData.goldType}
                        onValueChange={(value) => setItemData({ goldType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="necklace">Necklace</SelectItem>
                          <SelectItem value="ring">Ring</SelectItem>
                          <SelectItem value="bracelet">Bracelet</SelectItem>
                          <SelectItem value="earrings">Earrings</SelectItem>
                          <SelectItem value="pendant">Pendant</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Weight (grams)" required>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={itemData.weight || ""}
                        onChange={(e) => setItemData({ weight: parseFloat(e.target.value) })}
                      />
                    </FormField>

                    <FormField label="Karat" required>
                      <Select
                        value={itemData.karat}
                        onValueChange={(value) => setItemData({ karat: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select karat" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10k">10K</SelectItem>
                          <SelectItem value="14k">14K</SelectItem>
                          <SelectItem value="18k">18K</SelectItem>
                          <SelectItem value="21k">21K</SelectItem>
                          <SelectItem value="22k">22K</SelectItem>
                          <SelectItem value="24k">24K</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>

                    <FormField label="Gold Price per Gram">
                      <Input
                        type="number"
                        placeholder="₱ 0.00"
                        value={itemData.pricePerGram || ""}
                        onChange={(e) => setItemData({ pricePerGram: parseFloat(e.target.value) })}
                      />
                    </FormField>
                  </div>

                  {/* Calculated Value */}
                  {itemData.weight && itemData.pricePerGram && (
                    <div className="bg-accent/10 border border-accent rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-body font-medium text-text-primary">Estimated Value</span>
                        <span className="text-2xl font-heading font-bold text-brand-burgundy">
                          ₱ {calculateGoldValue().toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-text-tertiary mt-1">
                        Based on {itemData.weight}g × ₱{itemData.pricePerGram} × {karatPurity[itemData.karat || "18k"]}%
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Electronics Fields */}
              {(category === "electronics" || category === "mobile") && (
                <div className="space-y-4">
                  <h3 className="font-heading font-semibold text-lg">
                    {category === "mobile" ? "Mobile Device" : "Electronics"} Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Brand" required>
                      <Input
                        placeholder="e.g., Apple, Samsung, Sony"
                        value={itemData.brand || ""}
                        onChange={(e) => setItemData({ brand: e.target.value })}
                      />
                    </FormField>

                    <FormField label="Model" required>
                      <Input
                        placeholder="e.g., MacBook Pro 2023"
                        value={itemData.model || ""}
                        onChange={(e) => setItemData({ model: e.target.value })}
                      />
                    </FormField>

                    <FormField label="Serial Number / IMEI">
                      <Input
                        placeholder="Serial or IMEI number"
                        value={itemData.serialNumber || ""}
                        onChange={(e) => setItemData({ serialNumber: e.target.value })}
                      />
                    </FormField>

                    <FormField label="Condition" required>
                      <Select
                        value={itemData.condition}
                        onValueChange={(value) => setItemData({ condition: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excellent">Excellent</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormField>
                  </div>
                </div>
              )}

              {/* Appraisal Value */}
              <div className="border-t pt-4">
                <FormField label="Appraisal Value" required>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary font-semibold">₱</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-8 text-xl font-heading font-semibold"
                      value={itemData.appraisalValue || ""}
                      onChange={(e) => setItemData({ appraisalValue: parseFloat(e.target.value) })}
                    />
                  </div>
                  <p className="text-sm text-text-tertiary mt-1">Final appraised value of the item</p>
                </FormField>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (!isItemValid()) {
                      toast.error("Please complete all required fields", {
                        description: "Select category, add at least 2 photos, fill item details, and set appraisal value",
                      });
                      return;
                    }
                    setItemData({ category: category as any });
                    setStep(3);
                  }}
                >
                  Continue to Loan Terms
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Loan Terms */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-heading font-semibold">Loan Terms</h2>
              <p className="text-text-secondary text-sm">Set the loan amount and repayment terms</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Appraisal Summary */}
              <div className="bg-muted border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-text-secondary">Appraised Value</span>
                  <span className="text-2xl font-heading font-bold text-text-primary">
                    ₱ {appraisalValue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-tertiary">
                  <Info className="w-4 h-4" />
                  <span>Loan amount typically 60-80% of appraisal value</span>
                </div>
              </div>

              {/* Principal Amount */}
              <FormField label="Loan Amount (Principal)" required>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary font-semibold text-xl">₱</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-10 text-2xl font-heading font-bold h-16"
                    value={principal || ""}
                    onChange={(e) => setLoanTerms({ principal: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                {/* Percentage bar */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 bg-border rounded-full h-2 overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-300",
                        loanPercentage <= 80 ? "bg-success" : "bg-warning"
                      )}
                      style={{ width: `${Math.min(loanPercentage, 100)}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-sm font-semibold",
                    loanPercentage <= 80 ? "text-success" : "text-warning"
                  )}>
                    {loanPercentage}%
                  </span>
                </div>
                {loanPercentage > 80 && (
                  <div className="flex items-center gap-2 mt-2 text-warning text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Loan amount exceeds recommended 80% threshold</span>
                  </div>
                )}
              </FormField>

              {/* Quick Amount Buttons */}
              <div className="flex gap-2 flex-wrap">
                {[60, 70, 80].map((pct) => (
                  <Button
                    key={pct}
                    variant="outline"
                    size="sm"
                    onClick={() => setLoanTerms({ principal: Math.round(appraisalValue * (pct / 100)) })}
                  >
                    {pct}% (₱{Math.round(appraisalValue * (pct / 100)).toLocaleString()})
                  </Button>
                ))}
              </div>

              {/* Interest & Period */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Interest Rate (Monthly)" required>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      value={interestRate}
                      onChange={(e) => setLoanTerms({ interestRate: parseFloat(e.target.value) || 0 })}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary font-semibold">%</span>
                  </div>
                </FormField>

                <FormField label="Loan Period" required>
                  <Select
                    value={period.toString()}
                    onValueChange={(value) => setLoanTerms({ period: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 Days (1 Month)</SelectItem>
                      <SelectItem value="60">60 Days (2 Months)</SelectItem>
                      <SelectItem value="90">90 Days (3 Months)</SelectItem>
                      <SelectItem value="120">120 Days (4 Months)</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              {/* Maturity Date */}
              <div className="bg-accent/10 border border-accent rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-burgundy" />
                    <span className="font-body font-medium text-text-primary">Maturity Date</span>
                  </div>
                  <span className="text-lg font-heading font-semibold text-brand-burgundy">
                    {format(maturityDate, "MMMM d, yyyy")}
                  </span>
                </div>
              </div>

              {/* Service Fee */}
              <FormField label="Service Fee (Optional)">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary font-semibold">₱</span>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="pl-8"
                    value={serviceFee || ""}
                    onChange={(e) => setLoanTerms({ serviceFee: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </FormField>

              {/* Payment Summary */}
              <div className="border-t pt-6 space-y-3">
                <h3 className="font-heading font-semibold text-lg mb-4">Payment Summary</h3>

                <div className="flex justify-between text-text-secondary">
                  <span>Principal Amount</span>
                  <span className="font-mono">₱ {principal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-text-secondary">
                  <span>Interest ({interestRate}% × {period / 30} month{period > 30 ? "s" : ""})</span>
                  <span className="font-mono">₱ {interest.toLocaleString()}</span>
                </div>

                {serviceFee > 0 && (
                  <div className="flex justify-between text-text-secondary">
                    <span>Service Fee</span>
                    <span className="font-mono">₱ {serviceFee.toLocaleString()}</span>
                  </div>
                )}

                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-lg font-heading font-semibold text-text-primary">
                    Total Amount Due
                  </span>
                  <span className="text-3xl font-heading font-bold text-primary">
                    ₱ {totalDue.toLocaleString()}
                  </span>
                </div>

                <p className="text-sm text-text-tertiary text-center">
                  Due on {format(maturityDate, "MMMM d, yyyy")}
                </p>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => {
                    if (!isLoanTermsValid()) {
                      toast.error("Please complete loan terms", {
                        description: "Set a loan amount greater than 0",
                      });
                      return;
                    }
                    setStep(4);
                  }}
                >
                  Review & Generate Ticket
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Review & Print */}
        {step === 4 && (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-text-primary">
                Loan Ready for Processing
              </h2>
              <p className="text-text-secondary">
                Review the details below before finalizing the transaction
              </p>
            </div>

            {/* Review Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Card */}
              <Card>
                <CardHeader className="flex flex-row items-center gap-3">
                  <AvatarCustom src={selectedCustomer?.photo || photos["customer-photo"]} size="lg" />
                  <div>
                    <h3 className="font-heading font-semibold text-lg">Customer</h3>
                    <p className="text-text-tertiary text-sm">Borrower information</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1">
                  <InfoRow label="Name" value={selectedCustomer?.full_name || customerData.fullName || "N/A"} />
                  <InfoRow label="Phone" value={selectedCustomer?.phone || customerData.phone || "N/A"} />
                  <InfoRow label="ID Type" value={selectedCustomer?.id_type || customerData.idType || "N/A"} />
                  <InfoRow label="ID Number" value={selectedCustomer?.id_number || customerData.idNumber || "N/A"} />
                </CardContent>
              </Card>

              {/* Item Card */}
              <Card>
                <CardHeader>
                  <h3 className="font-heading font-semibold text-lg">Collateral Item</h3>
                  <p className="text-text-tertiary text-sm">Item details</p>
                </CardHeader>
                <CardContent className="space-y-1">
                  <InfoRow label="Category" value={category || "N/A"} />
                  {category === "gold" && (
                    <>
                      <InfoRow label="Type" value={itemData.goldType || "N/A"} />
                      <InfoRow label="Weight" value={`${itemData.weight || 0}g`} />
                      <InfoRow label="Karat" value={itemData.karat || "N/A"} />
                    </>
                  )}
                  {(category === "electronics" || category === "mobile") && (
                    <>
                      <InfoRow label="Brand" value={itemData.brand || "N/A"} />
                      <InfoRow label="Model" value={itemData.model || "N/A"} />
                    </>
                  )}
                  <InfoRow label="Appraised Value" value={`₱ ${appraisalValue.toLocaleString()}`} highlight />
                </CardContent>
              </Card>

              {/* Loan Terms Card */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <h3 className="font-heading font-semibold text-lg">Loan Terms</h3>
                  <p className="text-text-tertiary text-sm">Payment details</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-text-tertiary text-sm mb-1">Principal Amount</p>
                      <p className="text-xl font-heading font-bold text-text-primary">
                        ₱ {principal.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-text-tertiary text-sm mb-1">Interest Rate</p>
                      <p className="text-xl font-heading font-bold text-text-primary">
                        {interestRate}% / month
                      </p>
                    </div>
                    <div>
                      <p className="text-text-tertiary text-sm mb-1">Loan Period</p>
                      <p className="text-xl font-heading font-bold text-text-primary">
                        {period} days
                      </p>
                    </div>
                    <div>
                      <p className="text-text-tertiary text-sm mb-1">Maturity Date</p>
                      <p className="text-xl font-heading font-bold text-primary">
                        {format(maturityDate, "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-body font-medium text-text-secondary">
                        Total Amount Due at Maturity
                      </span>
                      <span className="text-4xl font-heading font-bold text-primary">
                        ₱ {totalDue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pawn Ticket Preview */}
            <Card>
              <CardHeader>
                <h3 className="font-heading font-semibold text-lg">Pawn Ticket Preview</h3>
                <p className="text-text-tertiary text-sm">This will be printed for the customer</p>
              </CardHeader>
              <CardContent>
                <div className="bg-card border-2 border-border rounded-lg p-8 max-w-md mx-auto">
                  <div className="text-center mb-6">
                    <img src={gemmaryLogo} alt="Gemmary" className="h-16 w-16 mx-auto mb-2 rounded-full" />
                    <h4 className="font-heading font-bold text-xl">PAWN TICKET</h4>
                    <p className="text-xs text-text-tertiary">J. Almirante corner R. Fernan St., Bogo City</p>
                  </div>

                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Ticket No:</span>
                      <span className="font-mono font-semibold">{ticketNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Date:</span>
                      <span className="font-semibold">{format(new Date(), "MMM d, yyyy")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-tertiary">Customer:</span>
                      <span className="font-semibold">{selectedCustomer?.full_name || customerData.fullName}</span>
                    </div>
                  </div>

                  <div className="border-t border-b py-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-text-tertiary">Principal:</span>
                      <span className="font-semibold">₱ {principal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-text-tertiary">Interest:</span>
                      <span className="font-semibold">₱ {interest.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Due:</span>
                      <span className="text-primary">₱ {totalDue.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-sm text-text-tertiary mb-2">Maturity Date</p>
                    <p className="text-lg font-bold text-primary">{format(maturityDate, "MMMM d, yyyy")}</p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    <QRCodeSVG value={ticketNumber} size={120} />
                  </div>

                  <p className="text-xs text-text-tertiary text-center mt-4">
                    Present this ticket when redeeming your item
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button variant="outline" size="lg" onClick={() => setStep(3)}>
                <Edit className="w-5 h-5 mr-2" />
                Make Changes
              </Button>
              <Button size="lg" onClick={handleConfirmAndPrint} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Printer className="w-5 h-5 mr-2" />
                    Confirm & Print Ticket
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
