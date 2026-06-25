"use client";

import React from "react";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

function BuildTogether() {
  const t = useTranslations('BuildTogether');

  const stats = [
    { text: t('stat1Text'), val: t('stat1Val') },
    { text: t('stat2Text'), val: t('stat2Val') },
    { text: t('stat3Text'), val: t('stat3Val') },
    { text: t('stat4Text'), val: t('stat4Val') },
  ];

  return (
    <div className="bg-[linear-gradient(135deg,#233389_0%,#162456_75%,#233389_100%)] pb-16">
      <div className="text-center flex flex-col gap-5 items-center pt-12">
        <h1 className="text-5xl text-white font-bold tracking-tight">
          {t('titleMain')} <br />
          <span className="text-4xl text-grow-together">{t('titleStronger')}</span>
        </h1>
        <p className="text-[#90A1B9] max-w-xl">
          {t('description')}
        </p>

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4 max-w-4xl mt-6 px-4">
          {stats.map((ele) => (
            <div className="text-center space-y-1 bg-stp-blue-dark py-5 px-8 rounded-xl border border-white/5" key={ele.text}>
              <p className="text-[#00D3F2] text-2xl md:text-3xl font-extrabold flex items-center justify-center">
                {ele.val} 
              </p>
              <p className="text-sm text-[#90A1B9]">{ele.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Founding Member Cohort Program */}
      <div className="max-w-4xl mx-auto mt-16 px-6">
        <div className="bg-stp-blue-dark/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl transition-all duration-300 hover:border-white/20">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-l from-[#00D3F2] to-[#155DFC] text-white font-bold text-lg mb-6 shadow-inner">
            ★
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {t('foundingTitle')}
          </h3>
          <p className="text-[#90A1B9] text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            {t('foundingDescription')}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center bg-linear-to-r from-[#00D3F2] to-[#155DFC] hover:from-[#00D3F2]/95 hover:to-[#155DFC]/95 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-102 active:scale-98"
          >
            {t('foundingCTA')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default BuildTogether;