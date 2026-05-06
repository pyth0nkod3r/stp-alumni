"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  ExternalLink,
  Target,
  Sparkles,
  Building2,
  Globe,
  MessageCircle,
  Users,
  TrendingUp,
  ArrowLeft,
  CheckCircle2,
  Handshake,
} from "lucide-react";
import { useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import userService from "@/lib/services/userService";
import React from "react";
import networkService from "@/lib/services/networkService";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useSendInvitation } from "@/lib/hooks/useMessagingQueries";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(firstName, lastName) {
  if (!firstName && !lastName) return "??";
  if (firstName && lastName) return (firstName[0] + lastName[0]).toUpperCase();
  if (firstName) return firstName[0]?.toUpperCase() || "?";
  return lastName?.[0]?.toUpperCase() || "?";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ children, className }) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 overflow-hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

function CardHeader({ icon: Icon, title, badge }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#155DFC]" />
        <span className="text-sm font-semibold text-gray-800">{title}</span>
      </div>
      {badge && (
        <span className="text-[10px] bg-[#155DFC]/10 text-[#155DFC] px-2 py-0.5 rounded-full font-semibold tracking-wide">
          {badge}
        </span>
      )}
    </div>
  );
}

function Pill({ label, variant = "blue" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm border",
        variant === "blue" &&
          "border-[#155DFC]/30 text-[#155DFC] bg-[#155DFC]/5",
        variant === "green" &&
          "border-emerald-200 text-emerald-700 bg-emerald-50",
        variant === "amber" && "border-amber-200 text-amber-700 bg-amber-50",
        variant === "gray" && "border-gray-200 text-gray-600 bg-gray-50",
      )}
    >
      {label}
    </span>
  );
}

