import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Mail, Lock, Shield, ArrowRight, Loader2 } from "lucide-react";
import gemmaryLogo from "@/assets/gemmary_logo.jpg";

type LoginStep = "credentials" | "otp";

export default function Login() {
  const navigate = useNavigate();
  const [step, setStep] = useState<LoginStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    
    // Mock: Send OTP to email
    setStep("otp");
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);

    // Mock: Verify OTP (accept any 6-digit code for mockup)
    navigate("/");
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    // Show toast or notification
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <img
            src={gemmaryLogo}
            alt="Gemmary Logo"
            className="h-20 w-20 rounded-full mx-auto mb-4 object-cover shadow-lg"
          />
          <h1 className="font-heading font-bold text-3xl text-text-primary italic">
            Gemmary
          </h1>
          <p className="text-text-secondary mt-1">Pawnshop Management System</p>
        </div>

        <Card className="shadow-xl border-border">
          <CardHeader className="text-center pb-2">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-2">
              {step === "credentials" ? (
                <Lock className="w-6 h-6 text-primary" />
              ) : (
                <Shield className="w-6 h-6 text-primary" />
              )}
            </div>
            <h2 className="font-heading font-semibold text-xl text-text-primary">
              {step === "credentials" ? "Sign In" : "Two-Factor Authentication"}
            </h2>
            <p className="text-sm text-text-secondary">
              {step === "credentials"
                ? "Enter your credentials to access the system"
                : `Enter the 6-digit code sent to ${email}`}
            </p>
          </CardHeader>

          <CardContent className="pt-4">
            {step === "credentials" ? (
              <form onSubmit={handleCredentialSubmit} className="space-y-4">
                <FormField label="Email Address" required error={error && !email ? "Email is required" : undefined}>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                    <Input
                      type="email"
                      placeholder="you@gemmary.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </FormField>

                <FormField label="Password" required error={error && !password ? "Password is required" : undefined}>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                    <Input
                      type="password"
                      placeholder="********"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </FormField>

                {error && (
                  <p className="text-sm text-error text-center">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-xs text-text-tertiary text-center mt-4">
                  A verification code will be sent to your email for security
                </p>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={(value) => setOtp(value)}
                    maxLength={6}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {error && (
                  <p className="text-sm text-error text-center">{error}</p>
                )}

                <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Verify & Sign In
                </Button>

                <div className="text-center space-y-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="text-sm text-primary hover:underline disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Resend Code
                  </button>
                  <p className="text-xs text-text-tertiary">
                    Didn't receive the code? Check your spam folder
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  Back to Login
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-xs text-text-tertiary text-center mt-6">
          2024 Gemmary Pawnshop. All rights reserved.
        </p>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
            <AlertDialogDescription>
              This means that you would need to log in again with your credentials and receive a new verification code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setStep("credentials");
                setOtp("");
                setError("");
                setShowLogoutConfirm(false);
              }}
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
