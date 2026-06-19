"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

/**
 * Layout for unregistered users on Events and Marketplace.
 * No sidebar, no user header — just a dark blue title banner and centered content.
 */
export default function PublicPortalLayout({ children, pageTitle }) {
  const t = useTranslations("Navbar");

  return (
    <div className="min-h-screen bg-[#E8ECF4] flex flex-col">
      {/* Minimal top bar: logo + Login / Join */}
      <header className="sticky top-0 z-40 w-full bg-[#1B2F5B] border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/Blazing-Torrent-Color-logo.png"
            alt="BlazingTorrent"
            width={140}
            height={36}
            className="object-contain h-9"
            style={{ width: "auto", height: "auto" }}
            priority
          />
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" asChild>
            <Link href="/login">{t("login")}</Link>
          </Button>
          <Button variant="default" size="sm" className="bg-[#2B7FFF] hover:bg-[#2563eb] text-white" asChild>
            <Link href="/login">{t("login")}</Link>
          </Button>
        </div>
      </header>

      {/* Dark blue title banner */}
      <div className="w-full bg-gradient-to-b from-[#1B2F5B] to-[#1B2F5B]/95 px-4 sm:px-6 py-8 sm:py-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-white text-center">
          {pageTitle}
        </h1>
      </div>

      {/* Content: centered, white/light background */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
