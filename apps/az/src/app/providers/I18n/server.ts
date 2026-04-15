/* eslint-disable @typescript-eslint/no-explicit-any */
import az from "@/shared/config/dictionary/az.json";

const dictionaries: Record<string, Record<string, any>> = { az };

export const getI18n = () => {
  const language = process.env.APP_LANG || "az";
  const dictionary = dictionaries[language];

  const t = (key: string) => {
    let value: any = dictionary;

    value = value?.[key];

    if (!value && process.env.NODE_ENV === "development") {
      throw new Error(`Unknown key in dictionary: ${value}`);
    }

    return value || key;
  };

  return { t, dictionary, language };
};
