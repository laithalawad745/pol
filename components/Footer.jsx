"use client";
import Link from 'next/link';
import React from 'react';
import { useLanguage } from "../context/LanguageContext";

const Footer = () => {
  const { t, isRTL } = useLanguage();

  return (
    <footer className="bg-[#12111199] text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ${isRTL ? 'text-right' : 'text-left'}`}>
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">
              {t('navbar.brand')}
            </h3>
            <p className="text-sm">
              {t('footer.description')}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">
              {t('footer.quickLinks.title')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  {t('footer.quickLinks.home')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  {t('footer.quickLinks.products')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  {t('footer.quickLinks.aboutUs')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white mb-4">
              {t('footer.services.title')}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  {t('footer.services.telegramBots')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  {t('footer.services.telegramManagement')}
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  {t('footer.services.subsetManagement')}
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <Link href="/contact" className="text-xl font-bold text-white mb-4">
              {t('footer.contact')}
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className={`flex flex-col md:flex-row justify-between items-center gap-4 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
            <p className="text-sm">
              © {new Date().getFullYear()} {t('navbar.brand')}. {t('footer.copyright')}
            </p>
            <div className={`flex gap-4 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
              <Link href="#" className="hover:text-white transition-colors">
                {t('footer.privacyPolicy')}
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                {t('footer.termsConditions')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;