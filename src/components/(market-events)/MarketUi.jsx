"use client";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowUpRight, Briefcase, GraduationCap, MapPin, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavbar } from "@/contexts/NavbarContext";
import { Link, usePathname } from "@/i18n/routing";
import Container from "../container";
import { useQuery } from "@tanstack/react-query";
import publicService from "@/lib/services/publicService";

export default function MarketplaceUi() {
  const t = useTranslations("Marketplace");
  const {
    size: { height },
  } = useNavbar();
  const pathname = usePathname();

  const isShow = pathname.includes("dashboard");

  // State for filters
  const [filters, setFilters] = useState({
    search: "",
    role: "all",
    sector: "all",
    location: "all",
    cohort: "all",
  });

  const updateFilter = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const getSectorDisplay = (sector) => {
    if (!sector || sector.length === 0) return "";
    
    const sectorMap = {
      it: "IT sector",
      healthcare: "Healthcare",
      finance: "Finance",
      education: "Education",
      telecommunications: "Telecommunications",
      "information technology": "Information Technology",
    };
    
    if (Array.isArray(sector)) {
      return sector.map(s => {
        const mapped = sectorMap[s.toLowerCase()];
        return mapped || s;
      }).join(", ");
    }
    
    return sectorMap[sector.toLowerCase()] || sector;
  };

  // Separate query for ALL data (for filters options)
  const { data: allData, isLoading: allDataLoading } = useQuery({
    queryKey: ["allMarketplaceData"],
    queryFn: () => publicService.getMarketplace({}),
    staleTime: 5 * 60 * 1000,
  });

  // Query for filtered data (used for display)
  const { data: marketplaceData, isLoading } = useQuery({
    queryKey: ["marketplace", filters],
    queryFn: () => {
      const params = {};

      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
      }

      if (filters.sector && filters.sector !== "all") {
        params.sector = filters.sector;
      }

      if (filters.location && filters.location !== "all") {
        params.location = filters.location;
      }

      if (filters.role && filters.role !== "all") {
        params.role = filters.role;
      }

      if (filters.cohort && filters.cohort !== "all") {
        params.cohort = filters.cohort;
      }

      return publicService.getMarketplace(params);
    },
  });
  
  // Extract unique sectors from ALL data
  const sectors = useMemo(() => {
    if (!allData?.data) return [];
    const allSectors = allData.data.map(ele => ele.sector).flat();
    return [...new Set(allSectors)].sort();
  }, [allData]);

  // Extract unique locations from ALL data
  const locations = useMemo(() => {
    if (!allData?.data) return [];
    const allLocations = allData.data.map(ele => ele.location).filter(Boolean);
    return [...new Set(allLocations)].sort();
  }, [allData]);

  // Extract unique cohorts from ALL data
  const cohorts = useMemo(() => {
    if (!allData?.data) return [];
    const allCohorts = allData.data.map(ele => ele.cohort).filter(Boolean);
    return [...new Set(allCohorts)].sort();
  }, [allData]);

  console.log(filters, "filters");


  const apiAlumni = marketplaceData?.data || [];

  return (
    <div
      className="min-h-screen p-3 sm:p-0"
      style={{ marginTop: `${height}px` }}
    >
      {isShow ? (
        <>
          <h1 className="text-3xl font-bold text-[#233389] mb-6">
            {t("title")}
          </h1>

          <MarketplaceContent
            t={t}
            filters={filters}
            updateFilter={updateFilter}
            data={apiAlumni}
            isLoading={isLoading}
            getSectorDisplay={getSectorDisplay}
            sectors={sectors}
            locations={locations}
            cohorts={cohorts}
            filtersLoading={allDataLoading}
          />
        </>
      ) : (
        <>
          <div className="bg-linear-to-l from-[#1B2F5B] to-[#3964C1] p-7 mb-5">
            <h1 className="text-2xl lg:text-3xl font-bold text-white text-center">
              {t("title")}
            </h1>
          </div>
          <Container className="mx-auto space-y-6">
            <MarketplaceContent
              t={t}
              filters={filters}
              updateFilter={updateFilter}
              sectors={sectors}
              locations={locations}
              cohorts={cohorts}
              filtersLoading={allDataLoading}
              data={apiAlumni}
              isLoading={isLoading}
              getSectorDisplay={getSectorDisplay}
            />
          </Container>
        </>
      )}
    </div>
  );
}

