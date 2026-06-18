import { Link } from '@/i18n/routing';
import React from 'react';
import { useTranslations } from 'next-intl';

const SupportCTA = () => {
  const t = useTranslations("SupportCTA");
  return (
    <section className="w-full bg-linear-to-r from-[#4279d6] via-[#2b56a1] to-[#263e75] py-12 px-6 flex justify-center items-center">
      {/* Inner Container with the dashed border effect from your mockup */}
      <div className="max-w-5xl w-full rounded-sm py-16 px-4 flex flex-col items-center text-center">
        
        <h2 className="text-white text-4xl md:text-5xl font-bold mb-6 tracking-tight">
          {t("title")}
        </h2>
        
        <p className="text-white/90 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
          {t("description")}
        </p>

        <Link href="/contact" className="bg-[#002b2d] hover:bg-[#003d40] text-white font-semibold py-3 px-10 rounded-full transition-all duration-300 shadow-lg">
          {t("button")}
        </Link>
        
      </div>
    </section>
  );
};

export default SupportCTA;