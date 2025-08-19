"use client";
import Image from "next/image";
import check from "../public/check.svg";
import { useLanguage } from "../context/LanguageContext";

const PricingEnterprise = () => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="flex gap-[1rem] max-lg:flex-wrap mt-0 lg:mt-6">
      <div className="w-[19rem] max-lg:w-full h-full px-6 bg-n-8 border border-n-6 rounded-[2rem] lg:w-auto even:py-14 odd:py-8 odd:my-4 [&>h4]:first:text-color-2 [&>h4]:even:text-color-1 [&>h4]:last:text-color-3">
        <h4 className={`h4 mb-4 text-[#ff776f] text-[2rem] ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('pricing.enterprise.title')}
        </h4>

        <p className={`body-2 mb-3 text-[#ffffff80] ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('pricing.enterprise.subtitle')}
        </p>

        <div className={`flex items-center h-[5.5rem] mb-6 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
          <div className="text-[3rem]">
            299 <span className="text-[4rem]"> $</span>
          </div>
        </div>
        
        <div className="flex mb-4">
          <button className="button-animated w-full">
            {t('pricing.enterprise.button')}
          </button>
        </div>

        <ul>
          <li className={`flex items-center py-5 border-t border-n-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Image alt="check" src={check} />
            <p className={`body-2 ${isRTL ? 'mr-4' : 'ml-4'}`}>
              {t('pricing.enterprise.feature1')}
            </p>
          </li>

          <li className={`flex items-center py-5 border-t border-n-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Image alt="check" src={check} />
            <p className={`body-2 ${isRTL ? 'mr-4' : 'ml-4'}`}>
              {t('pricing.enterprise.feature2')}
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PricingEnterprise;