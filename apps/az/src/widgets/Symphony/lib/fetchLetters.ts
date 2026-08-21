import "server-only";
import { getWordLetters } from "@mbc/bible-reader/server";
import { BIBLE_KEY, PAYLOAD_API_URL } from "@/widgets/BibleSearch/lib/searchVerses";

export async function fetchLetters() {
  const response = await getWordLetters(PAYLOAD_API_URL, BIBLE_KEY, { cache: "force-cache" });
  return response.letters;
}