function StatBadge({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-5 py-3">
      <span className="text-xl font-bold text-gray-900">{value || "—"}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ViewProfilePage({ params }) {
  const { slug } = React.use(params);

  const { data, isLoading } = useQuery({
    queryKey: ["profile", slug],
    queryFn: () => userService.getUserProfileById(slug),
  });

  // Extract the actual profile data from the API response
  const profile = data?.data || {};

  const router = useRouter();
  const initials = getInitials(profile.firstName, profile.lastName);
  const fullName = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .join(" ");

  // Format contact visibility for display
  const getVisibilityLabel = (visibility) => {
    switch (visibility) {
      case "EVERYONE":
        return "Visible to everyone";
      case "ALL_ALUMNI":
        return "Visible to alumni";
      default:
        return null;
    }
  };

  const queryClient = useQueryClient();

   const { mutate: sendInvitation, isPending: isSending } = useSendInvitation();

  const { mutate: connectToUser, isPending: isConnecting } = useMutation({
    mutationFn: (data) => networkService.connectToUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["network"] });
      queryClient.invalidateQueries({ queryKey: ["profile", slug] });
      toast.success("Connection request sent!");
    },
  });

  const isConnected = profile.connectionStatus === "ACCEPTED";
  const isPending = profile.connectionStatus === "PENDING";
  const isNotConnected = profile.connectionStatus === null;

  // Handle missing data gracefully
  const hasBusinessProfile =
    profile.companyName ||
    profile.elevatorPitch ||
    profile.businessModel ||
    profile.companyStage ||
    profile.offers?.length > 0 ||
    profile.needs?.length > 0;

  const handleConnect = () => connectToUser({ userId: profile.userId });

    const handleMessage = () => {
    sendInvitation({
      recipientId: profile.userId,
      shortMessage: "Hi, I'd like to connect with you!",
    });
  };
  // const handleMessage = () => console.log("TODO: message", profile.userId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#155DFC] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile || Object.keys(profile).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto" />
          <p className="mt-4 text-gray-600">Profile not found</p>
          <Button
            variant="outline"
            className="mt-4 border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Hero Banner ───────────────────────────────────────────────────── */}
      <div className="relative h-40  bg-linear-to-r from-[#4279d6] via-[#2b56a1] to-[#263e75] overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                strokeWidth="0.8"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/4 translate-x-1/4" />
        <div className="absolute top-4 left-1/2 w-40 h-40 rounded-full bg-white/5 -translate-x-3/4" />

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 md:left-6 flex items-center gap-1.5 text-white/80 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* ── Profile Identity ───────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-12 mb-6">
          <div className="flex items-end gap-4">
            <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-white shadow-xl shrink-0">
              <AvatarImage src={profile.profileImagePath} />
              <AvatarFallback className="bg-[#155DFC] text-white text-3xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="pb-1">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                {fullName || "Anonymous User"}
              </h1>
              {profile.title && (
                <p className="text-sm text-gray-500 mt-0.5">{profile.title}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {profile.cohort && (
                  <span className="text-xs bg-[#155DFC]/10 text-[#155DFC] px-2.5 py-0.5 rounded-full font-semibold">
                    {profile.cohort}
                  </span>
                )}
                {profile.contactVisibility && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600">
                    <CheckCircle2 className="h-3 w-3" />
                    {getVisibilityLabel(profile.contactVisibility)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 sm:pb-1 shrink-0">
            {isConnected && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMessage}
                disabled={isSending}
                className="gap-1.5 border-gray-200 cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                {isSending ? "Opening..." : "Message"}
              </Button>
            )}
            {isPending && (
              <Badge
                // onClick={handleMessage}
                className="gap-1.5 border-gray-200 p-2"
              >
                Pending
              </Badge>
            )}
            {isNotConnected && (
              <Button
                size="sm"
                onClick={handleConnect}
                disabled={isConnecting}
                className="gap-1.5 bg-[#155DFC] hover:bg-[#155DFC]/90 text-white"
              >
                <Handshake className="h-4 w-4" />
                Connect
              </Button>
            )}
          </div>
        </div>

        {/* ── Stats Row ─────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 mb-4 flex divide-x divide-gray-100">
          <StatBadge
            value={profile.connectionsCount || 0}
            label="Connections"
          />
          <StatBadge value={profile.postsCount} label="Posts" />
          <StatBadge
            value={profile.cohort ? `'${profile.cohort.slice(-2)}` : "—"}
            label="Cohort"
          />
        </div>

        {/* ── Main Grid ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-12">
          {/* Left column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Quick Info */}
            <SectionCard>
              <CardHeader icon={Globe} title="About" />
              <div className="p-5 space-y-3">
                {profile.goals && (
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <MessageCircle className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{profile.goals}</p>
                  </div>
                )}
                {profile.location && (
                  <div className="flex items-center gap-2.5 text-sm text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
                    {profile.location}
                  </div>
                )}
                {profile.sector?.length > 0 && (
                  <div className="flex items-start gap-2.5 text-sm text-gray-700">
                    <Briefcase className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                    <span>{profile.sector.join(" · ")}</span>
                  </div>
                )}
                {profile.linkedin && (
                  <a
                    href={
                      profile.linkedin.startsWith("http")
                        ? profile.linkedin
                        : `https://${profile.linkedin}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-[#155DFC] hover:underline"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    LinkedIn Profile
                  </a>
                )}
                {profile.companyWebsite && (
                  <a
                    href={
                      profile.companyWebsite.startsWith("http")
                        ? profile.companyWebsite
                        : `https://${profile.companyWebsite}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 text-sm text-[#155DFC] hover:underline"
                  >
                    <Globe className="h-4 w-4 shrink-0" />
                    Company Website
                  </a>
                )}
              </div>
            </SectionCard>

            {/* Skills */}
            {profile.skills?.length > 0 && (
              <SectionCard>
                <CardHeader icon={Sparkles} title="Skills" />
                <div className="p-5 flex flex-wrap gap-2">
                  {profile.skills.map((s) => (
                    <Pill key={s} label={s} variant="gray" />
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Expansion Interests (replaces Goals) */}
            {profile.expansionInterests && (
              <SectionCard>
                <CardHeader icon={Target} title="Expansion Interests" />
                <div className="p-5">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {profile.expansionInterests}
                  </p>
                </div>
              </SectionCard>
            )}
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Business Profile - Only show if any business data exists */}
            {hasBusinessProfile && (
              <SectionCard>
                <CardHeader
                  icon={Building2}
                  title="Business Profile"
                  badge="Marketplace"
                />
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                    <div>
                      {profile.companyName && (
                        <h2 className="text-lg font-bold text-gray-900">
                          {profile.companyName}
                        </h2>
                      )}
                      {profile.elevatorPitch && (
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed max-w-md">
                          {profile.elevatorPitch}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      {profile.businessModel && (
                        <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 font-medium">
                          {profile.businessModel}
                        </span>
                      )}
                      {profile.companyStage && (
                        <span className="text-xs px-3 py-1 rounded-full bg-[#155DFC]/10 text-[#155DFC] border border-[#155DFC]/20 font-medium">
                          {profile.companyStage}
                        </span>
                      )}
                    </div>
                  </div>

                  {(profile.offers?.length > 0 ||
                    profile.needs?.length > 0) && (
                    <>
                      <div className="border-t border-gray-100 pt-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          {profile.offers?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2.5">
                                Can offer
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {profile.offers.map((o) => (
                                  <Pill key={o} label={o} variant="green" />
                                ))}
                              </div>
                            </div>
                          )}

                          {profile.needs?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2.5">
                                Looking for
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {profile.needs.map((n) => (
                                  <Pill key={n} label={n} variant="amber" />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </SectionCard>
            )}

            {/* Activity placeholder - TODO: Replace with real posts data */}
            <SectionCard>
              <CardHeader icon={TrendingUp} title="Recent Activity" />
              <div className="p-6">
                <p className="text-sm text-gray-500 text-center py-8">
                  No recent activity to display
                </p>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
