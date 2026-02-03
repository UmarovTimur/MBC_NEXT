"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext } from "react";
import { I18nContext } from "../lib/I18nContext";

export const useI18n = () => {
  const dict = useContext(I18nContext);

  if (!dict) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  const t = (key: string) => {
    let value: any = dict;

    value = value?.[key];

    if (!value && process.env.NODE_ENV === "development") {
      throw new Error(`Unknown key in dictionary: ${value}`);
    }

    return value || key;
  };

  return { t, dict };
};