function MarketplaceContent({
  t,
  filters,
  updateFilter,
  data,
  isLoading,
  getSectorDisplay,
  sectors,
  locations,
  cohorts,
  filtersLoading
}) {
  // Clear all filters
  const clearAllFilters = () => {
    updateFilter("search", "");
    updateFilter("role", "all");
    updateFilter("sector", "all");
    updateFilter("location", "all");
    updateFilter("cohort", "all");
  };

  return (
    <>
      <div className="mb-6">
        <div className="relative mb-4">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder={t("searchPlaceholder")}
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="ps-10 h-12 w-full bg-transparent border border-[#233389] rounded-lg"
          />
        </div>

        <div className="flex flex-wrap items-end gap-6">
          <FilterSelect
            label={t("role")}
            value={filters.role}
            onValueChange={(v) => updateFilter("role", v)}
          >
            <SelectItem value="all">{t("roleAll")}</SelectItem>
            <SelectItem value="developer">{t("roleDeveloper")}</SelectItem>
            <SelectItem value="designer">{t("roleDesigner")}</SelectItem>
            <SelectItem value="manager">{t("roleManager")}</SelectItem>
          </FilterSelect>

          <FilterSelect
            label={t("sectorIndustry")}
            value={filters.sector}
            onValueChange={(v) => updateFilter("sector", v)}
          >
            <SelectItem value="all">{t("sectorAll")}</SelectItem>
            {filtersLoading ? (
              <SelectItem value="loading" disabled>{t("loading")}</SelectItem>
            ) : (
              sectors.map((ele) => (
                <SelectItem key={ele} value={ele.split(" ").join("_")}>
                  {ele}
                </SelectItem>
              ))
            )}
          </FilterSelect>
 
          <FilterSelect
            label={t("location")}
            value={filters.location}
            onValueChange={(v) => updateFilter("location", v)}
          >
            <SelectItem value="all">{t("locationAll")}</SelectItem>
            {filtersLoading ? (
              <SelectItem value="loading" disabled>{t("loading")}</SelectItem>
            ) : (
              locations.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  {loc}
                </SelectItem>
              ))
            )}
          </FilterSelect>
 
          <FilterSelect
            label={t("cohort")}
            value={filters.cohort}
            onValueChange={(v) => updateFilter("cohort", v)}
          >
            <SelectItem value="all">{t("cohortAll")}</SelectItem>
            {filtersLoading ? (
              <SelectItem value="loading" disabled>{t("loading")}</SelectItem>
            ) : (
              cohorts.map((cohort) => (
                <SelectItem key={cohort} value={cohort}>
                  {cohort}
                </SelectItem>
              ))
            )}
          </FilterSelect>
        </div>
 
        {/* Show active filters count */}
        {(filters.search || filters.role !== "all" || filters.sector !== "all" || 
          filters.location !== "all" || filters.cohort !== "all") && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {t("activeFilters")} 
              {filters.search && ` ${t("filterSearch")}: "${filters.search}"`}
              {filters.role !== "all" && ` ${t("filterRole")}: ${filters.role}`}
              {filters.sector !== "all" && ` ${t("filterSector")}: ${filters.sector}`}
              {filters.location !== "all" && ` ${t("filterLocation")}: ${filters.location}`}
              {filters.cohort !== "all" && ` ${t("filterCohort")}: ${filters.cohort}`}
            </span>
            <Button
              onClick={clearAllFilters}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700"
            >
              {t("clearAll")}
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg p-6 min-h-[300px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#233389]"></div>
          </div>
        ) : data && data.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.map((alumni, index) => (
              <AlumniCard
                key={alumni.createdAt || index}
                alumni={alumni}
                t={t}
                getSectorDisplay={getSectorDisplay}
              />
            ))}
          </div>
        ) : (
          <EmptyState onClear={clearAllFilters} />
        )}
      </div>
    </>
  );
}

