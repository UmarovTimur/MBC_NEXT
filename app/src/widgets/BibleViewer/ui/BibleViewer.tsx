import { Chapter } from "@/entities/bible";
import { Bible } from "@/entities/bible/lib/bible";
import { bibleManager } from "@/entities/bible/server";
import { ChapterLink } from "@/features/bible-navigation";
import { cn } from "@/shared/lib/utils";
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
    <div className={cn("", [className])}>
      <ChapterLink direction="prev" currentChapter={chapter} />
      <ChapterLink direction="next" currentChapter={chapter} />

      <div
        className={cn(
          "**:[[id^='V']]:font-bold [&_a]:text-blue-600 [&_a]:font-bold",
          " lg:flex justify-center gap-5 [&_strong]:font-bold",
        )}
      >
        <div className={cn("basis-2/3 pt-6")}>
          <h1 className="text-3xl md:text-4xl font-black">{title}</h1>
          <h2 className="text-2xl mb-4 leading-12">{subTitle}</h2>
          <div className="[&>p]:mb-4 " dangerouslySetInnerHTML={{ __html: content }} />
        </div>

        {attachedContent && (
          <div className="shrink-0 pt-6 basis-1/3 text-base">
            <h3 className="text-3xl mb-6">{attachedTitle}</h3>
            <div className="[&_a]:font-bold " dangerouslySetInnerHTML={{ __html: attachedContent }} />
          </div>
        )}
      </div>
    </div>
  );
};
