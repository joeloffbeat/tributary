import tailwindcssAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        birthstone: ['var(--font-birthstone)'],
        roboto: ['var(--font-roboto)'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Logo-specific gradient stops
        "gradient-from": "hsl(var(--gradient-from))",
        "gradient-to": "hsl(var(--gradient-to))",
        // Tributary brand colors - Premium Fashion Store Aesthetic
        tributary: {
          // Primary - Deep Teal/Turquoise
          DEFAULT: '#167a5f',
          light: '#1a9e7a',
          dark: '#0f5c47',
        },
        // Cream backgrounds
        cream: {
          DEFAULT: '#edeae1',
          light: '#f5f3ed',    // Cards, surfaces
          dark: '#e5e1d6',     // Borders, dividers
        },
        // Text colors
        text: {
          primary: '#1a1a1a',
          secondary: '#6b6b6b',
          muted: '#9a9a9a',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, hsl(var(--gradient-from)) 0%, hsl(var(--gradient-to)) 100%)",
        "gradient-primary-reverse": "linear-gradient(135deg, hsl(var(--gradient-to)) 0%, hsl(var(--gradient-from)) 100%)",
        "gradient-primary-vertical": "linear-gradient(180deg, hsl(var(--gradient-from)) 0%, hsl(var(--gradient-to)) 100%)",
      },
      boxShadow: {
        "glow-primary": "0 0 20px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.2)",
        "glow-accent": "0 0 20px hsl(var(--accent) / 0.4), 0 0 40px hsl(var(--accent) / 0.2)",
        "glow-secondary": "0 0 20px hsl(var(--secondary) / 0.4), 0 0 40px hsl(var(--secondary) / 0.2)",
        "glow-sm": "0 0 10px hsl(var(--primary) / 0.3)",
        "glow-lg": "0 0 30px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.3)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.4)" },
          "50%": { boxShadow: "0 0 30px hsl(var(--primary) / 0.6), 0 0 50px hsl(var(--primary) / 0.3)" },
        },
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        // Tributary flow animation
        "flow": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        // Ripple effect animation
        "ripple": {
          "0%": { transform: "scale(0)", opacity: "0.5" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
        // Count up animation
        "count-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        // Glow pulse for teal
        "glow-teal": {
          "0%, 100%": { boxShadow: "0 0 10px #14B8A6, 0 0 20px rgba(20, 184, 166, 0.3)" },
          "50%": { boxShadow: "0 0 20px #14B8A6, 0 0 40px rgba(20, 184, 166, 0.5)" },
        },
        // Success celebration animation
        "celebrate": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)", boxShadow: "0 0 40px rgba(16, 185, 129, 0.4)" },
          "100%": { transform: "scale(1)" },
        },
        // Error shake animation
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-4px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(4px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
        "flow": "flow 4s ease infinite",
        "ripple": "ripple 0.6s linear",
        "count-up": "count-up 0.5s ease-out forwards",
        "glow-teal": "glow-teal 2s ease-in-out infinite",
        "celebrate": "celebrate 0.5s ease-out",
        "shake": "shake 0.5s ease-in-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
}