// Sub-components
const FilterSelect = ({ label, value, onValueChange, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-fit min-w-[150px] h-11 border border-[#233389] rounded-md px-3 text-gray-700">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  </div>
);
function getSectorLabel(sector) {
  if (!sector) return null;
  if (Array.isArray(sector)) return sector.slice(0, 2).join(" · ");
  return sector;
}
 
function getInitials(firstName, lastName) {
  const f = firstName?.[0] || "";
  const l = lastName?.[0] || "";
  return (f + l).toUpperCase() || "??";
}

// ─── AlumniCard ───────────────────────────────────────────────────────────────
 
const AlumniCard = ({ alumni, t }) => {
  // ── Field mapping from real DTO ──────────────────────────────────────────
  const userId         = alumni.userId;
  const firstName      = alumni.firstName || "Alumni";
  const lastName       = alumni.lastName  || "";
  const fullName       = `${firstName} ${lastName}`.trim();
  const title          = alumni.title     || null;
  const sector         = getSectorLabel(alumni.sector);
  const location       = alumni.location  || null;
  const cohort         = alumni.cohort    || null;
  const imageSrc       = alumni.profileImagePath || alumni.image || "/assets/Profile Image.jpg";
  const initials       = getInitials(firstName, lastName);
 
  // Business / marketplace fields
  const companyName    = alumni.companyName    || null;
  const elevatorPitch  = alumni.elevatorPitch  || null;
  const offers         = Array.isArray(alumni.offers) ? alumni.offers.slice(0, 2) : null;
  const needs          = Array.isArray(alumni.needs)  ? alumni.needs.slice(0, 2)  : null;
  const hasMarketplace = companyName || offers?.length || needs?.length;
 
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#155DFC]/20 transition-all duration-200 flex flex-col overflow-hidden">
 
      {/* ── Top: Identity ──────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center p-6 pb-4 text-center">
 
        {/* Avatar */}
        <div className="relative w-20 h-20 mb-3 shrink-0">
          <Image
            src={imageSrc}
            alt={fullName}
            fill
            className="object-cover rounded-full border-2 border-white shadow-md"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          {/* Fallback initials shown via CSS if image fails */}
          <div className="absolute inset-0 rounded-full bg-[#155DFC] flex items-center justify-center text-white font-bold text-lg -z-10">
            {initials}
          </div>
        </div>
 
        {/* Name */}
        <h3 className="text-base font-bold text-gray-900 leading-tight">{fullName}</h3>
 
        {/* Title | Sector */}
        {(title || sector) && (
          <p className="text-xs text-gray-500 mt-0.5">
            {[title, sector].filter(Boolean).join(" · ")}
          </p>
        )}
 
        {/* Location + Cohort badges */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-3">
          {location && (
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2.5 py-0.5 rounded-full">
              <MapPin className="h-3 w-3 shrink-0" />
              {location}
            </span>
          )}
          {cohort && (
            <span className="inline-flex items-center gap-1 text-xs text-[#155DFC] bg-[#155DFC]/8 border border-[#155DFC]/15 px-2.5 py-0.5 rounded-full font-medium">
              <GraduationCap className="h-3 w-3 shrink-0" />
              {cohort}
            </span>
          )}
        </div>
      </div>
 
      {/* ── Middle: Marketplace strip (renders only when data exists) ──────── */}
      {hasMarketplace ? (
        <div className="mx-4 mb-3 rounded-xl bg-gray-50 border border-gray-100 px-4 py-3 space-y-2">
 
          {/* Company + pitch */}
          {companyName && (
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-3 w-3 text-gray-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-gray-700">{companyName}</span>
                {elevatorPitch && (
                  <p className="text-[11px] text-gray-400 leading-snug mt-0.5 line-clamp-2">{elevatorPitch}</p>
                )}
              </div>
            </div>
          )}
 
          {/* Offers */}
          {offers?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {offers.map((o) => (
                <span key={o} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
                  ↑ {o}
                </span>
              ))}
            </div>
          )}
 
          {/* Needs */}
          {needs?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {needs.map((n) => (
                <span key={n} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium">
                  ↓ {n}
                </span>
              ))}
            </div>
          )}
        </div>
      ) : ""}
 
      {/* ── Bottom: CTA ────────────────────────────────────────────────────── */}
      <div className="px-4 pb-5 mt-auto">
        <Link href={`/dashboard/profile/${userId}`} className="block w-full">
          <Button
            variant="outline"
            className="w-full rounded-full border-[#233389] text-[#233389] hover:bg-[#155DFC] hover:text-white hover:border-[#155DFC] transition-colors gap-1.5 text-sm"
          >
            {t("contact")}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
 
    </div>
  );
};

const EmptyState = ({ onClear }) => {
  const t = useTranslations("Marketplace");
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Users className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900">{t("noAlumniFound")}</h3>
      <p className="text-gray-500 mt-2">{t("adjustFilters")}</p>
      <Button
        onClick={onClear}
        variant="outline"
        className="mt-4 border-[#233389] text-[#233389]"
      >
        {t("clearAllFilters")}
      </Button>
    </div>
  );
};