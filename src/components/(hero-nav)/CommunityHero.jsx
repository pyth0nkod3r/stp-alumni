import { Link } from "@/i18n/routing";
import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import marketIcon from "../../../public/assets/market-icon.png";
import eventIcon from "../../../public/assets/event-icon.png";

const CommunitySection = () => {
  const t = useTranslations("CommunityHero");
  const arr = [
    {
      src: marketIcon,
      title: t("marketplaceTitle"),
      desc: t("marketplaceDesc"),
      href: "/marketplace",
    },
    {
      src: eventIcon,
      title: t("eventsTitle"),
      desc: t("eventsDesc"),
      href: "/events",
    },
  ];
  return (
    <div className="min-h-screen bg-linear-to-b from-[#b3c7f7] to-[#1e56d3] flex flex-col items-center justify-center p-8 font-sans text-[#1a2b4b]">
      {/* Header Section */}
      <div className="text-center max-w-2xl mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          {t("headlineMain")} <span className="text-white">{t("headlineSub1")}</span> {t("headlineSub2")}
        </h1>
        <p className="text-lg leading-relaxed opacity-90">
          {t("description")}
        </p>
      </div>

      {/* Cards Container */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Marketplace Card */}
        {arr.map((ele) => (
          <Link
            href={ele.href}
            key={ele.title}
            className="bg-white rounded-2xl p-8 w-80 shadow-[0_0_50px_rgba(255,255,255,0.4)] transition-transform hover:scale-105"
          >
            <div className="relative my-5">
              <Image src={ele.src} width={32} height={32} alt="icons" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{ele.title}</h2>
            <p className="text-gray-600 leading-snug">{ele.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CommunitySection;
