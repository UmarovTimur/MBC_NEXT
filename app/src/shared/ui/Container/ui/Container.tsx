import { cn } from "@/shared/lib/utils";
import { HTMLAttributes, ReactNode } from "react";

interface ContainerProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string | "";
}


export const ContainerWidth = ({ children, className = "", ...rest }: ContainerProps) => (
  <div {...rest} className={cn("px-4 max-w-7xl mx-auto", className)}>
    {children}
  </div>
);
