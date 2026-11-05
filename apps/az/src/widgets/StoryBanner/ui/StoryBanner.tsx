import { ContainerWidth } from "@/shared/ui/Container";
import { Comfortaa, Nunito } from "next/font/google";
import type { CSSProperties, ReactNode } from "react";
import "./StoryBanner.css";

const SITE = "https://101story.org";

const titleFont = Comfortaa({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  weight: "700",
  variable: "--font-story-banner-title",
  preload: false,
});

const bodyFont = Nunito({
  subsets: ["latin", "latin-ext", "cyrillic", "cyrillic-ext"],
  weight: ["400", "600"],
  variable: "--font-story-banner-body",
  preload: false,
});

const FlagUyghur = () => (
  <svg viewBox="0 0 20 14" aria-hidden="true">
    <rect width="20" height="14" fill="#8FC1E8" />
    <circle cx="7" cy="7" r="4" fill="#fff" />
    <circle cx="8.5" cy="7" r="3.4" fill="#8FC1E8" />
    <polygon points="12,5 12.8,7 15,7 13.2,8.2 13.9,10.3 12,9 10.1,10.3 10.8,8.2 9,7 11.2,7" fill="#fff" />
  </svg>
);

const FlagKarakalpak = () => (
  <svg viewBox="0 0 20 14" aria-hidden="true">
    <rect width="20" height="4.67" fill="#4EA9E0" />
    <rect y="4.67" width="20" height="4.67" fill="#F5C518" />
    <rect y="9.33" width="20" height="4.67" fill="#3CB043" />
    <circle cx="5" cy="2.3" r="1.5" fill="#fff" />
    <circle cx="5.7" cy="2.3" r="1.2" fill="#4EA9E0" />
  </svg>
);

const FlagKurdish = () => (
  <svg viewBox="0 0 20 14" aria-hidden="true">
    <rect width="20" height="14" fill="#ED1C24" />
    <rect y="4.67" width="20" height="4.67" fill="#fff" />
    <rect y="9.33" width="20" height="4.67" fill="#00A651" />
    <circle cx="10" cy="7" r="2.1" fill="#FDB913" />
  </svg>
);

const FlagSakha = () => (
  <svg viewBox="0 0 20 14" aria-hidden="true">
    <rect width="20" height="14" fill="#5CB8E4" />
    <circle cx="7" cy="6" r="3" fill="#fff" />
    <rect y="11" width="20" height="1" fill="#1E3F8B" />
    <rect y="12" width="20" height="1" fill="#fff" />
    <rect y="13" width="20" height="1" fill="#D52B1E" />
  </svg>
);

const FlagTuva = () => (
  <svg viewBox="0 0 20 14" aria-hidden="true">
    <rect width="20" height="14" fill="#4EA9E0" />
    <polygon points="0,14 9,14 0,4" fill="#fff" />
    <polygon points="0,14 8,14 0,5.5" fill="#F5C518" />
  </svg>
);

const FlagKalmyk = () => (
  <svg viewBox="0 0 20 14" aria-hidden="true">
    <rect width="20" height="14" fill="#FFD100" />
    <circle cx="10" cy="7" r="4" fill="#fff" />
    <circle cx="10" cy="7" r="3" fill="#0072CE" />
  </svg>
);

const FlagPlautdietsch = () => (
  <svg viewBox="0 0 20 14" aria-hidden="true">
    <rect width="20" height="14" fill="#3CA23C" />
    <line x1="0" y1="0" x2="20" y2="14" stroke="#FFD100" strokeWidth="3.4" />
    <line x1="0" y1="14" x2="20" y2="0" stroke="#FFD100" strokeWidth="3.4" />
    <line x1="0" y1="0" x2="20" y2="14" stroke="#3B4CA3" strokeWidth="2" />
    <line x1="0" y1="14" x2="20" y2="0" stroke="#3B4CA3" strokeWidth="2" />
  </svg>
);

type ShelfBook = {
  path: string;
  lang: string;
  cloth: string;
  image: string;
  flag: ReactNode;
  name: string;
  longName?: boolean;
  title: string;
};

// Азербайджанский идёт первым: баннер показывается на азербайджанском сайте.
const shelfBooks: ShelfBook[] = [
  { path: "az", lang: "az", cloth: "#1d4a4b", image: "30", flag: "🇦🇿", name: "Azərbaycan", title: "Müqəddəs Kitab hekayələri" },
  { path: "ru", lang: "ru", cloth: "#6b1f24", image: "01", flag: "🇷🇺", name: "Русский", title: "Библейские истории" },
  { path: "uz", lang: "uz", cloth: "#23452f", image: "04", flag: "🇺🇿", name: "O‘zbekcha", title: "Muqaddas Kitob hikoyalari" },
  { path: "kk", lang: "kk", cloth: "#1f2f4d", image: "41", flag: "🇰🇿", name: "Қазақша", title: "Киелі кітап әңгімелері" },
  { path: "tg", lang: "tg", cloth: "#7a5418", image: "02", flag: "🇹🇯", name: "Тоҷикӣ", title: "Ҳикояҳои Китоби Муқаддас" },
  { path: "ky", lang: "ky", cloth: "#4a2342", image: "45", flag: "🇰🇬", name: "Кыргызча", title: "Ыйык Китеп аңгемелери" },
  { path: "ug", lang: "ug-Cyrl", cloth: "#5a3320", image: "53", flag: <FlagUyghur />, name: "Уйғур тили", title: "Муқәддәс Китап һекайилири" },
  { path: "kaa", lang: "kaa", cloth: "#2f3a46", image: "11", flag: <FlagKarakalpak />, name: "Қарақалпақ тили", longName: true, title: "Мухаддес Китап хикаялары" },
];

