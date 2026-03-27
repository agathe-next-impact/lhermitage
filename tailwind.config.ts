import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"
import tailwindcssAnimate from "tailwindcss-animate"
import typography from "@tailwindcss/typography"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        "chart-1": "var(--chart-1)",
        "chart-2": "var(--chart-2)",
        "chart-3": "var(--chart-3)",
        "chart-4": "var(--chart-4)",
        "chart-5": "var(--chart-5)",
        "chart-6": "var(--chart-6)",
        sidebar: "var(--sidebar)",
        "sidebar-foreground": "var(--sidebar-foreground)",
        "sidebar-primary": "var(--sidebar-primary)",
        "sidebar-primary-foreground": "var(--sidebar-primary-foreground)",
        "sidebar-accent": "var(--sidebar-accent)",
        "sidebar-accent-foreground": "var(--sidebar-accent-foreground)",
        "sidebar-border": "var(--sidebar-border)",
        "sidebar-ring": "var(--sidebar-ring)",
        "brand-coral": "var(--brand-coral)",
        "brand-gray": "var(--brand-gray)",
        "brand-teal": "var(--brand-teal)",
        "brand-green": "var(--brand-green)",
        "brand-pink": "var(--brand-pink)",
        "brand-orange": "var(--brand-orange)",
        "brand-dark": "var(--brand-dark)",
        "brand-white": "var(--brand-white)",
      },
      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
        serif: ["var(--font-serif)", ...defaultTheme.fontFamily.serif],
        heading: ["var(--font-heading)", ...defaultTheme.fontFamily.sans],
      },
      typography: {
        DEFAULT: {
          css: {
            "h1, h2, h3": {
              fontWeight: "900",
              textTransform: "uppercase",
            },
            a: {
              color: "var(--brand-coral)",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
              "&:hover": {
                color: "var(--brand-teal)",
              },
            },
            blockquote: {
              borderLeftColor: "var(--brand-coral)",
            },
            img: {
              borderRadius: "0.5rem",
            },
          },
        },
        stone: {
          css: {
            "--tw-prose-body": "var(--brand-gray)",
            "--tw-prose-headings": "var(--brand-dark)",
            "--tw-prose-links": "var(--brand-coral)",
            "--tw-prose-bold": "inherit",
            "--tw-prose-quotes": "var(--brand-gray)",
            "--tw-prose-quote-borders": "var(--brand-coral)",
          },
        },
      },
      keyframes: {
        "zoom-in-90": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "zoom-in-95": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "zoom-out-95": {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.95)" },
        },
        orbit: {
          "0%": {
            transform:
              "rotate(calc(var(--angle) * 1deg)) translateY(calc(var(--radius) * 1px)) rotate(calc(var(--angle) * -1deg))",
          },
          "100%": {
            transform:
              "rotate(calc(var(--angle) * 1deg + 360deg)) translateY(calc(var(--radius) * 1px)) rotate(calc((var(--angle) * -1deg) - 360deg))",
          },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "zoom-in-90": "zoom-in-90 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "zoom-in-95": "zoom-in-95 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        "zoom-out-95": "zoom-out-95 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        orbit: "orbit var(--duration,20s) linear infinite",
        "accordion-down": "accordion-down 200ms ease-out",
        "accordion-up": "accordion-up 200ms ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate, typography],
}

export default config
