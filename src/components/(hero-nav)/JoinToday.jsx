"use client";

import { ArrowRight, Check, LockKeyhole, Play, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroBadge from "./HeroBadge";
import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

const JoinToday = () => {
  const t = useTranslations("JoinToday");
  const features = [
    { title: t("featureFree"),icon:Star },
    {title:t("featureIndustries"),icon:LockKeyhole},
    {title:t("featureNetwork"),icon:Check},
  ];

  return (
    <section className="relative min-h-[80dvh] flex items-center justify-center overflow-hidden bg-linear-to-b from-[#ED202D] via-[#155DFC] to-[#FBAD17]">
      {/* Content */}
      <div className="container relative z-10 mx-auto px-6 py-20 text-center ">
        {/* Badge */}
        <div className="mb-8 ">
          <HeroBadge text={t("badgeText")} className={"border border-white/30 bg-white/20"}/>
        </div>

        {/* Headlines */}
        <h1 className=" font-display text-3xl font-medium tracking-tight text-white md:text-4xl lg:text-5xl  animate-fade-up">
          {t("headlineMain")}
        </h1>
        <h2 className="mb-6 font-display text-3xl font-medium tracking-normal md:text-4xl lg:text-5xl animate-fade-up text-white">
          <span className="">{t("headlineSub")}</span>
        </h2>

        {/* Subheadline */}
        <p className="mx-auto mb-10 max-w-2xl text-lg text-[#DDEBFF] md:text-xl animate-fade-up ">
          {t("description")}
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center justify-center text-white gap-4 sm:flex-row animate-fade-up">
          <Button
            variant="JoinToday"
            size="lg"
            className={"bg-white text-[#28282b]"}
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
            <React.Fragment key={feature.title}>
              <div className="flex items-center gap-2">
                <feature.icon size={16} color="#fff"/>
                <span className="text-background font-light">{feature.title}</span>
              </div>{" "}
              {i <= 1 && "|"}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

export default JoinToday;
