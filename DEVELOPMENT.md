# MBC_NEXT — руководство по редактированию

Всё, что нужно знать, чтобы вносить изменения в проект и ничего не сломать.
`README.md` и `PROJECT_OVERVIEW.md` частично устарели: там написано, что текст Библии
читается из `apps/*/html/`. **Это уже не так**: весь текст теперь хранится в PostgreSQL
и отдаётся через Payload (`apps/admin`).

---

## 1. Архитектура в одном абзаце

Yarn 4 workspaces-монорепо (`apps/*`, `packages/*`), Node 24+.

```
apps/admin  — Payload CMS 3.82 + Next 15.4 + PostgreSQL. Единственный источник данных
              (Библии, главы, стихи, книги-каталог, медиа, жалобы на текст). Порт 8001.
apps/az     — Next 15.5 SSR-сайт на азербайджанском (incilaz.com). Порт 3001.
              Читает ВСЁ через REST API админки (PAYLOAD_API_URL).
apps/uz     — Next static export (output: "export") → FTP на kitobook.com. Легаси.
packages/bible-reader  — BibleManager/Bible: загрузка манифеста и глав из API, аудио,
                         названия глав. `@mbc/bible-reader/server` — только для сервера.
packages/bible-verses  — парсинг/рендер HTML главы ⇄ стихи, plain-text, санитайзер,
                         az-алфавит и фолдинг для поиска. Используется admin и az.
packages/ui            — общая UI-библиотека (shadcn/Radix + Tailwind 4).
migration/  — старые скрипты конвертации исходных HTML/DOCX, скачивание аудио.
scripts/    — бэкап БД, rsync/перенос аудио, git-хуки, патч Payload.
```

Поток данных: `PostgreSQL → Payload (admin, :8001) → REST → az (:3001)`.
**az не собирается и не стартует без работающей админки**: `apps/az/src/entities/bible/server.ts`
делает top-level `await BibleManager.initFromApi(...)`.

---

## 2. Локальный запуск

```bash
yarn install                     # postinstall: патч Payload + установка git-хуков
cp .env.example .env             # переменные для docker-compose (Postgres на 5433)
docker compose up db -d          # только сервис db, остальные в compose — мёртвые
cp apps/admin/.env.example apps/admin/.env
cp apps/az/.env.example apps/az/.env
yarn dev:admin                   # http://localhost:8001/admin
yarn dev:az                      # http://localhost:3001 (после старта админки)
```

На свежей БД: `CREATE EXTENSION IF NOT EXISTS pg_trgm;` (push его не создаёт) либо
`yarn workspace @mbc/admin exec payload migrate`.

### Переменные окружения

| Файл | Переменная | Назначение |
|---|---|---|
| `apps/admin/.env` | `DATABASE_URL` | строка подключения к Postgres |
| | `PAYLOAD_SECRET` | секрет Payload |
| | `CORS_URLS` | origins сайтов через запятую |
| | `PAYLOAD_SERVER_URL` | оставлять пустым, если не нужно (иначе csrf ломает cookie-auth) |
| | `PAYLOAD_CSRF` | опц., список origins |
| | `REPORT_IP_SALT` | соль для хеша IP в rate-limit жалоб |
| `apps/az/.env` | `PAYLOAD_API_URL` | адрес админки — **единственный** источник текста |
| | `APP_LANG` | `az` |
| | `DOMAIN`, `BASE_PATH` | канонический домен / подпуть |
| | `NEXT_PUBLIC_AUDIO_BASE_PATH` | опц., база URL аудио (по умолчанию `/audio`) |

`POSTGRES_*`, `DATABASE_URL`, `WP_*` в `apps/az/.env.example` — пережитки, az в БД напрямую не ходит.

---

## 3. Обязательные правила (CLAUDE.md)

- **Никаких полностью скруглённых кнопок** — `rounded-full` на кнопках запрещён.
- **Новые UI-компоненты — только в `packages/ui/src/ui/`**, по возможности взятые из shadcn,
  а не написанные руками. Затем:
  1. экспортировать из `packages/ui/src/index.ts`;
  2. в az — тонкий реэкспорт в `apps/az/src/shared/ui/<name>.tsx`
     (`export { X } from "@mbc/ui";`), как сделано для `button`, `popover` и т.д.
- Ad-hoc компоненты внутри приложения не создавать.
- Tailwind 4 в az сканирует `packages/ui/src` через `@source` в `globals.css` — классы из
  пакета подхватываются автоматически.

