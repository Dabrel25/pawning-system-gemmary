import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  AlertTriangle,
  CheckCircle,
  Search as SearchIcon,
  Loader2,
  UserX,
  Globe,
  FileWarning
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ScreeningResult {
  status: 'clear' | 'flagged' | 'blocked' | 'pending';
  details?: string;
}

interface ScreeningStepProps {
  customerName: string;
  onBack: () => void;
  onContinue: (results: {
    watchlistResult: ScreeningResult;
    pepResult: ScreeningResult;
    adverseMediaResult: ScreeningResult;
  }) => void;
}

export function ScreeningStep({ customerName, onBack, onContinue }: ScreeningStepProps) {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'pep' | 'adverse'>('watchlist');
  const [isSearching, setIsSearching] = useState(false);

  const [watchlistResult, setWatchlistResult] = useState<ScreeningResult>({ status: 'pending' });
  const [pepResult, setPepResult] = useState<ScreeningResult>({ status: 'pending' });
  const [adverseMediaResult, setAdverseMediaResult] = useState<ScreeningResult>({ status: 'pending' });

  const [watchlistNotes, setWatchlistNotes] = useState("");
  const [pepNotes, setPepNotes] = useState("");
  const [adverseNotes, setAdverseNotes] = useState("");

  const simulateSearch = async (type: 'watchlist' | 'pep' | 'adverse') => {
    setIsSearching(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate random result (90% clear for demo)
    const isRandom = Math.random();
    const result: ScreeningResult = isRandom > 0.1
      ? { status: 'clear' }
      : { status: 'flagged', details: 'Potential match found - requires manual review' };

    if (type === 'watchlist') setWatchlistResult(result);
    if (type === 'pep') setPepResult(result);
    if (type === 'adverse') setAdverseMediaResult(result);

    setIsSearching(false);
  };

  const setManualStatus = (type: 'watchlist' | 'pep' | 'adverse', status: ScreeningResult['status']) => {
    const result: ScreeningResult = { status };
    if (type === 'watchlist') setWatchlistResult(result);
    if (type === 'pep') setPepResult(result);
    if (type === 'adverse') setAdverseMediaResult(result);
  };

  const allCompleted =
    watchlistResult.status !== 'pending' &&
    pepResult.status !== 'pending' &&
    adverseMediaResult.status !== 'pending';

  const hasBlocked =
    watchlistResult.status === 'blocked' ||
    pepResult.status === 'blocked' ||
    adverseMediaResult.status === 'blocked';

  const getStatusIcon = (status: ScreeningResult['status']) => {
    switch (status) {
      case 'clear':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'flagged':
        return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'blocked':
        return <UserX className="w-5 h-5 text-error" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-dashed border-text-tertiary" />;
    }
  };

  const getStatusLabel = (status: ScreeningResult['status']) => {
    switch (status) {
      case 'clear': return 'Clear';
      case 'flagged': return 'Flagged';
      case 'blocked': return 'Blocked';
      default: return 'Pending';
    }
  };

  const tabs = [
    { id: 'watchlist' as const, label: 'Watchlist Check', icon: Shield, result: watchlistResult },
    { id: 'pep' as const, label: 'PEP Verification', icon: Globe, result: pepResult },
    { id: 'adverse' as const, label: 'Adverse Media', icon: FileWarning, result: adverseMediaResult },
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-heading font-semibold">Customer Screening</h2>
        <p className="text-text-secondary text-sm">
          Verify customer against watchlists, PEP databases, and adverse media
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer being screened */}
        <div className="bg-muted rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-text-tertiary">Screening customer</p>
            <p className="font-semibold text-text-primary">{customerName || "New Customer"}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-text-tertiary hover:text-text-secondary"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className="ml-2">{getStatusIcon(tab.result.status)}</span>
            </button>
          ))}
        </div>

        {/* Watchlist Tab */}
        {activeTab === 'watchlist' && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-text-primary mb-2">Suspicious Individuals Check</h3>
              <p className="text-sm text-text-secondary mb-4">
                Cross-reference customer against AMLC watchlists, sanctions lists, and internal flagged customers database.
              </p>

              <div className="flex items-center gap-3 mb-4">
                <Button
                  onClick={() => simulateSearch('watchlist')}
                  disabled={isSearching}
                  className="flex-1"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <SearchIcon className="w-4 h-4 mr-2" />
                  )}
                  Run Watchlist Search
                </Button>
              </div>

              {watchlistResult.status !== 'pending' && (
                <div className={cn(
                  "rounded-lg p-3 flex items-center gap-3",
                  watchlistResult.status === 'clear' && "bg-success/10",
                  watchlistResult.status === 'flagged' && "bg-warning/10",
                  watchlistResult.status === 'blocked' && "bg-error/10"
                )}>
                  {getStatusIcon(watchlistResult.status)}
                  <span className="font-medium">{getStatusLabel(watchlistResult.status)}</span>
                  {watchlistResult.details && (
                    <span className="text-sm text-text-secondary">- {watchlistResult.details}</span>
                  )}
                </div>
              )}
            </div>

            <FormField label="Screening Notes">
              <Textarea
                placeholder="Add any notes from watchlist screening..."
                value={watchlistNotes}
                onChange={(e) => setWatchlistNotes(e.target.value)}
                rows={3}
              />
            </FormField>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManualStatus('watchlist', 'clear')}
                className="text-success border-success/30"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark Clear
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManualStatus('watchlist', 'flagged')}
                className="text-warning border-warning/30"
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Flag for Review
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManualStatus('watchlist', 'blocked')}
                className="text-error border-error/30"
              >
                <UserX className="w-4 h-4 mr-1" />
                Block Customer
              </Button>
            </div>
          </div>
        )}

        {/* PEP Tab */}
        {activeTab === 'pep' && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-text-primary mb-2">Politically Exposed Person (PEP) Check</h3>
              <p className="text-sm text-text-secondary mb-4">
                Verify if customer or their close associates hold prominent public positions or political connections.
              </p>

              <div className="flex items-center gap-3 mb-4">
                <Button
                  onClick={() => simulateSearch('pep')}
                  disabled={isSearching}
                  className="flex-1"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <SearchIcon className="w-4 h-4 mr-2" />
                  )}
                  Run PEP Database Search
                </Button>
              </div>

              {pepResult.status !== 'pending' && (
                <div className={cn(
                  "rounded-lg p-3 flex items-center gap-3",
                  pepResult.status === 'clear' && "bg-success/10",
                  pepResult.status === 'flagged' && "bg-warning/10",
                  pepResult.status === 'blocked' && "bg-error/10"
                )}>
                  {getStatusIcon(pepResult.status)}
                  <span className="font-medium">{getStatusLabel(pepResult.status)}</span>
                  {pepResult.details && (
                    <span className="text-sm text-text-secondary">- {pepResult.details}</span>
                  )}
                </div>
              )}
            </div>

            <FormField label="PEP Verification Notes">
              <Textarea
                placeholder="Add any notes from PEP verification..."
                value={pepNotes}
                onChange={(e) => setPepNotes(e.target.value)}
                rows={3}
              />
            </FormField>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManualStatus('pep', 'clear')}
                className="text-success border-success/30"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Not a PEP
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManualStatus('pep', 'flagged')}
                className="text-warning border-warning/30"
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                PEP Identified
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManualStatus('pep', 'blocked')}
                className="text-error border-error/30"
              >
                <UserX className="w-4 h-4 mr-1" />
                High Risk - Block
              </Button>
            </div>
          </div>
        )}

        {/* Adverse Media Tab */}
        {activeTab === 'adverse' && (
          <div className="space-y-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-text-primary mb-2">Adverse Media Search</h3>
              <p className="text-sm text-text-secondary mb-4">
                Search news sources and media databases for negative coverage related to the customer
                (fraud, money laundering, criminal activities, etc.)
              </p>

              <div className="flex items-center gap-3 mb-4">
                <Button
                  onClick={() => simulateSearch('adverse')}
                  disabled={isSearching}
                  className="flex-1"
                >
                  {isSearching ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <SearchIcon className="w-4 h-4 mr-2" />
                  )}
                  Run Adverse Media Search
                </Button>
              </div>

              {adverseMediaResult.status !== 'pending' && (
                <div className={cn(
                  "rounded-lg p-3 flex items-center gap-3",
                  adverseMediaResult.status === 'clear' && "bg-success/10",
                  adverseMediaResult.status === 'flagged' && "bg-warning/10",
                  adverseMediaResult.status === 'blocked' && "bg-error/10"
                )}>
                  {getStatusIcon(adverseMediaResult.status)}
                  <span className="font-medium">{getStatusLabel(adverseMediaResult.status)}</span>
                  {adverseMediaResult.details && (
                    <span className="text-sm text-text-secondary">- {adverseMediaResult.details}</span>
                  )}
                </div>
              )}
            </div>

            <FormField label="Adverse Media Notes">
              <Textarea
                placeholder="Document any findings from adverse media search..."
                value={adverseNotes}
                onChange={(e) => setAdverseNotes(e.target.value)}
                rows={3}
              />
            </FormField>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManualStatus('adverse', 'clear')}
                className="text-success border-success/30"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                No Issues Found
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManualStatus('adverse', 'flagged')}
                className="text-warning border-warning/30"
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Concerns Found
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setManualStatus('adverse', 'blocked')}
                className="text-error border-error/30"
              >
                <UserX className="w-4 h-4 mr-1" />
                Block Customer
              </Button>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="border-t border-border pt-4">
          <h3 className="font-semibold text-text-primary mb-3">Screening Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            {tabs.map((tab) => (
              <div key={tab.id} className="bg-muted rounded-lg p-3 text-center">
                <div className="flex justify-center mb-2">{getStatusIcon(tab.result.status)}</div>
                <p className="text-xs text-text-tertiary">{tab.label}</p>
                <p className="font-medium text-sm">{getStatusLabel(tab.result.status)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onBack}>
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <Button
            onClick={() => onContinue({ watchlistResult, pepResult, adverseMediaResult })}
            disabled={!allCompleted || hasBlocked}
          >
            {hasBlocked ? (
              "Cannot Proceed - Customer Blocked"
            ) : !allCompleted ? (
              "Complete All Screenings"
            ) : (
              <>
                Continue to Item Details
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
