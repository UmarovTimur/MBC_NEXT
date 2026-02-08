import { AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import Link from "next/link";
import { cva, VariantProps } from "class-variance-authority";

const linkVariants = cva("transition-color duration-200 ", {
  variants: {
    variant: {
      defalut: "text-gray-600 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-300",
      contrast: "text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400",
    },
    defaultVariants: {
      variant: "default",
    },
  },
});
interface AppLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof linkVariants> {
  href: string;
  children: ReactNode;
}

export const AppLink = ({ href, children, className, variant, ...props }: AppLinkProps) => {
  const isExsternal = /^https?:\/\//.test(href) || href.startsWith("//");
  const isSpecial = href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#");

  className = linkVariants({ variant, className });

  if (isExsternal) {
    return (
      <a href={href} target="_blan" rel="noopener noreferrer" className={className} {...props}>
        {children}
      </a>
    );
  }

  if (isSpecial) {
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cn("", className)} {...props}>
      {children}
    </Link>
  );
};
