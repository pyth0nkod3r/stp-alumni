"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams, useRouter } from "@/i18n/routing";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import authService from "@/lib/services/authService";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const t = useTranslations("ResetPassword");
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isResetSuccess, setIsResetSuccess] = useState(false);

  // 👇 Extract token from URL: /reset-password?token=xyz
  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
      // Auto-verify token on mount
      verifyMutation.mutate(urlToken);
    }
  }, [searchParams]);

  // 👇 Verify token mutation
  const verifyMutation = useMutation({
    mutationFn: authService.verifyResetToken,
    onSuccess: () => {
      setIsVerified(true);
      toast.success(t("tokenValid"));
    },
    onError: (error) => {
      console.error("Token verification error:", error);
      toast.error(error.response?.data?.message || t("tokenInvalid"));
      // Optional: redirect after delay
      setTimeout(() => router.push("/forgot-password"), 3000);
    },
  });

  // 👇 Reset password mutation
  const resetMutation = useMutation({
    mutationFn: () => authService.resetPassword(token, newPassword),
    onSuccess: () => {
      setIsResetSuccess(true);
      toast.success(t("passwordReset"));
    },
    onError: (error) => {
      console.error("Reset password error:", error);
      toast.error(error.response?.data?.message || t("resetError"));
    },
  });

  const handleReset = (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error(t("fillAllFields"));
      return;
    }
    if (newPassword.length < 8) {
      toast.error(t("passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t("passwordsMismatch"));
      return;
    }
    
    resetMutation.mutate();
  };

  // ✅ Loading / Verifying State
  if (verifyMutation.isPending && !isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 animate-spin rounded-full border-4 border-[#155DFC] border-t-transparent" />
          <p className="text-gray-600">{t("verifyingToken")}</p>
        </div>
      </div>
    );
  }

  // ✅ Invalid Token State
  if (verifyMutation.isError && !isVerified) {
    return (
      <div className="min-h-screen flex px-4 sm:px-6 lg:px-12 xl:px-16 gap-6 lg:gap-8">
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center pl-0 pr-4 py-8">
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            <Image
              src="/assets/Login.jpg"
              alt="Background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#155DFC]/30 to-[#155DFC]/60" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-6">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {t("invalidLink")}
            </h1>
            <p className="text-gray-600 mb-8">{t("linkExpired")}</p>
            <Button
              className="w-full h-11 bg-[#155DFC] hover:bg-[#155DFC]/90 text-white"
              onClick={() => router.push("/forgot-password")}
            >
              {t("requestNewLink")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Reset Success State
  if (isResetSuccess) {
    return (
      <div className="min-h-screen flex px-4 sm:px-6 lg:px-12 xl:px-16 gap-6 lg:gap-8">
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center pl-0 pr-4 py-8">
          <div className="relative w-full h-full rounded-2xl overflow-hidden">
            <Image
              src="/assets/Login.jpg"
              alt="Background"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#155DFC]/30 to-[#155DFC]/60" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-6">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {t("successTitle")}
            </h1>
            <p className="text-gray-600 mb-8">{t("successMessage")}</p>
            <Button
              className="w-full h-11 bg-[#155DFC] hover:bg-[#155DFC]/90 text-white"
              onClick={() => router.push("/login")}
            >
              {t("goToLogin")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Reset Form (Token Verified)
  return (
    <div className="min-h-screen flex px-4 sm:px-6 lg:px-12 xl:px-16 gap-6 lg:gap-8">
      {/* Left side - Image */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center pl-0 pr-4 py-8">
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
          <Image
            src="/assets/Login.jpg"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#155DFC]/30 to-[#155DFC]/60" />
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600 mb-8">{t("subtitle")}</p>

          <form onSubmit={handleReset} className="space-y-6">
            {/* New Password */}
            <div>
              <Label htmlFor="newPassword" className="text-gray-700 mb-2 block">
                {t("newPassword")}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t("newPasswordPlaceholder")}
                  className="w-full pl-10 pr-10"
                  minLength={8}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">{t("passwordHint")}</p>
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700 mb-2 block">
                {t("confirmPassword")}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t("confirmPasswordPlaceholder")}
                  className="w-full pl-10 pr-10"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-[#155DFC] hover:bg-[#155DFC]/90 text-white"
              disabled={resetMutation.isPending || !isVerified}
            >
              {resetMutation.isPending ? t("resetting") : t("resetPassword")}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            {t("rememberPassword")}{" "}
            <button
              onClick={() => router.push("/login")}
              className="text-[#155DFC] hover:underline font-medium"
            >
              {t("signIn")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}