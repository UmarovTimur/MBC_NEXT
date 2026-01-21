import { classNames } from "@/shared/classNames/classNames";
import React, { HTMLAttributes, ReactNode } from "react";

interface ContainerProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string | "";
}


export const ContainerWidth = ({ children, className = "", ...rest }: ContainerProps) => (
  <div {...rest} className={classNames("px-4 max-w-7xl mx-auto" , {}, [className])}>
    {children}
  </div>
);
