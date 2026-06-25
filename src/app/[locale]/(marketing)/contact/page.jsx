"use client";
// import ComingSoon from "@/components/ComingSoon";
// import { useTranslations } from "next-intl";

// export default function ContactPage() {
//   const t = useTranslations("Navbar");
  
//   return (
//     <div className="min-h-screen bg-[linear-gradient(135deg,#233389_0%,#162456_50%,#233389_100%)] dark:bg-[linear-gradient(135deg,#233389_0%,#162456_50%,#233389_100%)]">
//       <ComingSoon pageName={t("contact")} />
//     </div>
//   );
// }


import React from 'react';
import { Phone, Mail } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useNavbar } from '@/contexts/NavbarContext';
import { useTranslations } from 'next-intl';

export default function SupportSection() {
  const t = useTranslations("Contact");
  const {size: { height },
  } = useNavbar();


  return (
    <section className="relative w-full min-h-screen bg-white px-6 pt-5 pb-20 overflow-hidden flex items-center justify-center" style={{ marginTop: `${height}px` }}>
      {/* Decorative Background Circles */}
      {/* Figma SVG Eclipses - Positioned at corners */}
      <div className="absolute bottom-20 left-0  opacity-60 w-4xl">
        <BackgroundPattern />
      </div>
      {/* <div className="absolute -top-20 -right-20 opacity-60">
        <BackgroundPattern />
      </div> */}

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Content */}
        <div className="space-y-8">
          <h2 className="text-5xl font-semibold text-slate-900">{t("title")}</h2>
          <p className="text-slate-500 text-lg max-w-md leading-relaxed">
            {t.rich('description', { bold: (chunks) => <span className="text-indigo-900 font-bold">{chunks}</span> })}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 pt-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-slate-700" />
              <span className="text-slate-700 font-medium">+234 785711700</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-700" />
              <span className="text-slate-700 font-medium">support@blazingtorrent.org</span>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[32px] p-4 sm:p-8">
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-bold">{t("nameLabel")}</Label>
              <Input id="name" placeholder={t("namePlaceholder")} className="h-12 bg-slate-50/50 border-slate-100 rounded-lg" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-bold">{t("emailLabel")}</Label>
              <Input id="email" type="email" placeholder={t("emailPlaceholder")} className="h-12 bg-slate-50/50 border-slate-100 rounded-lg" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-slate-700 font-bold">{t("subjectLabel")}</Label>
              <Input id="subject" placeholder={t("subjectPlaceholder")} className="h-12 bg-slate-50/50 border-slate-100 rounded-lg" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-slate-700 font-bold">{t("messageLabel")}</Label>
              <Textarea id="message" placeholder={t("messagePlaceholder")} className="min-h-[150px] bg-slate-50/50 border-slate-100 rounded-lg resize-none" />
            </div>

            <Button className="w-full h-14 bg-[#1e2d7d] hover:bg-[#16225f] text-white rounded-lg text-lg font-medium transition-colors">
              {t("submitButton")}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

const BackgroundPattern = () => (
  <svg 
    width="409" 
    height="546" 
    viewBox="0 0 409 546" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className="absolute pointer-events-none select-none"
  >
    <circle 
      opacity="0.3" 
      cx="134.589" 
      cy="285.27" 
      r="140.555" 
      transform="rotate(28.1795 134.589 285.27)" 
      stroke="url(#paint0_linear_905_5134)" 
      strokeWidth="103.891"
    />
    <foreignObject x="258.619" y="129.646" width="113.105" height="113.105">
      <div style={{ backdropFilter: 'blur(10px)', height: '100%', width: '100%' }}></div>
    </foreignObject>
    <circle 
      opacity="0.32" 
      cx="315.172" 
      cy="186.2" 
      r="27.5503" 
      transform="rotate(5.27225 315.172 186.2)" 
      stroke="url(#paint1_linear_905_5134)" 
      strokeWidth="18"
    />
    <defs>
      <linearGradient id="paint0_linear_905_5134" x1="134.589" y1="92.7704" x2="134.589" y2="477.77" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1B2F5B" stopOpacity="0.5"/>
        <stop offset="1" stopColor="#1B2F5B" stopOpacity="0"/>
      </linearGradient>
      <linearGradient id="paint1_linear_905_5134" x1="287.376" y1="113.131" x2="354.795" y2="130.335" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1B2F5B"/>
        <stop offset="1" stopColor="#1B2F5B" stopOpacity="0"/>
      </linearGradient>
    </defs>
  </svg>
);