---

## 4. apps/az — как устроен код

FSD-подобная структура, алиас `@/*` → `apps/az/src/*`:

```
src/app/            — маршруты Next, провайдеры (I18n, Theme), globals.css, api-роуты
src/widgets/        — крупные блоки страниц (BibleViewer, Navbar, BibleSearch, Symphony…)
src/features/       — bible-navigation, bible-audio, content-report, verse-highlight
src/entities/       — bible (клиент + server.ts), book
src/shared/         — ui (реэкспорты @mbc/ui), lib (payload.ts, useHideOnScroll…), config
```

- Каждый слайс имеет `index.ts` — публичный API. Импортируй из `@/widgets/X`, а не из
  внутренних файлов. Серверный код — отдельно (`entities/bible/server.ts`, `import 'server-only'`).
- Слои импортируют только вниз: app → widgets → features → entities → shared.

### Маршруты

| Путь | Файл | Режим |
|---|---|---|
| `/` | `(pages)/(Home)/page.tsx` | `force-dynamic` |
| `/[bible]` | `(pages)/[bible]/page.tsx` | SSG, `revalidate=false` |
| `/[bible]/[bookId]/[chapterId]` | `.../[chapterId]/page.tsx` | SSG, `dynamicParams=false`, **все главы генерируются на билде** |
| `/books`, `/books/[slug]` | каталог книг из коллекции `books` | SSG |
| `/search` | полнотекстовый поиск | `force-dynamic` |
| `/simfoniya`, `/simfoniya/[num]` | симфония (конкорданс) | |
| `/api/search` | прокси к поиску admin (скрывает `PAYLOAD_API_URL`) | |
| `/api/content-reports` | прокси к `/api/content-reports/submit` | |

Следствия:
- Новая глава в БД появится на сайте только после пересборки az (`dynamicParams=false`).
- Билд az ходит в админку за каждой главой → долгий и прожорливый по памяти (на VPS добавлен swap).
- `next.config.ts`: `trailingSlash: true` — единый формат URL со слешем (`/books/`). Next сам
  делает 308 с `/books` на `/books/`, а `<Link>`/`router.push` дописывают слеш. Не возвращай
  `skipTrailingSlashRedirect` — он отключает и редирект, и нормализацию ссылок. В `fetch` к своим
  `/api/...` и в абсолютных URL (sitemap) слеш пиши вручную.

### i18n

- Все строки интерфейса — в `src/shared/config/dictionary/az.json`, ключ → текст.
- На сервере `getI18n().t(key)`, на клиенте `useI18n()`.
- В dev неизвестный ключ бросает ошибку — добавляй ключ в словарь одновременно с кодом.
- Хардкодить азербайджанский текст в компонентах не надо.

### Стили

- `src/app/styles/globals.css`: shadcn-токены (`--primary`, `--muted`…), `.dark` через
  `next-themes` (`@custom-variant dark`), стили HTML главы — `.bible-content`,
  `.bible-content--azb`, `.bible-content--barclay` (по `formattingStyle` Библии).
- Шрифты — `src/shared/config/fonts.ts` (Noto Sans, Roboto Condensed).
- `--audio-bar-h` выставляется, пока открыт нижний аудиоплеер; учитывай при фиксированных элементах снизу.
- Header, плавающая навигация по главам и аудиоплеер прячутся синхронно через
  `shared/lib/useHideOnScroll` — для новых «прилипающих» элементов используй его же.

### Прочее

- `src/shared/config/bibles/az.json` больше нигде не используется — конфиг Библий живёт
  в коллекции `bibles` в БД.
- Картинки: `next/image` с кастомным `loaderFile` `src/shared/image-loader.ts`.

---

## 5. apps/admin — Payload CMS

`apps/admin/payload.config.ts` + `apps/admin/src/collections/`:

| Коллекция | Что хранит | Доступ на чтение |
|---|---|---|
| `bibles` | корпуса: `bibleKey` (`azb`, `barclay`), `locale`, `attachment`, `defaultView`, `formattingStyle`, `storageMode`, `chapterSlug`… | public |
| `bible-books` | канонические названия книг на локаль (`bookId` = `"01"`…`"66"`) | public |
| `bible-chapters` | глава: `bible`, `book`, `chapterId` (`"0"` = введение, без паддинга), `html`; версии (50 на док) | public |
| `bible-verses` | стих-в-строке для `storageMode: 'verse'` (azb); `verseNumber=0` — преамбула | public |
| `books` | каталог книг для /books (обложки, файлы для скачивания, статус) | public |
| `media` | загрузки, авто-WebP | |
| `content-reports` | жалобы читателей на текст (выделение + Ctrl/Cmd+Enter) | только auth |
| `users` | админы/редакторы | |

