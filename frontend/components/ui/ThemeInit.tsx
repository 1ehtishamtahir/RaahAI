"use client";
import { useEffect } from "react";

export default function ThemeInit() {
  useEffect(() => {
    const theme = localStorage.getItem("raahai-theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else if (theme === "light" || !theme) {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }
  }, []);
  return null;
}
