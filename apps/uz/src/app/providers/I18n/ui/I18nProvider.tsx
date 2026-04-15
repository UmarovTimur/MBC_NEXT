"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { I18nContext } from "../lib/I18nContext";

export const I18nProvider = ({ children, dict }: { children: React.ReactNode; dict: Record<string, any> }) => {
  return <I18nContext.Provider value={dict}>{children}</I18nContext.Provider>;
};