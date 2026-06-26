"use client";

import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroBadge from "./HeroBadge";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useNavbar } from "@/contexts/NavbarContext";
import { Link } from "@/i18n/routing";

const Hero = () => {
  const t = useTranslations("Hero");
  const features = [
    t("featureFree"),
    t("featureIndustries"),
    t("featureNetwork"),
  ];
  const { size:{height} } = useNavbar();
  const [width, setWidth] = useState(0);

  useEffect(() => {
    setWidth(window.innerWidth);
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#233389_0%,#162456_50%,#233389_100%)]">
      {/* <section className="relative min-h-screen flex items-center justify-center overflow-hidden dark:bg-linear-to-r dark:from-[#233389] dark:via-[#162456] dark:to-[#233389]"> */}
      {/* Background Image */}
      <div className="absolute inset-0 z-0 dark:hidden">
        <Image
          src="/stp-21.jpg"
          alt={t("imageAlt")}
          className="h-full w-full object-cover opacity-75 "
          fill
        />
        {/* <div className="absolute inset-0 bg-hero-overlay" /> */}
        <div className="absolute inset-0 bg-[rgba(29,41,61,0.45)]" />
      </div>

      <div className="hidden dark:block absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-[384px] h-96 rounded-full bg-[#00B8DB]/30 blur-[128px]" />

      <div className="hidden dark:block absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-[384px] h-96 rounded-full bg-[#00B8DB]/30 blur-[128px]" />
      {/* Purple accent border at bottom */}
      {/* <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent" /> */}

      {/* Content */}
      <div className="container relative z-10 mx-auto px-6 py-20 text-center ">
        {/* Badge */}
        <div className="mb-8 " style={width < 650 ? {marginTop: `${height-80}px`}: {}}>
          <HeroBadge
            text={t("badgeText")}
            className={"gradient-primary-rtl dark:border dark:border-[#314158]"}
            iconClass="dark:text-[#00D3F2]"
          />
        </div>

        {/* Headlines */}
        <h1 className="mb-0 font-display text-5xl font-medium tracking-tight text-white md:text-6xl lg:text-7xl  animate-fade-up">
          {t("headlineMain")}
        </h1>
        <h2 className="mb-6 font-display text-5xl font-medium tracking-tight leading-[1.2] md:text-6xl lg:text-7xl animate-fade-up text-grow-together pb-2">
          <span className="inline-block pb-1">{t("headlineSub")}</span>
        </h2>

        {/* Subheadline */}
        <p className="mx-auto mb-10 max-w-2xl text-lg text-[#DDEBFF] md:text-xl animate-fade-up ">
          {t("description")}
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center text-white gap-4 sm:flex-row animate-fade-up">
          <Button
            variant="hero"
            size="lg"
            className={"gradient-btn-primary-rtl"}
            asChild
          >
            <Link href="/contact">
              {t("getStarted")}
              <ArrowRight className="ml-1 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Feature badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground animate-fade-up">
          {features.map((feature, i) => (
            <React.Fragment key={feature}>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#FBAD17]" />
                <span className="text-background">{feature}</span>
              </div>{" "}
              {i <= 1 && "|"}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
