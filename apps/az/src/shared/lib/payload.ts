export type PayloadBook = {
  id: string;
  slug: string;
  title: string;
  locale: 'az' | 'uz' | 'ru';
  excerpt?: string;
  content?: unknown;
  coverImage?: {
    url: string;
    alt?: string;
  };
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
  const url = apiUrl('/api/books?where[locale][equals]=az&where[status][equals]=published&depth=1&limit=100');
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`Payload API error: ${res.status}`);
  const data: PayloadResponse<PayloadBook> = await res.json();
  return data.docs;
}

export async function fetchBookBySlug(slug: string): Promise<PayloadBook | null> {
  const books = await fetchBooks();
  const found = books.find((b) => b.slug === slug);
  return found ?? null;
}
