"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import userService from "@/lib/services/userService";
import { useMutation } from "@tanstack/react-query";
import useAuthStore from "@/lib/store/useAuthStore";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";

/**
 * Mandatory password change overlay that blocks content interaction
 * but keeps sidebar visible for logout functionality.
 */
export default function PasswordChangeOverlay() {
  const t = useTranslations("PasswordBanner");
  const router = useRouter();
  const passwordChangeRequired = useAuthStore((state) => state.passwordChangeRequired);
  const updateUser = useAuthStore((state) => state.updateUser);
  
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle route changes - stay on current page, don't navigate away
  useEffect(() => {
    if (!passwordChangeRequired) return;

    // Intercept navigation attempts
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = t("unsavedChanges");
      return t("unsavedChanges");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [passwordChangeRequired, t]);

  useEffect(() => {
    if (passwordChangeRequired) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [passwordChangeRequired]);

  const changePasswordMutation = useMutation({
    mutationFn: userService.changePassword,
    onSuccess: () => {
      toast.success(t("passwordChanged"));
      updateUser({ passwordChangeRequired: false });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || t("passwordError"));
    },
  });

const handleSubmit = (e) => {
  e.preventDefault();
  
  if (!oldPassword || !newPassword || !confirmPassword) {
    toast.error(t("fillAllFields"));
    return;
  }
  
  if (newPassword.length < 8) {
    toast.error(t("passwordMinLength"));
    return;
  }
  
  if (newPassword === oldPassword) {
    toast.error(t("passwordSameAsOld"));
    return;
  }
  
  if (newPassword !== confirmPassword) {
    toast.error(t("passwordMismatch"));
    return;
  }
  
  // Password strength validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(newPassword)) {
    toast.error(t("passwordStrengthError"));
    return;
  }
  
  changePasswordMutation.mutate({ oldPassword, newPassword });
};
  if (!passwordChangeRequired) return null;

  return (
    <>
      {/* Semi-transparent overlay - blocks content but not sidebar */}
      <div 
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        style={{ pointerEvents: "auto" }}
      />
      
      {/* Overlay Content - positioned to not cover the sidebar */}
      <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
        <div className="relative w-full max-w-lg mx-4 pointer-events-auto animate-in fade-in zoom-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl">
            {/* Header with warning */}
            <div className="flex items-center gap-3 p-6 pb-4 border-b border-amber-200 bg-amber-50/50 rounded-t-2xl">
              <div className="p-2 bg-amber-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-amber-900">
                  {t("mandatoryTitle") || "Password Change Required"}
                </h2>
                <p className="text-sm text-amber-700">
                  {t("mandatoryMessage") || "You must change your temporary password before continuing"}
                </p>
              </div>
            </div>

            {/* Password Change Form */}
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-[#155DFC]/10 rounded-lg">
                  <Lock className="h-5 w-5 text-[#155DFC]" />
                </div>
                <div>
                  <h3 className="text-md font-semibold text-gray-900">
                    {t("changePassword")}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {t("changePasswordDesc")}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="oldPassword" className="text-gray-700 mb-2 block">
                    {t("oldPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="oldPassword"
                      type={showOldPassword ? "text" : "password"}
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder={t("oldPasswordPlaceholder")}
                      disabled={changePasswordMutation.isPending}
                      className="w-full pr-10"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showOldPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="newPassword" className="text-gray-700 mb-2 block">
                    {t("newPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t("newPasswordPlaceholder")}
                      disabled={changePasswordMutation.isPending}
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-gray-700 mb-2 block">
                    {t("confirmPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t("confirmPasswordPlaceholder")}
                      disabled={changePasswordMutation.isPending}
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="w-full h-11 bg-[#155DFC] hover:bg-[#155DFC]/90 text-white mt-4"
                >
                  {changePasswordMutation.isPending ? t("updating") : t("updatePassword")}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}