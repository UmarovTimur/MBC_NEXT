import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: null },
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div>
      <h1>404</h1>
      <p>Страница не найдена</p>
    </div>
  )
}
