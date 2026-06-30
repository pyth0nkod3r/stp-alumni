import React, { useEffect, useRef, useState } from "react";

import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Controller, useForm } from "react-hook-form";
import { SECTORS, SKILL_SUGGESTIONS } from "@/lib/constants/profileOptions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  CloudUpload,
  X,
  Check,
  ChevronsUpDown,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

function PersonalForm({
  t,
  setImagePreview,
  setProfileImage,
  imagePreview,
  setStep,
  personalForm,
}) {
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(true);

  const [sectorOpen, setSectorOpen] = useState(false);
  const [sectorInput, setSectorInput] = useState("");

  const [skillOpen, setSkillOpen] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const [locationOpen, setLocationOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const filteredCountries = locationSearch
    ? countries.filter((c) =>
        c.toLowerCase().includes(locationSearch.toLowerCase()),
      )
    : countries;

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data
          .map((c) => c.name.common)
          .sort((a, b) => a.localeCompare(b));
        setCountries(sorted);
      })
      .catch(() => {
        setCountries([
          "Benin",
          "Cameroon",
          "Canada",
          "Côte d'Ivoire",
          "France",
          "Gabon",
          "Germany",
          "Ghana",
          "Kenya",
          "Nigeria",
          "Rwanda",
          "Senegal",
          "South Africa",
          "Togo",
          "United Kingdom",
          "United States",
        ]);
      })
      .finally(() => setCountriesLoading(false));
  }, []);

  const filteredSkills = SKILL_SUGGESTIONS.filter(
    (s) =>
      !personalForm.watch("skills").includes(s) &&
      s.toLowerCase().includes(skillInput.toLowerCase()),
  );
  const filteredSectors = SECTORS.filter(
    (s) =>
      !personalForm.watch("sectors").includes(s) &&
      s.toLowerCase().includes(skillInput.toLowerCase()),
  );

  const profileImageInputRef = useRef(null);
  const handleProfileImageClick = () => profileImageInputRef.current?.click();
  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setProfileImage(null);
    setImagePreview(null);
  };

  const handleNextStep = async () => {
    const isValid = await personalForm.trigger();
    if (isValid) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error(t("fillRequired"));
    }
  };

  return (
    <form className="space-y-4">
      {/* Upload Profile Image */}
      <div>
        <Label className="text-gray-700 mb-2 block">
          {t("uploadProfileImage")}
        </Label>
        <input
          type="file"
          ref={profileImageInputRef}
          onChange={handleProfileImageChange}
          accept="image/*"
          className="hidden"
        />
        {imagePreview ? (
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#155DFC] shrink-0">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Looking great!
              </p>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="text-xs text-red-500 hover:text-red-700 mt-1 flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Remove photo
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={handleProfileImageClick}
            className="border border-dashed border-[#155DFC]/40 rounded-xl p-6 text-center cursor-pointer hover:bg-[#155DFC]/5 transition-colors"
          >
            <CloudUpload className="w-7 h-7 mx-auto mb-2 text-[#155DFC]" />
            <p className="text-sm text-gray-500">{t("clickToUpload")}</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
          </div>
        )}
      </div>

      {/* Job Title */}
      <Controller
        name="title"
        control={personalForm.control}
        render={({ field }) => (
          <div>
            <Label htmlFor="title" className="text-gray-700 mb-2 block">
              Job Title
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="e.g. Co-founder & CEO"
              {...field}
            />
          </div>
        )}
      />

      {/* Cohort */}
      <Controller
        name="cohort"
        control={personalForm.control}
        render={({ field }) => (
          <div>
            <Label htmlFor="cohort" className="text-gray-700 mb-2 block">
              {t("cohort")}
            </Label>
            <Input
              id="cohort"
              type="text"
              placeholder={t("cohortPlaceholder")}
              {...field}
            />
          </div>
        )}
      />

      {/* Location */}
      <Controller
        name="location"
        control={personalForm.control}
        render={({ field }) => (
          <div>
            <Label className="text-gray-700 mb-2 block">
              {t("location")} <span className="text-red-500">*</span>
            </Label>
            <Popover open={locationOpen} onOpenChange={setLocationOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal"
                  disabled={countriesLoading}
                >
                  <span className={cn(!field.value && "text-muted-foreground")}>
                    {field.value ||
                      (countriesLoading
                        ? t("loadingCountries")
                        : t("locationPlaceholder"))}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
              >
                <Command>
                  <CommandInput
                    placeholder={t("locationSearch")}
                    value={locationSearch}
                    onValueChange={setLocationSearch}
                  />
                  <CommandList>
                    <CommandEmpty>{t("noResults")}</CommandEmpty>
                    <CommandGroup>
                      {filteredCountries.map((country) => (
                        <CommandItem
                          key={country}
                          value={country}
                          onSelect={() => {
                            field.onChange(country);
                            setLocationOpen(false);
                            setLocationSearch("");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === country
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {country}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {personalForm.formState.errors.location && (
              <p className="text-red-500 text-xs mt-1">
                {personalForm.formState.errors.location.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Sector */}
      <Controller
        name="sectors"
        control={personalForm.control}
        render={({ field }) => (
          <div>
            <Label className="text-gray-700 mb-2 block">
              {t("sector")} <span className="text-red-500">*</span>
            </Label>
            <Popover open={sectorOpen} onOpenChange={setSectorOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    placeholder={t("sectorPlaceholder")}
                    value={sectorInput}
                    onChange={(e) => {
                      setSectorInput(e.target.value);
                      if (e.target.value) setSectorOpen(true);
                    }}
                    onFocus={() => {
                      if (sectorInput) setSectorOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && sectorInput.trim()) {
                        e.preventDefault();
                        const trimmed = sectorInput.trim();
                        if (trimmed && !field.value.includes(trimmed)) {
                          field.onChange([...field.value, trimmed]);
                          setSectorInput("");
                          setSectorOpen(false);
                        }
                      }
                    }}
                  />
                </div>
              </PopoverTrigger>
              {filteredSectors.length > 0 && (
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0"
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {filteredSectors.slice(0, 8).map((sector) => (
                          <CommandItem
                            key={sector}
                            value={sector}
                            onSelect={() => {
                              if (!field.value.includes(sector)) {
                                field.onChange([...field.value, sector]);
                              }
                              setSectorInput("");
                              setSectorOpen(false);
                            }}
                          >
                            {/* <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          field.value.includes(sector) ? "opacity-100" : "opacity-0"
                        )}
                      /> */}
                            {sector}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              )}
            </Popover>
            {field.value.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {field.value.map((sector, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[#155DFC] text-[#155DFC] text-sm bg-transparent"
                  >
                    {sector}
                    <button
                      type="button"
                      onClick={() =>
                        field.onChange(
                          field.value.filter((_, i) => i !== index),
                        )
                      }
                      className="ml-1 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      />
      {/* Skills */}
      <Controller
        name="skills"
        control={personalForm.control}
        render={({ field }) => (
          <div>
            <Label className="text-gray-700 mb-2 block">
              {t("skills")} <span className="text-red-500">*</span>
            </Label>
            <Popover open={skillOpen} onOpenChange={setSkillOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    placeholder={t("skillsPlaceholder")}
                    value={skillInput}
                    onChange={(e) => {
                      setSkillInput(e.target.value);
                      if (e.target.value) setSkillOpen(true);
                    }}
                    onFocus={() => {
                      if (skillInput) setSkillOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && skillInput.trim()) {
                        e.preventDefault();
                        const trimmed = skillInput.trim();
                        if (trimmed && !field.value.includes(trimmed)) {
                          field.onChange([...field.value, trimmed]);
                          setSkillInput("");
                          setSkillOpen(false);
                        }
                      }
                    }}
                  />
                </div>
              </PopoverTrigger>
              {filteredSkills.length > 0 && (
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0"
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {filteredSkills.slice(0, 8).map((skill) => (
                          <CommandItem
                            key={skill}
                            value={skill}
                            onSelect={() => {
                              if (!field.value.includes(skill)) {
                                field.onChange([...field.value, skill]);
                              }
                              setSkillInput("");
                              setSkillOpen(false);
                            }}
                          >
                            {skill}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              )}
            </Popover>
            {field.value.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {field.value.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[#155DFC] text-[#155DFC] text-sm bg-transparent"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() =>
                        field.onChange(
                          field.value.filter((_, i) => i !== index),
                        )
                      }
                      className="ml-1 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      />

      {/* LinkedIn */}
      <Controller
        name="linkedInProfile"
        control={personalForm.control}
        render={({ field }) => (
          <div>
            <Label htmlFor="linkedin" className="text-gray-700 mb-2 block">
              {t("linkedin")} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="linkedin"
              type="url"
              placeholder={t("linkedinPlaceholder")}
              {...field}
            />
            {personalForm.formState.errors.linkedInProfile && (
              <p className="text-red-500 text-xs mt-1">
                {personalForm.formState.errors.linkedInProfile.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Goals */}
    <Controller
  name="goals"
  control={personalForm.control}
  render={({ field }) => {
    const [charCount, setCharCount] = useState(0);
    const MAX_CHARS = 100;

    const handleChange = (e) => {
      const value = e.target.value;
      if (value.length > MAX_CHARS) {
        const truncated = value.slice(0, MAX_CHARS);
        field.onChange(truncated);
        setCharCount(MAX_CHARS);
      } else {
        field.onChange(value);
        setCharCount(value.length);
      }
    };

    return (
      <div className="space-y-2">
        <Label htmlFor="goals" className="text-gray-700 mb-2 block">
          {t("goals")} <span className="text-red-500">*</span>
        </Label>
        
        <div>
          <textarea
            id="goals"
            placeholder={t("goalsPlaceholder")}
            className={cn(
              "flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
              charCount > MAX_CHARS * 0.8 && "border-amber-500",
              charCount === MAX_CHARS && "border-red-500",
            )}
            rows={3}
            value={field.value || ""}
            onChange={handleChange}
            onBlur={field.onBlur}
            ref={field.ref}
            maxLength={MAX_CHARS}
          />

          {/* Progress bar - now using margin instead of absolute */}
          {field.value && field.value.length > 0 && (
            <div className="mt-1.5 h-0.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300 rounded-full",
                  charCount > MAX_CHARS * 0.8 &&
                    charCount < MAX_CHARS &&
                    "bg-amber-500",
                  charCount === MAX_CHARS && "bg-red-500",
                  charCount < MAX_CHARS * 0.8 && "bg-emerald-500",
                )}
                style={{ width: `${(charCount / MAX_CHARS) * 100}%` }}
              />
            </div>
          )}
        </div>

        {/* Character counter - using flex layout */}
        <div className="flex items-center justify-between">
          {field.value && field.value.length > 0 && charCount > MAX_CHARS * 0.8 && (
            <span
              className={cn(
                "text-xs",
                charCount === MAX_CHARS
                  ? "text-red-500 font-medium"
                  : "text-amber-500",
              )}
            >
              {charCount === MAX_CHARS
                ? "⚠️ Character limit reached"
                : `${MAX_CHARS - charCount} characters remaining`}
            </span>
          )}
          
          {field.value && field.value.length > 0 && (
            <span
              className={cn(
                "text-xs font-medium ml-auto",
                charCount > MAX_CHARS * 0.8 &&
                  charCount < MAX_CHARS &&
                  "text-amber-500",
                charCount === MAX_CHARS && "text-red-500",
                charCount < MAX_CHARS * 0.8 && "text-emerald-500",
              )}
            >
              {charCount}/{MAX_CHARS}
            </span>
          )}
        </div>
      </div>
    );
  }}
/>


      <p className="text-xs text-gray-400 text-center pt-1">
        Profile details can be modified later in Settings.
      </p>

      <Button
        type="button"
        onClick={handleNextStep}
        className="w-full h-11 bg-[#155DFC] hover:bg-[#155DFC]/90 text-white"
      >
        Continue to Business Details
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}

export default PersonalForm;
