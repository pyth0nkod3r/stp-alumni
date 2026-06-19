"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "@/i18n/routing";
import { useMutation } from "@tanstack/react-query";
import authService from "@/lib/services/authService";
import { toast } from "sonner";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword");
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const forgotMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success(t("emailSent"));
    },
    onError: (error) => {
      console.error("Forgot password error:", error);
      toast.error(error.response?.data?.message || t("error"));
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emailAddress) {
      toast.error(t("enterEmail"));
      return;
    }
    forgotMutation.mutate({ emailAddress });
  };

  // ✅ Success State
  if (isSubmitted) {
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
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#155DFC]/30 to-[#155DFC]/60" />
          </div>
        </div>

        {/* Right side - Success */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-6">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              {t("checkYourEmail")}
            </h1>
            <p className="text-gray-600 mb-8">
              {t("emailInstructions", { email: emailAddress })}
            </p>

            <Button
              variant="outline"
              className="w-full h-11 mb-4"
              onClick={() => router.push("/login")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToLogin")}
            </Button>

            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmailAddress("");
              }}
              className="text-sm text-[#155DFC] hover:underline"
            >
              {t("tryDifferentEmail")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Form State
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
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#155DFC]/30 to-[#155DFC]/60" />
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-6">
        <div className="w-full max-w-md">
          {/* Back Link */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-600 hover:text-[#155DFC] mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("back")}
          </button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600 mb-8">{t("subtitle")}</p>

          {/* Email Input */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-gray-700 mb-2 block">
                {t("email")}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className="w-full pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-[#155DFC] hover:bg-[#155DFC]/90 text-white"
              disabled={forgotMutation.isPending}
            >
              {forgotMutation.isPending ? t("sending") : t("sendResetLink")}
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
