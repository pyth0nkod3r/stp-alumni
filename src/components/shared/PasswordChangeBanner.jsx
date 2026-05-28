"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Lock, Eye, EyeOff, AlertTriangle, CheckCircle } from "lucide-react";
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
  
  // Error states for each field
  const [oldPasswordError, setOldPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  
  // Validation state for password strength indicators
  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false
  });

  // Debounce timeouts
  const newPasswordTimeoutRef = useRef(null);
  const confirmPasswordTimeoutRef = useRef(null);

  // Handle route changes - stay on current page, don't navigate away
  useEffect(() => {
    if (!passwordChangeRequired) return;

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

  // Real-time validation functions
  const validateOldPassword = useCallback((value) => {
    if (!value) {
      setOldPasswordError(t("fillAllFields"));
      return false;
    }
    setOldPasswordError("");
    return true;
  }, [t]);

  const validatePasswordStrength = useCallback((password) => {
    const strength = {
      hasMinLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[@$!%*?&]/.test(password)
    };
    setPasswordStrength(strength);
    return strength;
  }, []);

  const validateNewPassword = useCallback((password, oldPwd = oldPassword) => {
    if (!password) {
      setNewPasswordError(t("fillAllFields"));
      return false;
    }
    
    if (password.length < 8) {
      setNewPasswordError(t("passwordMinLength"));
      return false;
    }
    
    if (password === oldPwd) {
      setNewPasswordError(t("passwordSameAsOld"));
      return false;
    }
    
    const strength = validatePasswordStrength(password);
    const isStrong = strength.hasMinLength && strength.hasUpperCase && 
                     strength.hasLowerCase && strength.hasNumber && strength.hasSpecialChar;
    
    if (!isStrong) {
      setNewPasswordError(t("passwordStrengthError"));
      return false;
    }
    
    setNewPasswordError("");
    return true;
  }, [oldPassword, t, validatePasswordStrength]);

  const validateConfirmPassword = useCallback((confirm, newPwd = newPassword) => {
    if (!confirm) {
      setConfirmPasswordError(t("fillAllFields"));
      return false;
    }
    
    if (confirm !== newPwd) {
      setConfirmPasswordError(t("passwordMismatch"));
      return false;
    }
    
    setConfirmPasswordError("");
    return true;
  }, [newPassword, t]);

  // Debounced validation for new password
  const debouncedValidateNewPassword = useCallback((value) => {
    if (newPasswordTimeoutRef.current) {
      clearTimeout(newPasswordTimeoutRef.current);
    }
    
    newPasswordTimeoutRef.current = setTimeout(() => {
      validateNewPassword(value);
    }, 500);
  }, [validateNewPassword]);

  // Debounced validation for confirm password
  const debouncedValidateConfirmPassword = useCallback((value) => {
    if (confirmPasswordTimeoutRef.current) {
      clearTimeout(confirmPasswordTimeoutRef.current);
    }
    
    confirmPasswordTimeoutRef.current = setTimeout(() => {
      validateConfirmPassword(value);
    }, 500);
  }, [validateConfirmPassword]);

  // Handle input changes with real-time validation
  const handleOldPasswordChange = (e) => {
    const value = e.target.value;
    setOldPassword(value);
    validateOldPassword(value);
  };

  const handleNewPasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    validatePasswordStrength(value);
    debouncedValidateNewPassword(value);
    
    // Also re-validate confirm password if it has a value
    if (confirmPassword) {
      debouncedValidateConfirmPassword(confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    debouncedValidateConfirmPassword(value);
  };

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (newPasswordTimeoutRef.current) {
        clearTimeout(newPasswordTimeoutRef.current);
      }
      if (confirmPasswordTimeoutRef.current) {
        clearTimeout(confirmPasswordTimeoutRef.current);
      }
    };
  }, []);

  const changePasswordMutation = useMutation({
    mutationFn: userService.changePassword,
    onSuccess: () => {
      toast.success(t("passwordChanged"));
      updateUser({ passwordChangeRequired: false });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setOldPasswordError("");
      setNewPasswordError("");
      setConfirmPasswordError("");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || t("passwordError");
      setOldPasswordError(errorMessage);
    },
  });

  const validateForm = () => {
    const isOldPasswordValid = validateOldPassword(oldPassword);
    const isNewPasswordValid = validateNewPassword(newPassword);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);
    
    return isOldPasswordValid && isNewPasswordValid && isConfirmPasswordValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      changePasswordMutation.mutate({ oldPassword, newPassword });
    }
  };
  
  if (!passwordChangeRequired) return null;

  // Password strength indicator component
  const PasswordStrengthIndicator = () => {
    const requirements = [
      { key: 'hasMinLength', label: t('minLength') || 'At least 8 characters' },
      { key: 'hasUpperCase', label: t('uppercase') || 'Uppercase letter' },
      { key: 'hasLowerCase', label: t('lowercase') || 'Lowercase letter' },
      { key: 'hasNumber', label: t('number') || 'Number' },
      { key: 'hasSpecialChar', label: t('specialChar') || 'Special character (@$!%*?&)' }
    ];

    return (
      <div className="mt-2 space-y-1">
        {requirements.map((req) => (
          <div key={req.key} className="flex items-center gap-2 text-xs">
            {passwordStrength[req.key] ? (
              <CheckCircle className="h-3 w-3 text-green-500" />
            ) : (
              <div className="h-3 w-3 rounded-full border border-gray-300" />
            )}
            <span className={passwordStrength[req.key] ? "text-green-600" : "text-gray-500"}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    );
  };

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
          <div className="bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header with warning */}
            <div className="flex items-center gap-3 p-6 pb-4 border-b border-amber-200 bg-amber-50/50 rounded-t-2xl sticky top-0 bg-white z-10">
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
                      onChange={handleOldPasswordChange}
                      placeholder={t("oldPasswordPlaceholder")}
                      disabled={changePasswordMutation.isPending}
                      className={`w-full pr-10 ${oldPasswordError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
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
                  {oldPasswordError && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {oldPasswordError}
                    </p>
                  )}
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
                      onChange={handleNewPasswordChange}
                      placeholder={t("newPasswordPlaceholder")}
                      disabled={changePasswordMutation.isPending}
                      className={`w-full pr-10 ${newPasswordError ? "border-red-500 focus-visible:ring-red-500" : newPassword ? "border-green-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  
                  {/* Password strength indicator */}
                  {newPassword && !newPasswordError && (
                    <PasswordStrengthIndicator />
                  )}
                  
                  {newPasswordError && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {newPasswordError}
                    </p>
                  )}
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
                      onChange={handleConfirmPasswordChange}
                      placeholder={t("confirmPasswordPlaceholder")}
                      disabled={changePasswordMutation.isPending}
                      className={`w-full pr-10 ${confirmPasswordError ? "border-red-500 focus-visible:ring-red-500" : confirmPassword && !confirmPasswordError ? "border-green-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {confirmPasswordError && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {confirmPasswordError}
                    </p>
                  )}
                  {confirmPassword && !confirmPasswordError && newPassword && (
                    <p className="mt-1 text-sm text-green-500 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      {t("passwordsMatch") || "Passwords match!"}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending || 
                           !oldPassword || 
                           !!newPasswordError || 
                           !!confirmPasswordError ||
                           !newPassword}
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