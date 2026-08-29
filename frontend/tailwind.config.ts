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
        background: "#FBFDFC",
      },
      borderRadius: {
        card: "16px",
        "card-lg": "20px",
        pill: "9999px",
      },
      fontFamily: {
        sans: ["Inter", "Noto Sans", "Noto Sans Arabic", "sans-serif"],
        urdu: ["'Jameel Noori Nastaleeq'", "'Noto Nastaliq Urdu'", "'Noto Naskh Arabic'", "serif"],
        nastaleeq: ["'Jameel Noori Nastaleeq'", "'Noto Nastaliq Urdu'", "'Noto Naskh Arabic'", "serif"],
      },
      boxShadow: {
        soft: "0 2px 16px rgba(16, 32, 27, 0.06)",
        card: "0 4px 24px rgba(16, 32, 27, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
