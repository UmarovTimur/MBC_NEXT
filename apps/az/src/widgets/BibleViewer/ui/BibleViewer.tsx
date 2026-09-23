import { Chapter } from "@/entities/bible";
import { bibleManager } from "@/entities/bible/server";
import type { Bible } from "@/entities/bible/server";
import { BooksList, ChapterLink, ChaptersTableTrigger } from "@/features/bible-navigation";
import { cn } from "@/shared/lib/utils";
import { notFound } from "next/navigation";
import { ChapterPagination } from "./ChapterPagination";
import { BibleContent } from "@/shared/ui/BibleContent";
import { FloatingChapterNav } from "./FloatingChapterNav";
import { AppLink } from "@/shared/ui/AppLink";
import { VerseHighlight } from "@/features/verse-highlight";
import { getI18n } from "@/app/providers/I18n/server";
import { ChapterAudioToggle, ChapterListenButton } from "@/features/bible-audio";
import { Breadcrumbs, type BreadcrumbItem } from "@/shared/ui/Breadcrumbs";
import { JsonLd } from "@/shared/lib/jsonLd";

interface BibleViewerProps {
  className?: string;
  chapter: Chapter;
}

export const BibleViewer = async ({ className, chapter }: BibleViewerProps) => {
  const { t } = getI18n();
  const bible: Bible = bibleManager.getBible(chapter.bible);
  // ======================= Bible ==============================================
  const content = await bible.getChapterContent(chapter.bookId, chapter.chapterId);
  const title = bible.getChapterTitle(chapter);
  const subTitle = bible.primaryTitle === title ? "" : bible.primaryTitle;
  // null for bibles without recordings (e.g. barclay) — then no audio is offered.
  const hasAudio = bible.getChapterAudioUrl(chapter.bookId, chapter.chapterId) !== null;
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

  // ======================= breadcrumbs + structured data =====================
  const bookName = bible.getBookName(Number(chapter.bookId));
  const crumbs: BreadcrumbItem[] = [
    { label: t("breadcrumbHome"), href: "/" },
    ...(bible.isIndependent ? [{ label: bible.primaryTitle, href: `/${bible.bibleName}` }] : []),
    { label: bookName },
    { label: title },
  ];
  // The visible trail drops the "Book: " prefix from the last crumb, which would
  // otherwise repeat the book crumb right before it. Structured data keeps full names.
  const visibleCrumbs: BreadcrumbItem[] = [
    ...crumbs.slice(0, -1),
    { label: title.startsWith(`${bookName}: `) ? title.slice(bookName.length + 2) : title },
  ];
  const domain = (process.env.DOMAIN || "https://kitobook.com").replace(/\/+$/, "");
  const basePath = process.env.BASE_PATH ? `/${process.env.BASE_PATH}` : "";
  const abs = (path: string) => `${domain}${basePath}${path}`;
  const chapterUrl = abs(`/${chapter.bible}/${chapter.bookId}/${chapter.chapterId}/`);
  const dateModified = bibleManager.getChapterUpdatedAt(chapter.bible, chapter.bookId, chapter.chapterId);

  return (
    <div className={cn("mb-8 pb-24 md:mb-12", [className])}>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: crumbs.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: c.label,
              // Only the last crumb (this page) and linked crumbs get a URL.
              ...(c.href ? { item: abs(c.href === "/" ? "/" : `${c.href}/`) } : i === crumbs.length - 1 ? { item: chapterUrl } : {}),
            })),
          },
          {
            "@context": "https://schema.org",
            "@type": "Chapter",
            name: title,
            url: chapterUrl,
            inLanguage: "az",
            position: Number(chapter.chapterId),
            isPartOf: { "@type": "Book", name: bible.primaryTitle, inLanguage: "az" },
            ...(dateModified && { dateModified }),
          },
        ]}
      />
      <FloatingChapterNav>
        <ChapterLink
          className="basis-12 lg:static lg:top-auto lg:left-auto lg:right-auto"
          direction="prev"
          currentChapter={chapter}
        />
        <BooksList className=" inline-flex grow" />
        <ChaptersTableTrigger className=" inline-flex grow" />
        {hasAudio && (
          <ChapterAudioToggle
            className="basis-12"
            chapter={{ bible: chapter.bible, bookId: chapter.bookId, chapterId: chapter.chapterId }}
          />
        )}
        <ChapterLink
          className="basis-12 lg:static lg:top-auto lg:left-auto lg:right-auto"
          direction="next"
          currentChapter={chapter}
        />
      </FloatingChapterNav>

      <ChapterLink className="hidden lg:flex" direction="prev" currentChapter={chapter} />
      <ChapterLink className="hidden lg:flex basis-3/12" direction="next" currentChapter={chapter} />

      <div
        className={cn(
          "text-foreground dark:text-muted-foreground",
          " lg:flex justify-center gap-5 [&_strong]:font-bold",
        )}
      >
        <div className={cn("basis-2/3 pt-4")}>
          <Breadcrumbs items={visibleCrumbs} />
          {hasAudio && (
            <ChapterListenButton
              className="mb-4"
              chapter={{ bible: chapter.bible, bookId: chapter.bookId, chapterId: chapter.chapterId }}
            />
          )}
          <h1 className="text-3xl whitespace-pre-line md:text-4xl font-black">{title}</h1>
          <h2 className="text-2xl my-4">{subTitle}</h2>
          <BibleContent html={content} formattingStyle={bible.formattingStyle} />

          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
            {t("chapterErrorHint")}{" "}
            <kbd className="rounded border border-current/20 bg-black/5 px-1.5 py-0.5 font-sans text-xs font-normal text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
              Ctrl
            </kbd>{" "}
            +{" "}
            <kbd className="rounded border border-current/20 bg-black/5 px-1.5 py-0.5 font-sans text-xs font-normal text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
              Enter
            </kbd>
          </p>
        </div>

        {attachedContent && attachedBible && (
          <div className="shrink-0 pt-6 basis-1/3 text-base ">
            <h3 className="text-3xl whitespace-pre-line mb-6">
              <AppLink
                href={`/${attachedBible.bibleName}/${chapter.bookId}/${chapter.chapterId}`}
                className="text-[#101820] transition-colors dark:text-white"
              >
                {attachedTitle}
              </AppLink>
            </h3>
            <BibleContent html={attachedContent} formattingStyle={attachedBible?.formattingStyle} />
          </div>
        )}
      </div>


      {/* Operates on the rendered DOM; verse-mode chapters carry .v wrappers. */}
      <ChapterPagination chapter={chapter} />

      <VerseHighlight />
    </div>
  );
};