const footerFlags: { path: string; label: string; flag: ReactNode }[] = [
  { path: "tr", label: "Türkçe", flag: "🇹🇷" },
  { path: "uk", label: "Українська", flag: "🇺🇦" },
  { path: "fa", label: "فارسی", flag: "🇮🇷" },
  { path: "mn", label: "Монгол хэл", flag: "🇲🇳" },
  { path: "hy", label: "Հայերեն", flag: "🇦🇲" },
  { path: "ka", label: "ქართული", flag: "🇬🇪" },
  { path: "sgh", label: "Шугнон-Помир", flag: "🇹🇯" },
  { path: "de", label: "Deutsch", flag: "🇩🇪" },
  { path: "es", label: "Español", flag: "🇪🇸" },
  { path: "ro", label: "Română", flag: "🇷🇴" },
  { path: "kmr", label: "Kurdî", flag: <FlagKurdish /> },
  { path: "sah", label: "Саха тыла", flag: <FlagSakha /> },
  { path: "tyv", label: "Тыва дыл", flag: <FlagTuva /> },
  { path: "xal", label: "Хальмг келн", flag: <FlagKalmyk /> },
  { path: "pdt", label: "Plautdietsch", flag: <FlagPlautdietsch /> },
];

export function StoryBanner() {
  return (
    <ContainerWidth className="mb-10 lg:mb-14">
      <nav className={`bb ${titleFont.variable} ${bodyFont.variable}`} aria-label="101story.org">
        <div className="bb__head" lang="az">
          <img
            className="bb__photo"
            src={`${SITE}/100story_lg.jpg`}
            alt=""
            width={639}
            height={639}
            loading="lazy"
            decoding="async"
          />
          <div>
            <a className="bb__title" href={`${SITE}/az/`} target="_blank" rel="noopener" hrefLang="az">
              Müqəddəs Kitab hekayələri
            </a>
            <div className="bb__stores">
              <a
                className="bb__store"
                href="https://play.google.com/store/apps/details?id=com.bm.audiobible&hl=az&referrer=utm_source%3D101story.org%26utm_medium%3Dbanner"
                target="_blank"
                rel="noopener"
                aria-label="Google Play: Yükləyin"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" />
                </svg>
                Google Play
              </a>
              <a
                className="bb__store"
                href="https://apps.apple.com/ru/app/%D0%B1%D0%B8%D0%B1%D0%BB%D0%B5%D0%B9%D1%81%D0%BA%D0%B8%D0%B5-%D0%B8%D1%81%D1%82%D0%BE%D1%80%D0%B8%D0%B8-ru/id1634591716"
                target="_blank"
                rel="noopener"
                aria-label="App Store: Yükləyin"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
                </svg>
                App Store
              </a>
            </div>
          </div>
        </div>

        <ul className="bb__shelf">
          {shelfBooks.map((book) => (
            <li className="bb__slot" key={book.path}>
              <a
                className="bb-book"
                href={`${SITE}/${book.path}/`}
                target="_blank"
                rel="noopener"
                hrefLang={book.lang}
                lang={book.lang}
                dir="ltr"
                style={{ "--cloth": book.cloth } as CSSProperties}
              >
                <span className="bb-book__window">
                  <img
                    src={`${SITE}/img/256/${book.image}.webp`}
                    srcSet={`${SITE}/img/192/${book.image}.webp 192w, ${SITE}/img/256/${book.image}.webp 256w, ${SITE}/img/384/${book.image}.webp 384w`}
                    sizes="(max-width: 640px) 100px, 160px"
                    alt=""
                    width={256}
                    height={171}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="bb-book__text">
                  <span className="bb-book__flag" aria-hidden="true">{book.flag}</span>
                  <span className={`bb-book__name${book.longName ? " bb-book__name--long" : ""}`}>{book.name}</span>
                  <span className="bb-book__title">{book.title}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="bb__foot">
          <a className="bb__brand" href={`${SITE}/`} target="_blank" rel="noopener">101story.org</a>
          <ul className="bb__flags">
            {footerFlags.map(({ path, label, flag }) => (
              <li key={path}>
                <a
                  className="bb__flag"
                  href={`${SITE}/${path}/`}
                  target="_blank"
                  rel="noopener"
                  hrefLang={path}
                  title={label}
                  aria-label={label}
                >
                  {flag}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </ContainerWidth>
  );
}
