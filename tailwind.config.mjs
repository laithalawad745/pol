// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // يضمن أن Tailwind يستخدم فئات `dark:` للوضع الداكن
  darkMode: ['class'], 
  
  // هذه هي المسارات التي يبحث فيها Tailwind عن فئات CSS
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    // **أضف هذا السطر لضمان أن Tailwind يفحص مكونات shadcn/ui**
    './components/ui/**/*.{js,ts,jsx,tsx,mdx}', 
  ],
  theme: {
    extend: {
      colors: {
        // الألوان الخاصة بنظام الثيمات الخاص بك
        'theme-background': 'var(--theme-background-main)',
        'theme-main': 'var(--theme-background-main-original-color)',
        'theme-text': 'var(--theme-text-color)',
        'theme-secondary-text': 'var(--theme-secondary-text-color)',
        'theme-card-bg': 'var(--theme-card-bg)',
        'theme-accent': 'var(--theme-accent-color)',
        'theme-border': 'var(--theme-border-color)',
        'theme-link-hover': 'var(--theme-link-hover-color)',
        
        // الألوان الخاصة بالجدول (التي أضفناها سابقاً)
        'theme-background-header': 'var(--theme-background-header)',
        'theme-row-odd': 'var(--theme-row-odd)',
        'theme-row-even': 'var(--theme-row-even)',
        'theme-row-hover': 'var(--theme-row-hover)',

        // ألوان shadcn/ui الافتراضية (تعتمد على متغيرات CSS في globals.css)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      backgroundImage: {
        // خلفيات التدرج التي أنشأتها مسبقاً
        gradientMain: 'linear-gradient(135deg, #9D4EDD 0%, #4EA8DE 50%, #FF6B6B 100%)',
        gradientCard: 'linear-gradient(45deg, rgba(13, 13, 31, 0.9) 0%, rgba(27, 27, 50, 0.8) 100%)'
      },
      borderRadius: {
        // أنصاف الأقطار التي يضيفها shadcn/ui
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      // الرسوم المتحركة (animations) للخلفية المتحركة الجديدة
      animation: {
        first: 'moveVertical 30s ease infinite',
        second: 'moveInCircle 20s reverse infinite',
        third: 'moveInCircle 40s linear infinite',
        fourth: 'moveHorizontal 40s ease infinite',
        fifth: 'moveInCircle 20s ease infinite'
      },
      // الإطارات الرئيسية (keyframes) للرسوم المتحركة
      keyframes: {
        moveHorizontal: {
          '0%': {
            transform: 'translateX(-50%) translateY(-10%)'
          },
          '50%': {
            transform: 'translateX(50%) translateY(10%)'
          },
          '100%': {
            transform: 'translateX(-50%) translateY(-10%)'
          }
        },
        moveInCircle: {
          '0%': {
            transform: 'rotate(0deg)'
          },
          '50%': {
            transform: 'rotate(180deg)'
          },
          '100%': {
            transform: 'rotate(360deg)'
          }
        },
        moveVertical: {
          '0%': {
            transform: 'translateY(-50%)'
          },
          '50%': {
            transform: 'translateY(50%)'
          },
          '100%': {
            transform: 'translateY(-50%)'
          }
        }
      }
    }
  },
  // الإضافات (plugins) التي يستخدمها Tailwind
  plugins: [require("tailwindcss-animate")],
};