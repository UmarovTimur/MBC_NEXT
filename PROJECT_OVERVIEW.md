# MBC_NEXT — обзор проекта

Yarn-workspaces монорепо (`apps/*`, `packages/*`) для мультиязычной платформы чтения Библии и духовной литературы. Языковые приложения (az, uz) — Next.js фронтенды, читающие контент из статичных HTML-файлов; админка — отдельный Payload CMS для управления каталогом книг и медиа.

## apps/admin — Payload CMS

Стек: Next.js 15, Payload CMS 3.82, PostgreSQL (`@payloadcms/db-postgres`), Lexical richtext, Sharp.

- Назначение: headless CMS для каталога книг, медиа-файлов и пользователей admin-панели.
- Коллекции (`src/collections/`):
  - `Users.ts` — авторизация по email, роли Admin/Editor
  - `Books.ts` — карточки книг: title, slug, locale, author, описание, обложка, массив downloads (PDF/DOCX/EPUB/FB2/RTF/TXT, без аудио), статус Draft/Published
  - `Media.ts` — загрузка изображений, авто-конвертация в WebP (85%), генерация thumbnail
- Admin UI: `/admin` (`src/app/(payload)/admin/`), REST API: `src/app/(payload)/api/[...slug]/route.ts`
- Скрипты импорта данных (`scripts/`):
  - `import-mukitob-az-books.ts` — импорт книг из `migration/output/mukitob-az/books.json`
  - `import-mukitob-az-books-csv.ts` — альтернативный импорт из CSV, с режимом `--dry-run`
  - вспомогательные утилиты в `migration/` (скрейпинг каталога Mukitob, сплиттер DOCX-Библии)
- Медиа хранится в `media/`

## apps/az — читалка Библии (азербайджанский)

Стек: Next.js 15, React 19, TailwindCSS 4, Radix UI (через `@mbc/ui`), next-themes.

- Назначение: чтение Библии + комментариев В. Барклая на азербайджанском языке.
- Структура по FSD-подобному паттерну:
  - `entities/bible`, `entities/book` — доменные модели
  - `features/bible-navigation` — выбор книги/главы
  - `widgets/BibleViewer`, `Navbar`, `HomeHero`, `BooksPage` — крупные блоки страниц
  - `shared/config/bibles/az.json` — метаданные Библий (barclay — комментарий, azb — перевод)
- Источник текста: статичные файлы `apps/az/html/{bookId}/{chapterId}.html`, читаются лениво через пакет `@mbc/bible-reader` (без БД).
- Ключевые фичи: split-screen чтение (Barclay + AZB) с адаптацией под мобильные, скрытие хедера при скролле вниз, тёмная тема, статический экспорт (PWA-режим).

## apps/uz

Тот же стек и архитектура, что у `apps/az`, но для узбекского языка (детально не исследовался — см. `apps/uz/html`, `shared/config/bibles/uz.json` по аналогии).

## Общие пакеты

- `packages/bible-reader` — класс `Bible`, читает HTML-главы с диска, поддержку «прикреплённой» Библии (комментарий + перевод)
- `packages/ui` — общая библиотека компонентов на базе Radix UI + Tailwind

## migration/output/audio — аудио Библии (AZB, азербайджанский)

Папка `migration/output/audio/` содержит аудиозаписи всех 1189 глав Библии на азербайджанском языке (перевод AZB), скачанных с YouTube-канала [Kitab Şirkəti (@KitabShirketi)](https://www.youtube.com/@KitabShirketi).

**Структура:** 66 подпапок по одной на каждую книгу, именованных `NN - Название Kitabı/`, где `NN` — порядковый номер книги (01–66). Файлы внутри: `01.mp3`, `02.mp3`, ... (для книг ≥100 глав — трёхзначная нумерация: `001.mp3`, ..., `150.mp3`).

**Охват:**
- Ветхий завет: 929 глав (39 книг)
- Новый завет: 260 глав (27 книг)
- Итого: **1189 mp3-файлов** — полный канон протестантской Библии

**Особенности источника:**
- Псалмы (19 - Zəbur): плейлист канала содержал только главы 1–100; главы 101–150 загружены отдельно напрямую с канала (они опубликованы как видео, но не добавлены в плейлист).
- Hakimlər (Судьи) глава 21: аналогично — есть на канале, но отсутствует в плейлисте.
- Скрипт для (пере)скачивания: `migration/download-youtube-audio.mjs` (использует `yt-dlp`).

## Команды (корневой package.json)

```
yarn dev:az / dev:uz / dev:admin
yarn build:az / build:uz / build:admin
```
