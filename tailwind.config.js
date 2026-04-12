import { heroui } from "@heroui/react";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,mjs}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["Plus Jakarta Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        heading: ["Fraunces", "Georgia", "serif"],
        mono:    ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        brand: {
          green:  "#3bb582",
          blue:   "#2096d8",
          bg:     "#F7FDFB",
          card:   "#FAFFFE",
          accent: "#D6F0E7",
          muted:  "#EAF4F0",
          border: "#C4DED5",
          fg:     "#1E2D28",
          "muted-fg": "#5A7A6E",
          "accent-fg": "#1E4A38",
        },
      },
      boxShadow: {
        soft:  "0 4px 20px -2px rgba(59, 181, 130, 0.15)",
        float: "0 10px 40px -10px rgba(32, 150, 216, 0.18)",
        card:  "0 4px 20px -2px rgba(59, 181, 130, 0.12)",
        lift:  "0 20px 40px -10px rgba(32, 150, 216, 0.15)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #3bb582 0%, rgba(32,150,216,0.7) 100%)",
      },
    },
  },
  plugins: [heroui()],
};