Плюс таблица `bible_words` (симфония) — не коллекция, объявлена в `afterSchemaInit`, заполняется
скриптом `rebuild:words`.

### Два режима хранения текста — важно

- `storageMode: 'chapter'` (barclay): HTML лежит в `bible-chapters.html`, редактируется там.
- `storageMode: 'verse'` (azb): текст в `bible-verses`, HTML главы **собирается** эндпоинтом
  `GET /api/bible-chapters/assembled?bible=&book=&chapter=`. Поле `html` у главы — эталон для
  round-trip проверки и откат; менять его напрямую хук запрещает («edit the verses instead»).
  Стих редактируется как plain text — при сохранении тело стиха перестраивается из него.
- После правок стихов: `yarn workspace @mbc/admin rebuild:words` (симфония не пересчитывается сама)
  и при желании `verify:verses`.

### Кастомные эндпоинты

- `bible-chapters`: `/assembled`, `/:id/assembled`
- `bible-verses`: `/search` (FTS + trigram-фолбэк), `/words`, `/words-by-letter`
- `content-reports`: `/submit` (единственная публичная запись, с rate-limit по хешу IP;
  `access.create = false` намеренно — не открывать)

Поиск и индексы используют az-фолдинг (`src/lib/search/azFold.ts` ↔ `azFold` из `@mbc/bible-verses`).
Токенизация на сервере и подсветка на клиенте (`BibleSearch`) должны оставаться согласованными.

### Изменение схемы (коллекций) — порядок действий

1. Правишь коллекцию. В dev (`NODE_ENV=development`) Payload делает `push` — схема применяется сразу.
2. **Обязательно** создаёшь миграцию: `yarn workspace @mbc/admin exec payload migrate:create <name>`
   → файлы в `apps/admin/src/migrations/` (+ регистрируются в `index.ts`). На проде применяется
   только `payload migrate`, push там выключен.
3. `yarn workspace @mbc/admin generate:types` → обновить `payload-types.ts`.
4. Если меняешь поля, которые читает фронт, — обнови типы в `packages/bible-reader/src/lib/api.ts`
   (`RawBibleDoc`) / `apps/az/src/shared/lib/payload.ts` (`PayloadBook`).
5. Индексы-выражения и нестандартные таблицы — только через `afterSchemaInit` в `payload.config.ts`,
   иначе dev-push их удалит.

⚠️ Если в `payload_migrations` на сервере окажется строка с `batch = -1` (след dev-push на эту БД),
деплой упадёт намеренно — это нужно разрулить руками на сервере. Не запускай админку в
dev-режиме против продовой БД.

### Скрипты админки (`apps/admin/scripts`)

```
migrate:bible-html     — сид глав из старых HTML-файлов (архив)
migrate:bible-verses   — разложить HTML глав из БД на стихи (--bible --book --limit --dry-run --fail-fast)
verify:verses          — проверка round-trip стихов ⇄ исходный HTML
rebuild:words          — пересобрать bible_words для симфонии
import:mukitob:az(:csv)— импорт каталога книг
```

Запуск: `yarn workspace @mbc/admin <script>`.

---

## 6. Общие пакеты

- **@mbc/bible-reader** — `BibleManager.initFromApi(url, locale, fetchOptions)` грузит `bibles`,
  `bible-books` и манифест глав; `Bible` отдаёт главы (для verse-режима — через `/assembled`),
  названия глав (`chapter-name.ts`, порядковые суффиксы — `ordinal.ts`), URL аудио (`audio.ts`).
  Клиентская часть — `ManifestProvider`/`useBible`. Серверное — только из `/server`.
- **@mbc/bible-verses** — модель `ChapterDoc { preamble, verses[] }`, стих = список сегментов
  (41% стихов azb занимают несколько блоков — поэзия). Функции `parseChapterHtml`,
  `renderChapterHtml`, `verseToPlainText`, `sanitizeBlockHtml`, `azFold`, `compareAzWords`.
  Изменения здесь затрагивают и admin, и az — обязательно прогоняй тесты.
