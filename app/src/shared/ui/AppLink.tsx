import { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import Link from "next/link";

interface AppLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: ReactNode;
  prefetch?: boolean;
}

export const AppLink = ({ href, children, className, prefetch = false, ...props }: AppLinkProps) => {
  const isExsternal = /^https?:\/\//.test(href) || href.startsWith("//");
  const isSpecial = href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#");

  className = cn(
    "text-gray-600 dark:text-gray-500 ",
    "transition-color hover:text-blue-500 dark:hover:text-blue-300 ",
    className,
  );

  if (isExsternal) {
    return (
      <a href={href} target="_blan" rel="noopener noreferrer" className={className} {...props}>
        {children}
      </a>
    );
  }

  if (isSpecial) {
    return (
      <a href={href} className={className} {...props} >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} prefetch={prefetch} className={cn("", className)} {...props}>
      {children}
    </Link>
  );
};
