import { HTML_SRC_DIR } from "@/shared/config/paths";
import { getDirectories, getFiles, readFileContent } from "@/shared/lib/FileSystem";
import { getBookIdBySlug } from "../model/mapping";
import path from "path";
import { logger } from "@/shared/lib/logger";

export function getAllBooksPaths() {
   const paths = [];

   const bookFolders = getDirectories(HTML_SRC_DIR);

   
   for (const bookId of bookFolders) {
      const bookPath = path.join(HTML_SRC_DIR, bookId);
      const chapterFiles = getFiles(bookPath);
      
      for (const file of chapterFiles) {
         if (!file.endsWith('.html')) continue;
         
         const chapterNumber = file.replace('.html', '');
         
         paths.push({
            bookNumber: bookId,
            chapterNumber: chapterNumber,
         })
      }
   }

   return paths;
}

export function getChapterContent(bookId: string, chapterNumber: string) {
   const filePath = path.join(HTML_SRC_DIR, bookId, `${chapterNumber}.html`);
   try {
    const content = readFileContent(filePath);
    return content;
  } catch (e) {
    return null;
  }
}