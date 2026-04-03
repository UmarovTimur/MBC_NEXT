/* eslint-disable @typescript-eslint/no-explicit-any */
import az from "@/shared/config/dictionary/az.json";

const dictionaries: Record<string, Record<string, string>> = { az };

export const getI18n = () => {
  const lang = process.env.APP_LANG || "az";
  const dict = dictionaries[lang];

  const t = (key: string) => {
    let value: any = dict;

    value = value?.[key];

    if (!value && process.env.NODE_ENV === "development") {
      throw new Error(`Unknown key in dictionary: ${value}`);
    }

    return value || key;
  };

  return { t, dict, lang };
};
