"use client";
import { useState } from "react";
import Image from "next/image";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import useAuthStore from "@/lib/store/useAuthStore";
import {
  Home,
  Users,
  MessageSquare,
  BookOpen,
  Newspaper,
  ShoppingBag,
  Calendar,
  Briefcase,
  Settings,
  LogOut,
} from "lucide-react";

/**
 * Sidebar component for the dashboard and portal pages
 * @returns {JSX.Element}
 */
const Sidebar = ({ isCollapsed }) => {
  const t = useTranslations("Sidebar");
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const [isHovered, setIsHovered] = useState(false);

  // It is "expanded" if the user hasn't collapsed it OR if they are hovering
  const isExpanded = !isCollapsed || isHovered;

  const navItems = [
    { label: t("dashboard"), href: "/dashboard", icon: Home },
    { label: t("network"), href: "/dashboard/network", icon: Users },
    {
      label: t("messaging"),
      href: "/dashboard/messaging",
      icon: MessageSquare,
    },
    { label: t("resources"), href: "/dashboard/resources", icon: BookOpen },
    { label: t("newsfeed"), href: "/dashboard/newsfeed", icon: Newspaper },
    {
      label: t("marketplace"),
      href: "/dashboard/marketplace",
      icon: ShoppingBag,
    },
    { label: t("events"), href: "/dashboard/events", icon: Calendar },
    { label: t("dealRoom"), href: "/dashboard/deal-room", icon: Briefcase },
  ];

  const bottomItems = [
    { label: t("settings"), href: "/dashboard/settings", icon: Settings },
  ];

  // const isActive = (href) => pathname.split("/").join(" ").startsWith(href) || pathname.includes(href);
  // console.log(pathname.split("/").length,"path")
  const isActive = (href) => {
    // Dashboard home: exact match only
    if (href === "/dashboard") return pathname === "/dashboard";
    // All other items: match if pathname starts with the href
    return pathname.startsWith(href);
  };
  return (
    <aside
      onMouseEnter={() => isCollapsed && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed left-0 top-0 h-screen bg-[#1B2F5B] text-white transition-all duration-300 z-50 flex flex-col overflow-hidden ${isExpanded ? "w-60" : "w-20"
        } -translate-x-full lg:translate-x-0`}
    >
      {/* Logo - click goes to landing page */}
      <Link
        href="/dashboard"
        className={`flex items-center ${!isExpanded ? "ml-0 px-3" : "ml-6 px-6"}  gap-3  pt-6 pb-3`}
      >
        <Image
          src="/assets/logo-removebg-preview.png"
          alt="BlazingTorrent"
          width={75}
          height={50}
          className={`object-contain object-left opacity-100 ${isExpanded ? "max-w-50" : "max-w-12"}`}
          style={{ width: "auto", height: "auto" }}
          priority
        />
      </Link>

      {/* Nav Items */}
      <nav className="flex-1 px-4 py-6 space-y-2  overflow-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={`${item.href}`}
              className={`flex items-center h-12 rounded-lg transition-all px-3 ${active
                  ? "bg-[#2B7FFF]/20 text-[#2B7FFF]"
                  : "text-white/70 hover:bg-white/5"
                }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span
                className={`ml-4 text-sm font-medium whitespace-nowrap transition-all duration-300 ${isExpanded
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-10"
                  }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-4 py-4 space-y-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center w-full py-3 rounded-lg transition-all ${active
                  ? "bg-[rgba(43,127,255,0.15)] text-[#155DFC]"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
            >
              <div className="flex items-center gap-3 w-45">
                <Icon
                  className={`h-5 w-5 shrink-0 ${active ? "text-[#155DFC]" : ""
                    }`}
                />
                <span
                  className={`text-sm font-medium ${isExpanded ? "block" : "hidden opacity-0"}`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}

        {/* Sign Out */}
        <button
          onClick={() => {
            logout();
            router.replace('/login');
          }}
          className="flex items-center justify-center w-full py-3 rounded-lg text-[#ED202D] hover:bg-white/5 transition-all"
        >
          <div className="flex items-center gap-3 w-45">
            <LogOut className="h-5 w-5 shrink-0" />
            <span
              className={`text-sm font-medium ${isExpanded ? "block" : "hidden opacity-0"}`}
            >
              {t("signOut")}
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
