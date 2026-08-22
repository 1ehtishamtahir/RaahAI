"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { strings } from "./i18n";

type Lang = "en" | "ur";
type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: typeof strings.en };

const LangContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: strings.en });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const saved = localStorage.getItem("raahai-lang") as Lang | null;
    if (saved === "en" || saved === "ur") setLangState(saved);
  }, []);
  useEffect(() => {
    localStorage.setItem("raahai-lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
  }, [lang]);
  const setLang = (l: Lang) => setLangState(l);
  return <LangContext.Provider value={{ lang, setLang, t: strings[lang] }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
