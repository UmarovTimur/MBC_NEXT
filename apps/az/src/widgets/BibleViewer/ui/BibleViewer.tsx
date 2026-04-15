import { Chapter } from "@/entities/bible";
import { bibleManager } from "@/entities/bible/server";
import type { Bible } from "@/entities/bible/server";
import { BooksList, ChapterLink, ChaptersTableTrigger } from "@/features/bible-navigation";
import { cn } from "@/shared/lib/utils";
import { notFound } from "next/navigation";
import { ChapterPagination } from "./ChapterPagination";
import { AppLink } from "@/shared/ui/AppLink";

interface BibleViewerProps {
  className?: string;
  chapter: Chapter;
}

export const BibleViewer = async ({ className, chapter }: BibleViewerProps) => {
  const bible: Bible = bibleManager.getBible(chapter.bible);
  // ======================= Bible ==============================================
  const content = await bible.getChapterContent(chapter.bookId, chapter.chapterId);
  const title = bible.getChapterTitle(chapter);
  const subTitle = bible.primaryTitle === title ? "" : bible.primaryTitle;
  // ======================= attached Bible =====================================
  let attachedContent: string | null = null;
  let attachedBible: Bible | undefined = undefined;
  if (bible.attachmentBibleName) {
    attachedBible = bibleManager.getBible(bible.attachmentBibleName);
    attachedContent = await bibleManager.getChapterContent({
      bible: attachedBible.bibleName,
      bookId: chapter.bookId,
      chapterId: chapter.chapterId,
    });
  }

  const attachedTitle = attachedBible?.primaryTitle;
  // ======================= NotFound ==========================================
  if (!content) {
    notFound();
  }
  return (
    <div className={cn("mb-8 md:mb-12", [className])}>
      <div className="flex gap-x-4 items-center">
        <ChapterLink direction="prev" currentChapter={chapter} />
        <BooksList className="lg:hidden inline-block grow" />
        <ChaptersTableTrigger className="lg:hidden inline-block grow" />
        <ChapterLink direction="next" currentChapter={chapter} />
      </div>

      <div
        className={cn(
          "[&_a]:text-blue-600 [&_a]:font-bold text-foreground dark:text-muted-foreground",
          " lg:flex justify-center gap-5 [&_strong]:font-bold",
        )}
      >
        <div className={cn("basis-2/3 pt-4")}>
          {/* <AppLink href="/">
            <img
              className="ml-4 rounded-sm hidden md:inline float-right"
              src="https://kitobook.com/images/mcdonald.jpg"
              alt="MakDonaldning Injil kitobiga o'zbek tilidagi sharhlari"
            />
          </AppLink> */}
          <h1 className="text-3xl whitespace-pre-line md:text-4xl font-black">{title}</h1>
          <h2 className="text-2xl my-4">{subTitle}</h2>
          <div className="[&>p]:mb-4" dangerouslySetInnerHTML={{ __html: content }} />
        </div>

        {attachedContent && (
          <div className="shrink-0 pt-6 basis-1/3 text-base ">
            <h3 className="text-3xl whitespace-pre-line mb-6">{attachedTitle}</h3>
            <div
              className={cn("[&_a]:font-bold **:[[id^='V']]:font-bold p [&_span[id^='V']]:before:content-['\a']",
                "[&_span[id^='V']]:before:whitespace-pre [&_span[id^='V']]:before:block [&_span[id^='V']]:before:h-0",
                "[&_span[id^='V']]:mt-4 first:[&_span[id^='V']]:before:content-none",
                "[&_div[class*='s']]:font-bold [&_div[class*='s']]:leading-8"
              )}
              dangerouslySetInnerHTML={{ __html: attachedContent }}
            />
          </div>
        )}
      </div>


      <ChapterPagination chapter={chapter} />

      <div className="flex gap-x-4 pt-4 items-center">
        <ChapterLink className="basis-3/12" direction="prev" currentChapter={chapter} />
        {/* <BooksList className="lg:hidden inline-block grow" /> */}
        <ChaptersTableTrigger variant="outline" className="lg:hidden inline-block grow" />
        <ChapterLink className="basis-3/12" direction="next" currentChapter={chapter} />
      </div>
    </div>
  );
};
