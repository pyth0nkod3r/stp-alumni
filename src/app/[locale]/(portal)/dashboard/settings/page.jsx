"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";
import useAuthStore from "@/lib/store/useAuthStore";
import userService from "@/lib/services/userService";

import ProfileTab from "./ProfileTab";
import MyPostsTab from "./PostTab";
import SavedPostsTab from "./SavedPostsTab";
import SecurityTab from "./SecurityTab";
import PreferencesTab from "./PreferenceTab";

export const BUSINESS_MODELS = [
  "B2B", "B2C", "B2B2C", "Marketplace", "SaaS", "D2C", "Franchise",
  "Non-profit", "Social Enterprise", "Other",
];

export const COMPANY_STAGES = [
  "Idea / Pre-revenue", "MVP / Early traction", "1–10 employees",
  "10–50 employees", "50–200 employees", "200+ employees",
];

export const OFFER_TAGS = [
  "Fundraising advice", "Raising Series A", "Raising Seed", "Angel investing",
  "Technical Co-founder", "Product strategy", "Go-to-market", "Sales & BD",
  "Marketing & Growth", "Legal & Compliance", "HR & Talent", "Finance & CFO",
  "Design & UX", "Operations", "Mentorship", "Customer introductions",
];

export const NEED_TAGS = [
  "Technical Co-founder", "Fundraising", "Sales leads", "Strategic partnerships",
  "Marketing support", "Legal advice", "Hiring support", "Product feedback",
  "Design help", "Mentorship", "Investor introductions", "Market expansion",
];

export const VISIBILITY_OPTIONS = [
  { value: "EVERYONE", label: "All Alumni", description: "Contact info visible to the entire STP community." },
  { value: "ADMIN_ONLY", label: "Admin Only", description: "Only programme admins can see your contact details." },
  { value: "CONNECTIONS_ONLY", label: "Connection Only", description: "Only connected users can see your contact details." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ─── Reusable: Tag Pill ───────────────────────────────────────────────────────

export function Tag({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[#155DFC]/40 text-[#155DFC] text-sm bg-[#155DFC]/5">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="ml-1 hover:text-red-500 transition-colors">×</button>
      )}
    </span>
  );
}

// ─── Reusable: Tag Selector (for Offers/Needs) ────────────────────────────────

export function TagSelector({ tags, selected, onToggle, max = 3, label, description }) {
  return (
    <div>
      <Label className="text-gray-700 mb-1 block">
        {label}{" "}
        {max && <span className="text-gray-400 font-normal text-xs">(up to {max})</span>}
      </Label>
      {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selected.includes(tag);
          const isDisabled = !isSelected && selected.length >= max;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => !isDisabled && onToggle(tag)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm border transition-all duration-150",
                isSelected && "bg-[#155DFC] border-[#155DFC] text-white",
                !isSelected && !isDisabled && "border-gray-200 text-gray-600 hover:border-[#155DFC] hover:text-[#155DFC] bg-white",
                isDisabled && "border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed",
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Reusable: Section Header ─────────────────────────────────────────────────

export function SectionHeader({ icon: Icon, title, subtitle, accent }) {
  return (
    <div className={cn("flex items-center gap-3 mb-6 pb-5 border-b", accent && "border-[#155DFC]/10")}>
      <div className="p-2 bg-[#155DFC]/8 rounded-xl">
        <Icon className="h-5 w-5 text-[#155DFC]" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Reusable: Immutable Field ────────────────────────────────────────────────

export function ImmutableField({ label, value, icon: Icon }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 uppercase tracking-wide">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </div>
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100">
        <span className="text-sm text-gray-700 flex-1">{value || "—"}</span>
        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-medium">LOCKED</span>
      </div>
    </div>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

export function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155DFC] focus-visible:ring-offset-2",
        checked ? "bg-[#155DFC]" : "bg-gray-200",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  );
}



export default function SettingsPage() {
  const t = useTranslations("Settings");
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["userProfile"],
    queryFn: userService.getProfile,
    staleTime: 5 * 60 * 1000,
  });

  const profile = profileData?.data || profileData || {};
  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";
  const initials = getInitials(displayName);

  return (
    <div className="p-3 sm:p-0">
      <h1 className="text-2xl lg:text-3xl font-bold text-[#233389] mb-6">
        {t("title")}
      </h1>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">{t("profileTab")}</TabsTrigger>
          <TabsTrigger value="posts">{t("myPostsTab")}</TabsTrigger>
          <TabsTrigger value="saved">Saved Posts</TabsTrigger>
          <TabsTrigger value="security">{t("securityTab")}</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab
            t={t}
            profile={profile}
            displayName={displayName}
            displayEmail={displayEmail}
            initials={initials}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="posts">
          <MyPostsTab t={t} />
        </TabsContent>

        <TabsContent value="saved">
          <SavedPostsTab t={t} />
        </TabsContent>

        <TabsContent value="security">
          <SecurityTab t={t} updateUser={updateUser} />
        </TabsContent>

        {/* New preferences tab */}
        <TabsContent value="preferences">
          <PreferencesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

