import { cn } from "@/shared/lib/utils";
import { AppLink } from "@/shared/ui/AppLink";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
  return (
    <nav aria-label="breadcrumb" className={cn("text-sm text-gray-500 dark:text-gray-400 pb-4", className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && <span className="select-none">/</span>}
              {item.href && !isLast ? (
                <AppLink href={item.href} variant="default" className="hover:text-blue-500">
                  {item.label}
                </AppLink>
              ) : (
                <span className={cn(isLast && "text-gray-800 dark:text-gray-200 font-medium")}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
