import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { Check, ChevronsUpDown, ArrowLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Controller, useForm } from "react-hook-form";
import { TagSelector } from "./page";
import {
  BUSINESS_MODELS,
  COMPANY_STAGES,
  NEED_TAGS,
  OFFER_TAGS,
  VISIBILITY_OPTIONS,
} from "@/lib/data";
import userService from "@/lib/services/userService";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "@/i18n/routing";

export const businessInfoSchema = z.object({
  companyName: z.string().optional(),
  businessModel: z.string().optional(),
  companyStage: z.string().optional(),
  elevatorPitch: z.string().optional(),
  offers: z.array(z.string()).max(3).optional(),
  needs: z.array(z.string()).max(3).optional(),
  visibility: z.string().default("EVERYONE"),
  companyWebsite: z
    .string()
    .url("Enter a valid website URL")
    .optional()
    .nullable(),
});

function BusinessForm({
  updateUser,
  setStep,
  profileImage,
  personalForm,
  t,
  businessForm,
}) {
  const router = useRouter();
  const [businessModelOpen, setBusinessModelOpen] = useState(false);
  const [companyStageOpen, setCompanyStageOpen] = useState(false);
  const [hasWebsite, setHasWebsite] = useState(false);

  const [offerInput, setOfferInput] = useState("");
  const [needInput, setNeedInput] = useState("");
  const [offerOpen, setOfferOpen] = useState(false);
  const [needOpen, setNeedOpen] = useState(false);

  const filteredNeeds = NEED_TAGS.filter(
    (s) =>
      !businessForm.watch("needs").includes(s) &&
      s.toLowerCase().includes(needInput.toLowerCase()),
  );
  const filteredOffers = OFFER_TAGS.filter(
    (s) =>
      !businessForm.watch("offers").includes(s) &&
      s.toLowerCase().includes(offerInput.toLowerCase()),
  );

  const setupMutation = useMutation({
    mutationFn: userService.setupProfile,
    onSuccess: () => {
      updateUser({ isOnboarded: true });
      toast.success(t("setupSuccess"));
      router.push("/dashboard");
    },
    onError: (error) => {
      console.error("Profile setup error:", error);
      toast.error(error.response?.data?.message || t("setupError"));
    },
  });

  async function handleProfileImgSubmit(file) {
    if (!file) return null;

    try {
      const res = await userService.uploadProfileImage(file);
      if (res.status) {
        toast.success("Profile image updated!");

        const data = res.data?.data.avatarUrl;
        // console.log(data,"data",res.data.data.avatarUrl)
        return data;
      } else {
        toast.error(res.message || "Failed to upload profile image.");
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload profile image.");
      throw error;
    }
  }

  const handleSubmit = async () => {
    // const isValid = await businessForm.trigger();
    // if (!isValid) {
    //   toast.error(t("fillRequired"));
    //   return;
    // }

    const personalData = personalForm.getValues();
    const businessData = businessForm.getValues();

    if (hasWebsite && !businessData.companyWebsite) {
      toast.error(
        "Please enter your company website URL or toggle off the website option.",
      );
      return;
    }

    if (
      personalData.sectors.length === 0 ||
      !personalData.location ||
      personalData.skills.length === 0
    ) {
      toast.error(t("fillRequired"));
      return;
    }

    let uploadedImageUrl;
    if (profileImage) {
      uploadedImageUrl = await handleProfileImgSubmit(profileImage);
    }

    console.log(uploadedImageUrl, "uploadedImageUrl");

    // Prepare payload as JSON object
    const payload = {
      // Personal info
      sector: personalData.sectors,
      location: personalData.location,
      skills: personalData.skills,
      linkedInProfile: personalData.linkedInProfile,
      goals: personalData.goals,
      cohort: personalData.cohort,
      profile_image_path: uploadedImageUrl,
      title: personalData.title,

      // Business info
      companyName: businessData.companyName,
      businessModel: businessData.businessModel,
      companyStage: businessData.companyStage,
      elevatorPitch: businessData.elevatorPitch,
      offers: businessData.offers,
      needs: businessData.needs,
      contactVisibility: businessData.visibility,
      companyWebsite: businessData.companyWebsite,
    };

    // Remove undefined/null values
    Object.keys(payload).forEach((key) => {
      if (
        payload[key] === undefined ||
        payload[key] === null ||
        payload[key] === ""
      ) {
        delete payload[key];
      }
    });

    setupMutation.mutate(payload);

    console.log(payload, "payload");
  };
  return (
    <form className="space-y-4">
      {/* Company name */}
     <Controller
  name="companyName"
  control={businessForm.control}
  render={({ field }) => {
    const [charCount, setCharCount] = useState(0);
    const MAX_CHARS = 20;

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
      <div>
        <Label htmlFor="companyName" className="text-gray-700 mb-2 block">
          Company Name{" "}
          <span className="text-gray-400 font-normal text-xs">
            (optional • {MAX_CHARS} chars max)
          </span>
        </Label>
        
        <Input
          id="companyName"
          type="text"
          placeholder="e.g. Acme Inc."
          className={cn(
            charCount > MAX_CHARS * 0.8 && "border-amber-500",
            charCount === MAX_CHARS && "border-red-500",
          )}
          value={field.value || ""}
          onChange={handleChange}
          onBlur={field.onBlur}
          ref={field.ref}
          disabled={setupMutation.isPending}
          maxLength={MAX_CHARS}
        />
        
        {/* Compact counter with progress bar inline */}
        {field.value && field.value.length > 0 && (
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-0.5 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full transition-all duration-300 rounded-full",
                  charCount > MAX_CHARS * 0.8 && charCount < MAX_CHARS && "bg-amber-500",
                  charCount === MAX_CHARS && "bg-red-500",
                  charCount < MAX_CHARS * 0.8 && "bg-emerald-500",
                )}
                style={{ width: `${(charCount / MAX_CHARS) * 100}%` }}
              />
            </div>
            <span className={cn(
              "text-xs font-medium whitespace-nowrap",
              charCount > MAX_CHARS * 0.8 && charCount < MAX_CHARS && "text-amber-500",
              charCount === MAX_CHARS && "text-red-500",
              charCount < MAX_CHARS * 0.8 && "text-emerald-500",
            )}>
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        )}
        
        {/* Warning when approaching limit */}
        {field.value && 
          field.value.length > 0 && 
          charCount > MAX_CHARS * 0.8 && 
          charCount < MAX_CHARS && (
            <p className="text-xs text-amber-500 mt-1">
              {MAX_CHARS - charCount} characters remaining
            </p>
          )
        }
      </div>
    );
  }}
