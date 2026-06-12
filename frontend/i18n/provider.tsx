"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getMessages, Locale } from "./request";

type Messages = Record<string, string>;

type I18nContextType = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
 const [locale, setLocale] = useState<Locale>("en");

useEffect(() => {
  const saved = localStorage.getItem("locale") as Locale | null;
  if (saved) {
    setLocale(saved);
  }
}, []);

useEffect(() => {
  localStorage.setItem("locale", locale);
}, [locale]);
  const [messages, setMessages] = useState<Messages>({});

  useEffect(() => {
    getMessages(locale).then(setMessages);
  }, [locale]);

  const t = (key: string) => {
    return messages[key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
