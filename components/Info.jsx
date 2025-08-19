"use client";
import Image from "next/image";
import bot1 from "../public/bot1.jpeg";
import bot2 from "../public/bot2.jpeg";
import bot3 from "../public/bot3.jpg";
import { useLanguage } from "../context/LanguageContext";

const Info = () => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="container mx-auto p-8">
      <div
        className={`flex flex-col lg:flex-row gap-6 w-full ${
          isRTL ? "lg:flex-row-reverse" : ""
        }`}
      >
        {/* Card 1 */}
        <div className="w-full lg:w-1/2">
          <div className="relative w-full rounded-lg overflow-hidden shadow-lg group h-[400px] md:h-[600px]">
            <Image
              src={bot3}
              alt="Group Management"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              priority
            />
            {/* Overlay أسود ضبابي */}
            <div className="absolute inset-0 bg-black/60 blur-sm" />
            <div
              className={`relative z-10 p-6 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <h2 className="text-3xl font-bold mb-4 text-white pt-20">
                {t("info.groupManagement.title")}
              </h2>
              <p className="mb-6 text-gray-200">
                {t("info.groupManagement.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="w-full lg:w-1/2">
          <div className="relative w-full rounded-lg overflow-hidden shadow-lg group h-[400px] md:h-[600px]">
            <Image
              src={bot2}
              alt="Complete Management"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              priority
            />
            {/* Overlay أسود ضبابي */}
            <div className="absolute inset-0 bg-black/60 blur-sm" />
            <div
              className={`relative z-10 p-6 ${
                isRTL ? "text-right" : "text-left"
              }`}
            >
              <h2 className="text-3xl font-bold mb-4 text-white">
                {t("info.completeManagement.title")}
              </h2>
              <p className="mb-6 text-gray-200">
                {t("info.completeManagement.description")}
              </p>
              <div className="bg-gray-700 bg-opacity-75 p-4 rounded shadow-md">
                <p className="mb-4 text-white">
                  {t("info.completeManagement.note")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Info;
