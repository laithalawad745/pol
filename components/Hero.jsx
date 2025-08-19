"use client";
import Image from "next/image";
import { useLanguage } from "../context/LanguageContext";

const Hero = () => {
  const { t } = useLanguage();

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 md:p-8"
      style={{ backgroundImage: "url('/service-1.png')" }}
    >
      <div className="w-full md:w-2/3 mb-[12%] text-center space-y-6 bg-black/50 p-8 rounded-lg">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-500 via-purple-600 to-blue-500 bg-clip-text text-transparent">
          {t('hero.welcome')}
        </h1>
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300">
          {t('hero.subtitle')}
        </h2>
      </div>
    </div>
  );
};

export default Hero;