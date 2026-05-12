"use client";
import { Home, Users, ShoppingBag, Newspaper, Calendar, Briefcase, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/routing";
import { useSize } from "react-haiku";
import { useNavbar } from "@/contexts/NavbarContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useRef } from "react";

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Users, label: "Network", href: "/dashboard/network" },
  { icon: ShoppingBag, label: "Market Place", href: "/dashboard/marketplace" },
  { icon: Briefcase, label: "Deal Room", href: "/dashboard/deal-room" },
  { icon: Newspaper, label: "Feed", href: "/dashboard/newsfeed" },
  { icon: Calendar, label: "Events", href: "/dashboard/events" },
  { icon: BookOpen, label: "Resources", href: "/dashboard/resources" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const elementRef = useRef(null);
  const { width, height } = useSize(elementRef);
  const { setMobileSize } = useNavbar();

  useEffect(() => {
    setMobileSize({ width, height });
  }, [width, height]);

  return (
   <TooltipProvider delayDuration={200}>
  <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border lg:hidden" ref={elementRef}>
    {/* <div className="flex items-center justify-around h-16"> */}
    <div className="flex items-center justify-between h-16 overflow-x-auto scrollbar-hide px-2 gap-1">
      {navItems.map((item) => {
        const isActive =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href);

        return (
          <Tooltip key={item.label}>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                className={cn(
                 "flex flex-col items-center justify-center gap-1 min-w-[64px] h-full transition-colors shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                <item.icon
                  className={cn("h-5 w-5", isActive && "fill-primary/20")}
                />
                <span className="hidden sm:block text-[10px] font-medium whitespace-nowrap">
                  {item.label}
                </span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#1e293b] text-white text-xs font-medium py-1.5 px-3 rounded-md border-0">
              {item.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  </nav>
</TooltipProvider>
  );
}
