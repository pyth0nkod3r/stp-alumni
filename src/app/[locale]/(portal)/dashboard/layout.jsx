"use client";
import { useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import UserHeader from "../user-header";
import OnboardingGuard from "@/components/shared/OnboardingGuard";
import { usePathname } from "@/i18n/routing";
import useAuthStore from "@/lib/store/useAuthStore";
import PasswordChangeOverlay from "@/components/shared/PasswordChangeBanner";

export default function PortalLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const passwordChangeRequired = useAuthStore((state) => state.passwordChangeRequired);
  const pathname = usePathname()
  const isMessaging = pathname.includes("messaging")

  return (
    <OnboardingGuard>
      <div className="flex min-h-screen bg-[#E8ECF4]">
        <PasswordChangeOverlay />
        
        <Sidebar isCollapsed={isCollapsed} />

        <main 
          className={`relative flex-1 flex flex-col ${isMessaging ? "pb-20 md:pb-0":"pb-20"} transition-all duration-300 ${
            isCollapsed ? "lg:ml-20" : "lg:ml-60"
          } ml-0 ${passwordChangeRequired ? "pointer-events-none" : ""}`}
        >
          <UserHeader 
            toggleSidebar={() => setIsCollapsed(!isCollapsed)} 
            isCollapsed={isCollapsed} 
          />
          
          <div className={`flex-1 sm:p-4 lg:p-6 ${passwordChangeRequired ? "blur-sm" : ""}`}>
            {children}
          </div>
        </main>

        <MobileBottomNav />
      </div>
    </OnboardingGuard>
  );
}