"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import useAuthStore from "@/lib/store/useAuthStore";

/**
 * Client-side guard that redirects un-onboarded users to profile-setup.
 * Wrap around dashboard content.
 */
export default function OnboardingGuard({ children }) {
  const router = useRouter();
  const isOnboarded = useAuthStore((state) => state.isOnboarded);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated && !isOnboarded) {
      router.replace("/profile-setup");
    }
  }, [isAuthenticated, isOnboarded, router]);

  // While redirecting, don't flash dashboard content
  if (isAuthenticated && !isOnboarded) {
    return null;
  }

  return <>{children}</>;
}
