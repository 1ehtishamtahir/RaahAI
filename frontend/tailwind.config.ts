import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        raah: {
          green: "#087F3E",
          deep: "#075C2D",
          mint: "#EAF7EE",
          soft: "#F3FAF5",
          success: "#159447",
        },
        text: {
          primary: "#17201B",
          secondary: "#66716B",
          muted: "#98A29C",
        },
        border: "#E3E9E5",
      },
      borderRadius: {
        card: "16px",
        pill: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans", "Noto Sans Arabic", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
