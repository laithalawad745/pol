// components/Navbar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext'; // Import language hook

const Navbar = ({ isMenuOpen, toggleMenu }) => {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState("");
  const { theme, setTheme } = useTheme();
  const { language, toggleLanguage, t, isRTL } = useLanguage(); // Use language context

  const isActive = (path) => {
    if (pathname === "/") {
      return activeSection === path;
    }
    return pathname === path;
  };

  useEffect(() => {
    const handleScroll = () => {
      if (pathname === "/") {
        const scrollPosition = window.scrollY;
        const heroSection = document.getElementById("hero-section");
        const infoSection = document.getElementById("info-section");
        const pricingSection = document.getElementById("pricing-section");

        if (!heroSection || !infoSection || !pricingSection) {
          return;
        }

        if (scrollPosition < infoSection.offsetTop - 100) {
          setActiveSection("/");
        } else if (
          scrollPosition >= infoSection.offsetTop - 100 &&
          scrollPosition < pricingSection.offsetTop - 100
        ) {
          setActiveSection("/services");
        } else if (scrollPosition >= pricingSection.offsetTop - 100) {
          setActiveSection("/pricing");
        }
      }
    };

    if (pathname === "/") {
      window.addEventListener("scroll", handleScroll);
      handleScroll();
    }

    return () => {
      if (pathname === "/") {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [pathname]);

  const handlePricingClick = (e) => {
    if (pathname === "/") {
      e.preventDefault();
      const pricingSection = document.getElementById("pricing-section");
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: "smooth" });
      }
    }
    if (isMenuOpen) toggleMenu();
  };

  const handleHomeClick = (e) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
    if (isMenuOpen) toggleMenu();
  };

  const handleServicesClick = (e) => {
    if (pathname === "/") {
      e.preventDefault();
      const infoSection = document.getElementById("info-section");
      if (infoSection) {
        infoSection.scrollIntoView({ behavior: "smooth" });
      }
    }
    if (isMenuOpen) toggleMenu();
  };

  return (
 <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-transparent border-gray-800 border-b-2">
    <div className="bg-[#12111199] backdrop-blur-sm max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Navigation Links */}
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } w-full md:block md:w-auto order-2 md:order-1`}
          id="navbar-default"
        >
<ul className={`font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-700 rounded-lg bg-gray-800/50 md:flex-row ${isRTL ? 'md:space-x-reverse' : ''} gap-x-4 md:space-x-4 md:mt-0 md:border-0 md:bg-transparent`}>            
            {/* Language Toggle Button */}
            <li className="flex items-center">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 py-2 px-3 text-gray-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-gray-700/50"
                aria-label="Toggle language"
              >
                <svg 
                  className="w-5 h-5" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                  />
                </svg>
                <span className="text-sm font-medium">
                  {language === 'en' ? 'العربية' : 'English'}
                </span>
              </button>
            </li>

       <li className={`${isRTL ? 'ml-4' : 'mr-4'}`}>
  <Link
    href="/Payment"
    onClick={() => isMenuOpen && toggleMenu()}
    className={`block py-2 px-3 md:px-0 rounded-lg md:rounded-none ${
      isActive("/Payment")
        ? "text-white relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-purple-600 after:to-blue-500"
        : "text-gray-300 hover:bg-gray-800 md:hover:bg-transparent md:border-0 md:hover:text-purple-400"
    }`}
  >
    {t('navbar.Payment')}
  </Link>
</li>
<li className={`${isRTL ? 'ml-4' : 'mr-4'}`}>
  <Link
    href="/contact"
    onClick={() => isMenuOpen && toggleMenu()}
    className={`block py-2 px-3 md:px-0 rounded-lg md:rounded-none ${
      isActive("/contact")
        ? "text-white relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-gradient-to-r after:from-purple-600 after:to-blue-500"
        : "text-gray-300 hover:bg-gray-800 md:hover:bg-transparent md:border-0 md:hover:text-purple-400"
    }`}
  >
    {t('navbar.contact')}
  </Link>
</li>
            
            {/* <li>
              <Link
                href="/pricing"
                onClick={handlePricingClick}
                className={`block py-2 px-3 md:px-0 rounded-lg md:rounded-none text-gray-300 hover:bg-gray-800 md:hover:bg-transparent md:border-0 md:hover:text-purple-400`}
              >
                {t('navbar.pricing')}
              </Link>
            </li> */}
            
            {/* <li>
              <Link
                href="/login"
                className={`block py-2 px-3 md:px-0 rounded-lg md:rounded-none text-gray-300 hover:bg-gray-800 md:hover:bg-transparent md:border-0 md:hover:text-purple-400`}
              >
                {t('navbar.register')}
              </Link>
            </li> */}
            
            <li>
              <Link
                href="/login"
                onClick={() => isMenuOpen && toggleMenu()}
                className="block py-2 px-4 text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90"
              >
                {t('navbar.signin')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          type="button"
          className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-400 rounded-lg md:hidden hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 order-1 md:order-2"
          aria-controls="navbar-default"
          aria-expanded={isMenuOpen}
        >
          <span className="sr-only">Open main menu</span>
          <svg
            className="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 17 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h15M1 7h15M1 13h15"
            />
          </svg>
        </button>

        {/* Logo/Brand */}
{/* Logo/Brand */}
<Link
  href="/"
  onClick={handleHomeClick}
  className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-3 order-3 md:order-3`}
>
  <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
    Telegram Copilot 
  </span>
  <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg"></div>
</Link>

      </div>
    </nav>
  );
};

export default Navbar;