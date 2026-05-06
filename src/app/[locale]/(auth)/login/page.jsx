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
import useAuthStore from "@/lib/store/useAuthStore";
import { setRegisteredCookie } from "@/lib/auth-cookie";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const t = useTranslations("Login");
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const setLoginSession = useAuthStore((state) => state.login);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      const data = response?.data || response;
      const token = data?.token;

      // Build user object from the login response
      const user = {
        id: data?.userId,
        email: data?.email,
        name: data?.name,
        role: data?.role,
        isOnboarded: data?.isOnboarded ?? false,
        passwordChangeRequired: data?.passwordChangeRequired ?? false,
      };

      setLoginSession(user, token);
      setRegisteredCookie();
      toast.success(t("loginSuccess"));

      // Route based on onboarding state
      if (!user.isOnboarded) {
        router.push("/profile-setup");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error) => {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || t("loginError"));
    },
  });

  const handleLogin = (e) => {
    e.preventDefault();
    if (!emailAddress || !password) {
      toast.error(t("fillAllFields"));
      return;
    }
    loginMutation.mutate({ emailAddress, password });
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  return (
    <div className="min-h-screen flex px-4 sm:px-6 lg:px-12 xl:px-16 gap-6 lg:gap-8">
      {/* Left side - Image with gradient overlay */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center pl-0 pr-4 py-8">
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
          <Image
            src="/assets/Login.jpg"
            alt="Login background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#155DFC]/30 to-[#155DFC]/60" />
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-6">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("title")}
          </h1>
          <p className="text-gray-600 mb-8">{t("subtitle")}</p>

          {/* Email Input */}
          <div className="mb-4">
            <Label htmlFor="email" className="text-gray-700 mb-2 block">
              {t("email")}
            </Label>
            <Input
              id="email"
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="w-full"
            />
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <Label htmlFor="password" className="text-gray-700 mb-2 block">
              {t("password")}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end mb-6">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-[#155DFC] hover:text-[#155DFC]/80 hover:underline transition-colors"
            >
              {t("forgotPassword")}
            </button>
          </div>

          {/* Login Button */}
          <Button
            className="w-full h-11 bg-[#155DFC] hover:bg-[#155DFC]/90 text-white mb-6"
            onClick={handleLogin}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? t("loggingIn") : t("loginButton")}
          </Button>

          <p className="text-center text-sm text-gray-500">{t("inviteOnly")}</p>
        </div>
      </div>
    </div>
  );
}