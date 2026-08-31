"use client";
import { useEffect } from "react";

export default function ThemeInit() {
  useEffect(() => {
    const theme = localStorage.getItem("raahai-theme");
    if (theme === "dark" || (!theme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    }
  }, []);
  return null;
}
