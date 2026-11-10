// SEO copy for the /books/ page. Kept here rather than in the i18n dictionary:
// the dictionary is serialized to the client on every page.

const topics = [
  {
    title: "İman və ruhani inkişaf",
    text: "Allahı daha yaxından tanımaq, imanda böyümək və ruhani həyatınızı zənginləşdirmək.",
  },
  {
    title: "Ailə və nikah",
    text: "Sağlam ailə münasibətləri qurmaq, həyat yoldaşları arasında sevgi, hörmət və qarşılıqlı anlaşmanı gücləndirmək.",
  },
  {
    title: "Valideynlik və uşaqların tərbiyəsi",
    text: "Uşaqların mənəvi inkişafı, düzgün tərbiyə və ailə dəyərləri.",
  },
  {
    title: "Gənclər və yeniyetmələr",
    text: "Həyat seçimləri, münasibətlər, çətin suallar və gündəlik problemlərlə bağlı faydalı məsləhətlər.",
  },
  {
    title: "Müqəddəs Kitabın öyrənilməsi",
    text: "Xristian imanının əsaslarını, Müqəddəs Kitab həqiqətlərini və Allahın Kəlamını daha dərindən anlamaq.",
  },
];

export const BOOKS_PAGE_TITLE = "Azərbaycan dilində xristian və ruhani kitablar";

export function BooksLead() {
  return (
    <p className="mb-10 max-w-3xl text-base text-zinc-600 sm:text-lg dark:text-zinc-300">
      Incilaz kitablar bölməsində Azərbaycan dilində müxtəlif mövzularda xristian ədəbiyyatı və ruhani
      inkişaf üçün dəyərli kitablar toplanmışdır.
    </p>
  );
}

export function BooksAbout() {
  return (
    <section className="mt-14 max-w-3xl space-y-4 text-base leading-7 text-zinc-700 dark:text-zinc-300">
      <p>
        Burada dünyanın tanınmış xristian müəlliflərinin əsərləri ilə tanış ola bilərsiniz. Coş Makdauell,
        Maks Lukado, Stormi Omartian, Çarlz Stenli, Con Stott və digər müəlliflərin kitabları imanınızı
        möhkəmləndirməyə, Müqəddəs Kitabın həqiqətlərini daha dərindən anlamağa və gündəlik həyatınızda
        Allahın prinsiplərinə uyğun yaşamağa kömək edə bilər.
      </p>
      <h2 className="pt-2 text-xl font-bold text-zinc-900 dark:text-white">
        Kitablarımız müxtəlif mövzuları əhatə edir
      </h2>
      <ul className="list-disc space-y-2 pl-5">
        {topics.map((topic) => (
          <li key={topic.title}>
            <strong className="font-semibold text-zinc-900 dark:text-white">{topic.title}:</strong> {topic.text}
          </li>
        ))}
      </ul>
      <p>
        Məqsədimiz dəyərli kitabları Azərbaycan dilində oxuculara çatdırmaq, ruhani biliklərin yayılmasına və
        insanların iman yolunda inkişafına töhfə verməkdir.
      </p>
      <p>Sizə maraqlı olan kitabı seçin, yeni biliklər kəşf edin və mənəvi inkişaf yolunda irəliləyin!</p>
    </section>
  );
}
