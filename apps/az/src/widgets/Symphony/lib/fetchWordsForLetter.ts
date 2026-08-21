import "server-only";
import { getWordsForLetter } from "@mbc/bible-reader/server";
import { BIBLE_KEY, PAYLOAD_API_URL } from "@/widgets/BibleSearch/lib/searchVerses";

export async function fetchWordsForLetter(letter: string) {
  const response = await getWordsForLetter(PAYLOAD_API_URL, BIBLE_KEY, letter, {
    cache: "force-cache",
  });
  return response;
}
