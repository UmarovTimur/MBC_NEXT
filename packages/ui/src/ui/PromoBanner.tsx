import { ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";

interface PromoBannerProps {
  href: string;
  title: string;
  subtitle: string;
  tagline?: string;
  buttonLabel: string;
  domain?: string;
  /** Up to 3 illustrations, shown as staggered phone-like cards (front → back). */
  images: string[];
  imageAlt: string;
  logoSrc?: string;
  /** Lets the app pick its own heading font. */
  titleClassName?: string;
  className?: string;
}

// Front → back, staggered upward; all stay within the 250px banner height.
const cardLayout = [
  "left-0 top-[48px] h-[186px] w-[112px] z-30",
  "left-[92px] top-[32px] h-[186px] w-[112px] z-20",
  "left-[184px] top-[16px] h-[186px] w-[112px] z-10",
];

/**
 * Whole-banner external link in three columns: headline, a stack of
 * illustration cards, and a logo + CTA. The CTA is a <span> styled as a
 * button, since nesting an <a>/<button> inside the outer <a> is invalid.
 */
export function PromoBanner({
  href,
  title,
  subtitle,
  tagline,
  buttonLabel,
  domain,
  images,
  imageAlt,
  logoSrc,
  titleClassName,
  className,
}: PromoBannerProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={cn(
        "group relative flex flex-col items-center gap-6 rounded-2xl px-5 py-7 text-center text-[#6e1a12]",
        "bg-[linear-gradient(to_bottom,#fde4d6,#fbc79c_35%,#f08a62_70%,#d9503f)]",
        "dark:bg-[linear-gradient(to_bottom,#3b1d17,#5e2419_35%,#86291f_70%,#a8322a)] dark:text-[#fde4d6]",
        "md:grid md:h-[250px] md:grid-cols-[1fr_300px_1fr] md:gap-8 md:py-0",
        className,
      )}
    >
      {/* Headline */}
      <div className="flex flex-col items-center">
        <h2
          className={cn(
            "text-[34px] font-black leading-[0.95] tracking-tight text-balance sm:text-[42px]",
            titleClassName,
          )}
        >
          {title}
        </h2>
        <p className="mt-3 max-w-xs text-sm leading-snug opacity-90 sm:text-[15px]">{subtitle}</p>
      </div>

      {/* Card stack */}
      <div className="relative h-[250px] w-[296px] shrink-0 md:h-full">
        {images.slice(0, 3).map((src, i) => (
          <div
            key={src}
            className={cn(
              "absolute rounded-[20px] bg-white p-1.5 shadow-[0_12px_28px_-10px_rgba(110,26,18,0.55)]",
              "dark:bg-[#fde4d6] dark:shadow-black/50",
              cardLayout[i],
            )}
          >
            <div className="h-full overflow-hidden rounded-[15px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={imageAlt}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Logo + CTA */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-stretch gap-3">
          {logoSrc && (
            <div className="rounded-xl bg-white p-1.5 shadow-sm dark:bg-[#fde4d6]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt="" loading="lazy" width={52} height={52} className="size-[52px] rounded-lg" />
            </div>
          )}
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-xl bg-white px-5 text-base font-semibold text-[#6e1a12] shadow-sm",
              "transition-all duration-200 group-hover:bg-[#fff6f0] group-hover:shadow-[0_6px_20px_-6px_rgba(110,26,18,0.5)]",
              "dark:bg-[#fde4d6] dark:text-[#5e2419] dark:group-hover:bg-white",
            )}
          >
            {buttonLabel}
            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
        <div className="text-[13px] leading-snug opacity-85">
          {tagline && <p>{tagline}</p>}
          {domain && <p className="font-semibold">{domain}</p>}
        </div>
      </div>
    </a>
  );
}
