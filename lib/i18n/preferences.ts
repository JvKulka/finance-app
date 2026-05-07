"use client";

import { useEffect, useState } from "react";
import { DEFAULT_APP_CURRENCY, DEFAULT_APP_LOCALE } from "@/lib/i18n/currency";

export const SYSTEM_LANGUAGE_STORAGE_KEY = "system-preference-language";
export const SYSTEM_CURRENCY_STORAGE_KEY = "system-preference-currency";

export function useSystemPreferences() {
  const [language, setLanguage] = useState<string>(DEFAULT_APP_LOCALE);
  const [currency, setCurrency] = useState<string>(DEFAULT_APP_CURRENCY);

  useEffect(() => {
    const storedLanguage = localStorage.getItem(SYSTEM_LANGUAGE_STORAGE_KEY) || DEFAULT_APP_LOCALE;
    const storedCurrency = localStorage.getItem(SYSTEM_CURRENCY_STORAGE_KEY) || DEFAULT_APP_CURRENCY;
    setLanguage(storedLanguage);
    setCurrency(storedCurrency);
  }, []);

  return { language, currency };
}
