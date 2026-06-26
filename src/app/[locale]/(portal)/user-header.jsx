"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import {
  MessageSquareMore,
  Bell,
  PanelLeftOpen,
  PanelLeftClose,
  Search,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileDrawer } from "@/components/ProfileDrawer";
import { useScreenSize } from "react-haiku";
import { useElementSize } from "@/lib/hooks/useElementSize";
import { useNavbar } from "@/contexts/NavbarContext";
import useAuthStore from "@/lib/store/useAuthStore";
import { useAuth } from "@/lib/hooks/useUser";
import FloatingSearch from "./dashboard/search/FloatingSearch";

/**
 * Get initials from a full name string
 * "Khalid Salman-Yusuf" → "KS"
 */
function getInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function UserHeader({ toggleSidebar, isCollapsed }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const elementRef = useRef(null);
  const { width, height } = useElementSize(elementRef);
  const { setUserSize } = useNavbar();

  const screenSize = useScreenSize()

  const router = useRouter();

  // Auth store data (from login response)
  const user = useAuthStore((state) => state.user);

  // Fetch full profile from API (gives us profileImagePath, sector, etc.)
  const { data: profileData } = useAuth();

  const profile = profileData?.data || profileData || {};
  // console.log(screen.toString(),"user",screen.toString())

  // Merge: login response gives name/email, profile API gives image/details
  const displayName = user?.name || profile?.name || "User";
  const displayEmail = user?.email || profile?.email || "";
  const displayImage =
    profile?.profileImagePath || user?.profileImagePath || null;
  const initials = getInitials(displayName);

  const headerData = {
    name: displayName,
    email: displayEmail,
    img: displayImage,
    initials,
  };

  useEffect(() => {
    setUserSize({ width, height });
  }, [width, height]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true); // 👈 Open floating search
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-30 w-full px-6 md:px-8 py-4 transition-all duration-300 flex items-center justify-between ${
          isScrolled
            ? "bg-[#E8ECF4]/60 backdrop-blur-md border-b border-white/20 shadow-sm"
            : "bg-[#E8ECF4] border-b border-transparent"
        }`}
        ref={elementRef}
      >
        {/* Mobile logo */}
        <Link
          href="/dashboard"
          className="flex lg:hidden items-center justify-center gap-3"
        >
          <Image
            src="/assets/logo-removebg-preview.png"
            alt="BlazingTorrent"
            width={screenSize.gt("md") ? 140 : 70}
            height={40}
            className="object-contain h-10"
            // style={{ width: "auto", height: "auto" }}
            priority
          />
        </Link>

        {/* Sidebar toggle (desktop) */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-500"
        >
          {isCollapsed ? (
            <PanelLeftOpen size={20} />
          ) : (
            <PanelLeftClose size={20} />
          )}
        </button>

        <div className="flex items-center justify-end">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="sm:p-3 rounded-full transition-all sm:bg-[#02061814] hover:bg-white/60 active:scale-95 sm:shadow-sm"
              title="Search (⌘K)"
            >
              <Search className="h-4 w-4 text-stp-blue-light" />
            </button>
            {/* Message Button */}
            <Link
              href={"/dashboard/messaging"}
              className="sm:p-3 rounded-full transition-all sm:bg-[#02061814] hover:bg-white/60 active:scale-95 sm:shadow-sm"
            >
              <MessageSquareMore className="h-4 w-4 text-stp-blue-light" />
            </Link>

            {/* Notification Button */}
            {/* <button className="p-3 rounded-full transition-all bg-[#02061814] hover:bg-white/60 active:scale-95 shadow-sm">
            <Bell className="h-4 w-4 md:h-6 md:w-6 text-[#020618]" />
          </button> */}

            {/* Mobile: ProfileDrawer trigger */}
            <ProfileDrawer data={headerData}>
              <button className="lg:hidden flex items-center gap-2 cursor-pointer min-w-0">
                <Avatar className="h-6 sm:h-10 w-6 sm:w-10 border-2 border-accent">
                  <AvatarImage src={headerData.img} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block max-w-[12rem]">
                  <h1 className="text-[#020618] font-semibold truncate">
                    {headerData.name}
                  </h1>
                  <p className="text-[#02061873] font-light text-sm truncate">
                    {headerData.email}
                  </p>
                </div>
              </button>
            </ProfileDrawer>

            {/* Desktop profile */}
            <div className="gap-1 items-center hidden lg:flex min-w-0">
              <Avatar className="h-10 w-10 border-2 border-accent">
                <AvatarImage src={headerData.img} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block max-w-[5rem]">
                <h1 className="text-[#020618] font-semibold truncate">
                  {headerData.name}
                </h1>
                <p className="text-[#02061873] font-light text-sm truncate">
                  {headerData.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
      <FloatingSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}

export default UserHeader;
