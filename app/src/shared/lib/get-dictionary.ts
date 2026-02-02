import uz from "@/shared/config/dictionary/uz.json";
import az from "@/shared/config/dictionary/az.json";

const dictionaries: Record<string, Record<string, string>> = { uz, az };

export const getDictionary = () => {
  const lang = process.env.APP_LANG || "uz";
  const dict = dictionaries[lang];

  return (key: string): string => {
    if (!dict) {
      throw new Error(`Dictionary for lang ${lang} not found`);
    }

    if (!(key in dict)) {
      throw new Error(`Missing translation key "${key}" for lang "${lang}"`);
    }

    return dict[key];
  }
};
