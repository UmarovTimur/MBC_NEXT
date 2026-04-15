'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(10);
    setVisible(true);
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 85) {
          clearInterval(intervalRef.current!);
          return 85;
        }
        return p + Math.random() * 8;
      });
    }, 200);
  };

  const finish = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setProgress(100);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 300);
  };

  // Hide when navigation completes
  useEffect(() => {
    finish();
  }, [pathname, searchParams]);

  // Show on internal link click (skip same-page links)
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;
      if (anchor.target === '_blank') return;

      // Don't start if navigating to the same pathname (+search)
      const currentUrl = window.location.pathname + window.location.search;
      const normalized = href.startsWith('/') ? href : `/${href}`;
      if (normalized === currentUrl || normalized === window.location.pathname) return;

      start();
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] bg-primary transition-all duration-200 ease-out"
      style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }}
    />
  );
}
