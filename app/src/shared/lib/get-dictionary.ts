import uz from "@/shared/config/dictionary/uz.json";
import az from "@/shared/config/dictionary/az.json";

const dictionaries: Record<string, Record<string, string>> = { uz, az };

export const getDictionary = () => {
  const lang = process.env.APP_LANG || "uz";
  return dictionaries[lang];
};
