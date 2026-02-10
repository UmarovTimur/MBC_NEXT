import { Chapter } from "@/entities/bible";
import { Bible } from "@/entities/bible/lib/bible";
import { bibleManager } from "@/entities/bible/server";
import { BooksList, ChapterLink, ChaptersTableTrigger } from "@/features/bible-navigation";
import { cn } from "@/shared/lib/utils";
import { AppLink } from "@/shared/ui/AppLink";
import { notFound } from "next/navigation";

interface BibleViewerProps {
  className?: string;
  chapter: Chapter;
}

export const BibleViewer = async ({ className, chapter }: BibleViewerProps) => {
  const bible = bibleManager.getBible(chapter.bible);
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
  // ======================= NotFound ==L==========================================
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
          "**:[[id^='V']]:font-bold [&_a]:text-blue-600 [&_a]:font-bold",
          " lg:flex justify-center gap-5 [&_strong]:font-bold",
        )}
      >
        <div className={cn("basis-2/3 pt-4")}>
          <AppLink href="/">
            <img
              className="ml-4 rounded-sm hidden md:inline float-right"
              src="https://kitobook.com/images/mcdonald.jpg"
              alt="MakDonaldning Injil kitobiga o'zbek tilidagi sharhlari"
            />
          </AppLink>
          <h1 className="text-3xl whitespace-pre-line md:text-4xl font-black">{title}</h1>
          <h2 className="text-2xl my-4">{subTitle}</h2>
          <div className="[&>p]:mb-4" dangerouslySetInnerHTML={{ __html: content }} />
        </div>

        {attachedContent && (
          <div className="shrink-0 pt-6 basis-1/3 text-base">
            <h3 className="text-3xl whitespace-pre-line mb-6">{attachedTitle}</h3>
            <div className="[&_a]:font-bold " dangerouslySetInnerHTML={{ __html: attachedContent }} />
          </div>
        )}
      </div>
      <div className="flex gap-x-4 pt-8 items-center">
        <ChapterLink className="basis-3/12" direction="prev" currentChapter={chapter} />
        {/* <BooksList className="lg:hidden inline-block grow" /> */}
        <ChaptersTableTrigger variant="outline" className="lg:hidden inline-block grow" />
        <ChapterLink className="basis-3/12" direction="next" currentChapter={chapter} />
      </div>
    </div>
  );
};
