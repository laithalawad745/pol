"use client";

import { ThemeProvider, useTheme } from "../context/ThemeContext";
import NavbarWrapper from "../components/NavbarWrapper";

export default function ClientRootLayoutContent({ children }) {
  return (
    <ThemeProvider>
      <ThemeContent themeChildren={children} />
    </ThemeProvider>
  );
}

function ThemeContent({ themeChildren }) {
  const { theme } = useTheme();

  const commonClasses = `
    font-geist-sans font-geist-mono antialiased
  `;

  let backgroundStyles = {};
  let backgroundClasses = '';

  if (theme === 'current') {
    backgroundStyles = {
      backgroundImage: 'var(--theme-background-main-original-image)',
      backgroundColor: 'var(--theme-background-main-original-color)',
      backgroundPosition: 'var(--theme-background-main-original-position)',
      backgroundSize: 'var(--theme-background-main-original-size)',
      backgroundRepeat: 'var(--theme-background-main-original-repeat)',
    };
  } else if (theme === 'dark') {
    backgroundClasses = 'bg-theme-background-main-dark-mode dark-mode-animated-effect';
  } else if (theme === 'light') {
    backgroundClasses = 'bg-theme-background-main-light-mode';
  }

  return (
    <>
      {/* Navbar منفصل وثابت */}
      <NavbarWrapper />
      {/* المحتوى بدون wrapper إضافي */}
      <div className={`${commonClasses} ${backgroundClasses}`} style={backgroundStyles}>
        {themeChildren}
      </div>
    </>
  );
}