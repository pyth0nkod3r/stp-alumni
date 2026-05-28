"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { Label } from "@/components/ui/label";

import { Check, User, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import useAuthStore from "@/lib/store/useAuthStore";
import { cn } from "@/lib/utils";
import PersonalForm from "./PersonalForm";
import { sidePanelContent } from "@/lib/data";
import BusinessForm, { businessInfoSchema } from "./BusinessForm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

function StepIndicator({ currentStep }) {
  const steps = [
    { num: 1, icon: User, label: "Personal" },
    { num: 2, icon: Building2, label: "Business" },
  ];

  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = currentStep === step.num;
        const isDone = currentStep > step.num;

        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isActive &&
                    "bg-[#155DFC] border-[#155DFC] text-white shadow-lg shadow-[#155DFC]/30",
                  isDone && "bg-[#155DFC] border-[#155DFC] text-white",
                  !isActive &&
                    !isDone &&
                    "bg-white border-gray-200 text-gray-400",
                )}
              >
                {isDone ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium transition-colors",
                  isActive || isDone ? "text-[#155DFC]" : "text-gray-400",
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "w-16 h-0.5 mx-3 mb-5 transition-colors duration-500",
                  currentStep > step.num ? "bg-[#155DFC]" : "bg-gray-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function TagSelector({
  tags,
  selected,
  onToggle,
  max = 3,
  label,
  description,
}) {
  return (
    <div>
      <Label className="text-gray-700 mb-1 block">
        {label}{" "}
        {max && (
          <span className="text-gray-400 font-normal text-xs">
            (pick up to {max})
          </span>
        )}
      </Label>
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
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
                !isSelected &&
                  !isDisabled &&
                  "border-gray-200 text-gray-600 hover:border-[#155DFC] hover:text-[#155DFC] bg-white",
                isDisabled &&
                  "border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed",
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

export default function ProfileSetupPage() {
  const t = useTranslations("ProfileSetup");
  const router = useRouter();
  const isOnboarded = useAuthStore((state) => state.isOnboarded);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const updateUser = useAuthStore((state) => state.updateUser);

  const [step, setStep] = useState(1);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Personal form
  const personalForm = useForm({
    // defaultValues: {
    //   title: "CEO",
    //   cohort: "STP2026",
    //   location: "Ghana",
    //   sectors: ["test"],
    //   skills: ["test"],
    //   linkedInProfile:
    //     "https://downloadwella.com/bjbhoukaz72a/The.Originals.S01E19.(NKIRI.COM).mkv.html",
    //   goals: "hala madrid",
    // },
    defaultValues: {
      jobTitle: '',
      cohort: '',
      location: '',
      sectors: [],
      skills: [],
      linkedInProfile: '',
      goals: '',
    },
  });

    // Business form
    const businessForm = useForm({
      resolver: zodResolver(businessInfoSchema),
      // defaultValues: {
      //   companyName: "GFA",
      //   businessModel: "TEST",
      //   companyStage: "TEST",
      //   elevatorPitch: "TEST",
      //   offers: ["TEST"],
      //   needs: ["TEST"],
      //   visibility: "EVERYONE",
      //   companyWebsite: "",
      // },
      defaultValues: {
        companyName: "",
        businessModel: "",
        companyStage: "",
        elevatorPitch: "",
        offers: [],
        needs: [],
        visibility: "EVERYONE",
        companyWebsite: '',
      },
    });

  useEffect(() => {
    if (isAuthenticated && isOnboarded) {
      console.log("Already onboarded");

      router.push("/dashboard");
    }
  }, [isAuthenticated, isOnboarded, router]);

  const panel = sidePanelContent[step];

  return (
    <div className="h-screen flex overflow-hidden px-4 sm:px-6 lg:px-12 xl:px-16 gap-6 lg:gap-8">
      {/* Left side */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center pl-0 pr-4 py-8 sticky top-0 h-screen">
        <div className="relative w-full h-full rounded-2xl overflow-hidden">
          <Image
            src="/stp-20.jpg"
            alt="Profile setup background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-black/40 via-[#155DFC]/30 to-[#155DFC]/70" />
          <div className="absolute bottom-10 left-8 right-8 text-white">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-3">
              Step {step} of 2
            </p>
            <h2 className="text-2xl font-bold mb-2 leading-snug">
              {panel.title}
            </h2>
            <p className="text-white/80 text-sm mb-5">{panel.subtitle}</p>
            <ul className="space-y-2">
              {panel.bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-2 text-sm text-white/90"
                >
                  <Check className="h-4 w-4 text-white/60 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-start justify-center bg-gray-50 px-4 sm:px-6 lg:px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <StepIndicator currentStep={step} />
            {step === 1 && (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  {t("title")}
                </h1>
                <p className="text-gray-500 text-sm">{t("subtitle")}</p>
              </>
            )}
            {step === 2 && (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  Your Business
                </h1>
                <p className="text-gray-500 text-sm">
                  Tell the community about your company, this powers your
                  Marketplace card.
                </p>
              </>
            )}
          </div>

          {step === 1 && (
            <PersonalForm
              t={t}
              imagePreview={imagePreview}
              setImagePreview={setImagePreview}
              setProfileImage={setProfileImage}
              setStep={setStep}
              personalForm={personalForm}
              />
            )}

          {step === 2 && (
            <BusinessForm
              t={t}
              updateUser={updateUser}
              imagePreview={imagePreview}
              setStep={setStep}
              personalForm={personalForm}
            businessForm={businessForm}
              profileImage={profileImage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
