import type { Book } from "@/entities/book";
import { getI18n } from "@/app/providers/I18n/server";
import { AppLink } from "@/shared/ui/AppLink";
import { ContainerWidth } from "@/shared/ui/Container";
import {
  ArrowRight,
  BookMarked,
  BookOpen,
  Bookmark,
  Copy,
  Headphones,
  Landmark,
  MessageSquareText,
  Search,
  Share2,
  Sparkles,
} from "lucide-react";
import { Button } from "@mbc/ui";

type HomeHeroProps = {
  books: Book[];
  startReadingHref: string;
  bibleHref: string;
  commentaryHref: string;
};

const coverThemes = [
  "from-stone-100 via-[#ede4d4] to-[#c29a62] text-stone-900",
  "from-[#203b2b] via-[#385744] to-[#0f2117] text-white",
  "from-[#f7f0e5] via-[#dad2c3] to-[#8fa08a] text-stone-900",
  "from-[#8aa0aa] via-[#4d6875] to-[#163242] text-white",
  "from-[#9d452c] via-[#79321f] to-[#3d1c12] text-white",
  "from-[#f5efe4] via-[#d6d0bd] to-[#8a9a74] text-stone-900",
];

function MiniBookCover({ book, index }: { book?: Book; index: number }) {
  const title = book?.title ?? "";

  return (
    <AppLink
      href={book ? `/books/${book.slug}` : "/books"}
      className="group block min-w-0"
      aria-label={title || "book"}
    >
      <div className="relative aspect-3/4 overflow-hidden rounded-md border border-black/10 bg-stone-100 shadow-sm transition-transform group-hover:-translate-y-0.5 dark:border-white/10">
        {book?.imageUrl ? (
          <img src={book.imageUrl} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center bg-gradient-to-b p-2 text-center font-serif text-[10px] uppercase leading-4 sm:text-xs ${coverThemes[index % coverThemes.length]}`}
          >
            {title || "Incilaz"}
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
    </AppLink>
  );
}

export function HomeHero({ books, startReadingHref, bibleHref, commentaryHref }: HomeHeroProps) {
  const { t } = getI18n();
  const featuredBooks = books.slice(0, 6);
  const recommendedBooks = books.slice(6, 11);

  const quickLinks = [
    { label: t("homeQuickBible"), icon: BookOpen, href: bibleHref },
    { label: t("homeQuickCommentary"), icon: MessageSquareText, href: commentaryHref },
    // { label: t("homeQuickBooks"), icon: Bookmark, href: "/books" },
    // { label: t("homeQuickTheology"), icon: Landmark, href: commentaryHref },
    // { label: t("homeQuickAudio"), icon: Headphones, href: "/books" },
  ];

  const categories = [
    { title: t("homeCategoryOld"), meta: t("homeCategoryOldMeta"), image: "/images/mick-haupt-eQ2Z9ay9Wws-unsplash.jpg", href: '/azb' },
    { title: t("homeCategoryNew"), meta: t("homeCategoryNewMeta"), image: "/images/jerry-zhang-ePpaQC2c1xA-unsplash.jpg", href: '/azb' },
    { title: "V. Barklinin şərhləri", meta: "6 kitab", image: "/images/paper-white.webp", href: '/barclay' },
    // { title: t("homeCategoryLiving"), meta: t("homeCategoryLivingMeta"), image: "/images/paper-dark.webp" },
  ];

  return (
    <section className="relative overflow-hidden pb-10 pt-2 sm:pb-12 lg:pb-14">
      <ContainerWidth className="">
        <div className="rounded-[24px] bg-white/95 py-5 sm:py-7 dark:border-white/10 dark:bg-zinc-950/90">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div className="flex max-w-2xl flex-col">
              <h1 className="text-[clamp(2.7rem,4.8vw,3rem)] font-bold leading-[1.1] text-[#101820] dark:text-white">
                {t("homeHeroTitle")}
              </h1>
              <p className="mt-5 max-w-xl text-small text-zinc-600 sm:text-lg dark:text-zinc-300">
                {t("homeHeroDescription")}
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button asChild >
                  <AppLink
                    href={startReadingHref}
                    className="hover:text-white dark:hover:text-black"
                  >
                    {t("homeStartReading")}
                  </AppLink>
                </Button>

                <Button asChild variant="outline" >
                  <AppLink
                    href="/books"
                  >
                    {t("homeBrowseLibrary")}
                  </AppLink>
                </Button>
              </div>

              {/* <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
                {quickLinks.map(({ label, icon: Icon, href }) => (
                  <AppLink
                    key={label}
                    href={href}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-stone-200 bg-white px-3 text-sm text-zinc-700 shadow-sm transition-colors hover:bg-stone-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
                  >
                    <Icon className="size-4 text-[#775428] dark:text-amber-200" />
                    <span className="truncate">{label}</span>
                  </AppLink>
                ))}
              </div> */}
            </div>

            <div className="rounded-[22px] border border-stone-200 bg-[#fbfaf7] p-4 shadow-[0_20px_70px_-48px_rgba(42,34,21,0.55)] dark:border-white/10 dark:bg-white/5">
              <div className="grid gap-y-4 xl:grid-cols-[1fr]">
                <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950/80">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-sm font-semibold">{t("books")}</h2>
                    <AppLink href="/books" className="text-xs text-zinc-500 hover:text-[#18375d]">
                      {t("homeViewAll")}
                    </AppLink>
                  </div>
                  <div className="grid grid-cols-5 gap-4">
                    {(recommendedBooks.length ? recommendedBooks : featuredBooks).slice(0, 5).map((book, index) => (
                      <MiniBookCover key={book.id} book={book} index={index + 1} />
                    ))}
                    {books.length === 0 &&
                      Array.from({ length: 5 }).map((_, index) => <MiniBookCover key={index} index={index} />)}
                  </div>
                </div>

                <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm xl:col-span-3 dark:border-white/10 dark:bg-zinc-950/80">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{t("homeCategoriesTitle")}</h3>
                    <AppLink href={bibleHref} className="text-xs text-zinc-500 hover:text-[#18375d]">
                      {t("homeViewAll")}
                    </AppLink>
                  </div>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {categories.map((category) => (
                      <AppLink
                        key={category.title}
                        href={category.href}
                        className="overflow-hidden rounded-md border border-stone-200 bg-white transition-colors hover:bg-stone-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                      >
                        <div
                          className="h-16 bg-cover bg-center"
                          style={{ backgroundImage: `url(${category.image})` }}
                        ></div>
                        <div className="p-2">
                          <p className="truncate text-xs font-semibold">{category.title}</p>
                          <p className="text-[11px] text-zinc-500">{category.meta}</p>
                        </div>
                      </AppLink>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContainerWidth>
    </section >
  );
}
