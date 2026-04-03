export type WpBook = {
  id: number;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content: { rendered: string };
  _embedded?: {
    "wp:featuredmedia"?: { source_url: string }[];
  };
};

export async function fetchBooks(categoryId: number): Promise<WpBook[]> {
  const base = process.env.WP_API_URL;
  if (!base) throw new Error("WP_API_URL is not set");

  const url = `${base}/posts?categories=${categoryId}&per_page=100&_embed=true`;
  const res = await fetch(url, { cache: "force-cache" });

  if (!res.ok) throw new Error(`WP API error: ${res.status}`);

  return res.json();
}

export async function fetchBookBySlug(slug: string): Promise<WpBook | null> {
  const base = process.env.WP_API_URL;
  if (!base) throw new Error("WP_API_URL is not set");

  const url = `${base}/posts?slug=${slug}&_embed=true`;
  const res = await fetch(url, { cache: "force-cache" });

  if (!res.ok) throw new Error(`WP API error: ${res.status}`);

  const posts: WpBook[] = await res.json();
  return posts[0] ?? null;
}
