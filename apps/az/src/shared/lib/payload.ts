export type PayloadBook = {
  id: number;
  slug: string;
  title: string;
  locale: 'az' | 'uz' | 'ru';
  author?: string;
  subtitle?: string;
  description?: string;
  source?: 'mukitob' | 'manual';
  sourceBookKey?: string;
  sourceId?: number;
  detailUrl?: string;
  readUrl?: string;
  previewPages?: number;
  coverImageUrl?: string;
  coverImage?: {
    url: string;
    alt?: string;
  };
  downloads?: {
    id?: string;
    format: string;
    label: string;
    fileSize?: string;
    description?: string;
    url: string;
    sortOrder?: number;
  }[];
  status: 'draft' | 'published';
};

type PayloadResponse<T> = {
  docs: T[];
};

function apiUrl(path: string) {
  const base = process.env.PAYLOAD_API_URL ?? 'http://localhost:8001';
  return `${base}${path}`;
}

export async function fetchBooks(): Promise<PayloadBook[]> {
  const url = apiUrl('/api/books?where[locale][equals]=az&where[status][equals]=published&depth=1&limit=200&sort=sourceId');
  const res = await fetch(url, {
    cache: process.env.NODE_ENV === 'production' ? 'force-cache' : 'no-store',
  });
  if (!res.ok) throw new Error(`Payload API error: ${res.status}`);
  const data: PayloadResponse<PayloadBook> = await res.json();
  return data.docs;
}

export async function fetchBookBySlug(slug: string): Promise<PayloadBook | null> {
  const decoded = decodeURIComponent(slug).normalize('NFC');
  const books = await fetchBooks();
  const found = books.find((b) => b.slug.normalize('NFC') === decoded);
  return found ?? null;
}