- Все пакеты публикуются исходниками (`main: ./src/index.ts`) и транспилируются через
  `transpilePackages` в `next.config.ts`. Новый пакет → добавить туда же.

---

## 7. Аудио

- 1189 mp3 в `apps/az/public/audio/azb/NN/CC.mp3` (паддинг 2 знака, 3 — у Псалмов), **не в git**
  (~5.2 ГБ). На VPS — `scripts/rsync-az-audio.sh`; деплой их не трогает.
- Какие Библии озвучены — `AUDIO_BIBLES` в `packages/bible-reader/src/lib/audio.ts`.
- Плеер — `apps/az/src/features/bible-audio` (нижний бар, выбор трека, скорость, настройки в localStorage).

---

## 8. Проверки перед коммитом

```bash
yarn test            # vitest: packages/*/src/**/*.test.ts и apps/az/src/**/*.test.ts
yarn typecheck:az    # tsc --noEmit для az
yarn workspace @mbc/az lint
```

Pre-commit хук (`.githooks/pre-commit`, ставится `scripts/setup-git-hooks.cjs` на postinstall)
запускает тесты всегда и typecheck az — если в коммите есть `apps/az` или `packages`.
Обход в экстренном случае: `git commit --no-verify`.

Стиль коммитов: `<область>: <что сделано>` в нижнем регистре —
`az: …`, `admin: …`, `ui: …`, `bible-reader: …`, `bible: …`, `ci: …`, `deploy: …`.

Для визуальной проверки админки есть headless-драйвер:
`node apps/admin/.claude/skills/run-admin/driver.mjs http://localhost:8001/admin out.png`.

---

## 9. Деплой

**az + admin → VPS** (`.github/workflows/deploy.yml`), на push в `main` при изменениях в
`apps/az`, `apps/admin`, `packages`, `ecosystem.config.cjs`, `package.json`, `yarn.lock`:

1. `git reset --hard origin/main` на сервере (локальные правки на VPS затираются).
2. `yarn install --immutable` — **`yarn.lock` должен быть закоммичен и актуален**.
3. build admin → `payload migrate` → `pm2 startOrRestart admin`.
4. Ожидание, пока admin ответит на `/api/bible-chapters/assembled` (до 60 с).
5. build az (генерирует все главы) → `pm2 startOrRestart` всего `ecosystem.config.cjs`.

Отсюда правило: **новый эндпоинт админки, который нужен билду az, должен выкатываться
в том же коммите — админка поднимается раньше сборки az**. Таймаут шага — 40 мин.

pm2: `admin` на 8001, `az` на 3001, логи в `logs/`. Бэкап БД — `scripts/backup-db.sh`.

**uz → FTP** (`deploy-uz.yml`): статический экспорт `apps/uz/out/`. Внимание: html-файлы uz
удалены, а `uz` теперь тоже читает API, при этом локаль `uz` из админки убрана
(миграция `remove_uz_locale`) — сборка uz сейчас получит пустые данные. Прежде чем
трогать uz, реши, что с ним делать.

---

## 10. Частые задачи — чеклисты

**Новая UI-штука** → shadcn-компонент в `packages/ui/src/ui/` → экспорт в `index.ts` →
реэкспорт в `apps/az/src/shared/ui/` → использование. Без `rounded-full` на кнопках.

**Новая строка интерфейса** → ключ в `dictionary/az.json` → `t("key")` / `useI18n()`.

**Новая страница az** → `src/app/(pages)/<route>/page.tsx`, логику — в виджет в `src/widgets/<Name>/`
с `index.ts`; решить режим рендера (`force-dynamic` vs SSG + `revalidate`), добавить в `sitemap.ts`.

**Новое поле в CMS** → коллекция → миграция → `generate:types` → типы на фронте → пересборка az.

**Исправить опечатку в тексте Библии** → в админке: azb — в `Bible Verses`, barclay — в
`Bible Chapters`; затем `rebuild:words` (для azb); на сайте появится через ISR (revalidate 60 с
для fetch) или после пересборки.

**Добавить новую Библию/корпус** → запись в `bibles` (+ `bible-books` для новой локали) →
главы/стихи через скрипты миграции → при наличии аудио добавить ключ в `AUDIO_BIBLES` →
стили `.bible-content--<formattingStyle>` в `globals.css` и маппинг в `shared/ui/BibleContent.tsx`.