/>
      {/* Business Model */}
      <Controller
        name="businessModel"
        control={businessForm.control}
        render={({ field }) => (
          <div>
            <Label className="text-gray-700 mb-2 block">Business Model</Label>
            <Popover
              open={businessModelOpen}
              onOpenChange={setBusinessModelOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal"
                  disabled={setupMutation.isPending}
                >
                  <span className={cn(!field.value && "text-muted-foreground")}>
                    {field.value || "Select a model"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
              >
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {BUSINESS_MODELS.map((model) => (
                        <CommandItem
                          key={model}
                          value={model}
                          onSelect={() => {
                            field.onChange(model);
                            setBusinessModelOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === model
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {model}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}
      />

      {/* Company Stage */}
      <Controller
        name="companyStage"
        control={businessForm.control}
        render={({ field }) => (
          <div>
            <Label className="text-gray-700 mb-2 block">Company Stage</Label>
            <Popover open={companyStageOpen} onOpenChange={setCompanyStageOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between font-normal"
                  disabled={setupMutation.isPending}
                >
                  <span className={cn(!field.value && "text-muted-foreground")}>
                    {field.value || "Select stage"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-[--radix-popover-trigger-width] p-0"
                align="start"
              >
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {COMPANY_STAGES.map((stage) => (
                        <CommandItem
                          key={stage}
                          value={stage}
                          onSelect={() => {
                            field.onChange(stage);
                            setCompanyStageOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value === stage
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {stage}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        )}
      />

      {/* Elevator Pitch */}
      <Controller
        name="elevatorPitch"
        control={businessForm.control}
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
            <div className="space-y-1.5">
              <Label htmlFor="pitch" className="text-gray-700 block">
                Elevator Pitch{" "}
                <span className="text-gray-400 font-normal text-xs">
                  ({MAX_CHARS} characters max)
                </span>
              </Label>

              <div>
                <textarea
                  id="pitch"
                  placeholder="We help African SMEs access affordable trade finance through a mobile-first platform."
                  className={cn(
                    "flex min-h-[72px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
                    charCount > MAX_CHARS * 0.8 && "border-amber-500",
                    charCount === MAX_CHARS && "border-red-500",
                  )}
                  rows={2}
                  value={field.value || ""}
                  onChange={handleChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  disabled={setupMutation.isPending}
                  maxLength={MAX_CHARS}
                />

                {/* Progress bar */}
                {field.value && field.value.length > 0 && (
                  <div className="mt-1 h-0.5 bg-muted rounded-full overflow-hidden">
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

              {/* Character counter and warning */}
              <div className="flex items-center justify-between">
                {field.value &&
                  field.value.length > 0 &&
                  charCount > MAX_CHARS * 0.8 && (
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

      {/* Offers */}
      <Controller
        name="offers"
        control={businessForm.control}
        render={({ field }) => (
          <div>
            <Label className="text-gray-700 mb-2 block">
              What can you offer?{" "}
              <span className="text-xs text-gray-400">(Max 3)</span>
            </Label>
            <Popover open={offerOpen} onOpenChange={setOfferOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    placeholder="Type an offer or select from suggestions..."
                    value={offerInput}
                    onChange={(e) => {
                      setOfferInput(e.target.value);
                      if (e.target.value) setOfferOpen(true);
                    }}
                    onFocus={() => {
                      if (offerInput) setOfferOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && offerInput.trim()) {
                        e.preventDefault();
                        const trimmed = offerInput.trim();
                        if (
                          trimmed &&
                          !field.value?.includes(trimmed) &&
                          (field.value?.length || 0) < 3
                        ) {
                          field.onChange([...(field.value || []), trimmed]);
                          setOfferInput("");
                          setOfferOpen(false);
                        } else if ((field.value?.length || 0) >= 3) {
                          toast.error("Maximum 3 offers allowed");
                        }
                      }
                    }}
                  />
                </div>
              </PopoverTrigger>
              {filteredOffers.length > 0 && (
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0"
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {filteredOffers.slice(0, 8).map((offer) => (
                          <CommandItem
                            key={offer}
                            value={offer}
                            onSelect={() => {
                              if (
                                !field.value?.includes(offer) &&
                                (field.value?.length || 0) < 3
                              ) {
                                field.onChange([...(field.value || []), offer]);
                              } else if ((field.value?.length || 0) >= 3) {
                                toast.error("Maximum 3 offers allowed");
                              }
                              setOfferInput("");
                              setOfferOpen(false);
                            }}
                          >
                            {/* <Check
                              className={cn(
                                "mr-2 h-4 w-4"
                              )}
                            /> */}
                            {offer}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              )}
            </Popover>
            {field.value?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {field.value.map((offer, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[#155DFC] text-[#155DFC] text-sm bg-transparent"
                  >
                    {offer}
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
            <p className="text-xs text-muted-foreground mt-1">
              Skills and experience you can share with fellow alumni.
            </p>
          </div>
        )}
      />

      {/* Needs */}
      <Controller
        name="needs"
        control={businessForm.control}
        render={({ field }) => (
          <div>
            <Label className="text-gray-700 mb-2 block">
              What are you looking for?{" "}
              <span className="text-xs text-gray-400">(Max 3)</span>
            </Label>
            <Popover open={needOpen} onOpenChange={setNeedOpen}>
              <PopoverTrigger asChild>
                <div className="relative">
                  <Input
                    placeholder="Type a need or select from suggestions..."
                    value={needInput}
                    onChange={(e) => {
                      setNeedInput(e.target.value);
                      if (e.target.value) setNeedOpen(true);
                    }}
                    onFocus={() => {
                      if (needInput) setNeedOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && needInput.trim()) {
                        e.preventDefault();
                        const trimmed = needInput.trim();
                        if (
                          trimmed &&
                          !field.value?.includes(trimmed) &&
                          (field.value?.length || 0) < 3
                        ) {
                          field.onChange([...(field.value || []), trimmed]);
                          setNeedInput("");
                          setNeedOpen(false);
                        } else if ((field.value?.length || 0) >= 3) {
                          toast.error("Maximum 3 needs allowed");
                        }
                      }
                    }}
                  />
                </div>
              </PopoverTrigger>
              {filteredNeeds.length > 0 && (
                <PopoverContent
                  className="w-[--radix-popover-trigger-width] p-0"
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {filteredNeeds.slice(0, 8).map((need) => (
                          <CommandItem
                            key={need}
                            value={need}
                            onSelect={() => {
                              if (
                                !field.value?.includes(need) &&
                                (field.value?.length || 0) < 3
                              ) {
                                field.onChange([...(field.value || []), need]);
                              } else if ((field.value?.length || 0) >= 3) {
                                toast.error("Maximum 3 needs allowed");
                              }
                              setNeedInput("");
                              setNeedOpen(false);
                            }}
                          >
                            {/* <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                field.value?.includes(need)
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            /> */}
                            {need}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              )}
            </Popover>
            {field.value?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {field.value.map((need, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-[#155DFC] text-[#155DFC] text-sm bg-transparent"
                  >
                    {need}
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
            <p className="text-xs text-muted-foreground mt-1">
              Areas where you'd welcome support from the network.
            </p>
          </div>
        )}
      />

      {/* Company Website Toggle */}
      <div className="pt-2">
        <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white">
          <div>
            <p className="text-sm font-medium text-gray-800">Company Website</p>
            <p className="text-xs text-gray-500">
              Add a link to your company website
            </p>
          </div>
          <button
            type="button"
            onClick={() => setHasWebsite(!hasWebsite)}
            className={cn(
              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
              hasWebsite ? "bg-[#155DFC]" : "bg-gray-300",
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                hasWebsite ? "translate-x-6" : "translate-x-1",
              )}
            />
          </button>
        </div>
      </div>

      {hasWebsite && (
        <Controller
          name="companyWebsite"
          control={businessForm.control}
          render={({ field }) => (
            <div>
              <Label
                htmlFor="companyWebsite"
                className="text-gray-700 mb-2 block"
              >
                Website URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="companyWebsite"
                type="url"
                placeholder="https://yourcompany.com"
                {...field}
                disabled={setupMutation.isPending}
              />
              <p className="text-xs text-gray-400 mt-1">
                Include https:// or http://
              </p>
            </div>
          )}
        />
      )}

      {/* Visibility */}
      <div className="pt-2 border-t border-gray-100">
        <Label className="text-gray-700 mb-3 block">Contact Visibility</Label>
        <Controller
          name="visibility"
          control={businessForm.control}
          render={({ field }) => (
            <div className="space-y-2">
              {VISIBILITY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                    field.value === opt.value
                      ? "border-[#155DFC] bg-[#155DFC]/5"
                      : "border-gray-200 hover:border-gray-300 bg-white",
                  )}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={opt.value}
                    checked={field.value === opt.value}
                    onChange={() => field.onChange(opt.value)}
                    className="mt-0.5 accent-[#155DFC]"
                    disabled={setupMutation.isPending}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-500">{opt.description}</p>
                  </div>
                </label>
              ))}
            </div>
          )}
        />
      </div>

      <p className="text-xs text-gray-400 text-center">
        Profile details can be modified later in Settings.
      </p>

      <div className="flex gap-3 pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep(1)}
          disabled={setupMutation.isPending}
          className="flex-1 h-11"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={setupMutation.isPending}
          className="flex-1 h-11 bg-[#155DFC] hover:bg-[#155DFC]/90 text-white"
        >
          {setupMutation.isPending ? t("submitting") : "Complete Setup"}
          {!setupMutation.isPending && (
            <ChevronRight className="ml-2 h-4 w-4" />
          )}
        </Button>
      </div>
    </form>
  );
}

export default BusinessForm;
