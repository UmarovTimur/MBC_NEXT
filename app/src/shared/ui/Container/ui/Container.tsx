import { classNames } from "@/shared/classNames/classNames";
import React, { HTMLAttributes, ReactNode } from "react";

interface ContainerProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string | "";
}

export const ContainerWidth = ({ children, className, ...rest }: ContainerProps) => {
  return (
    <div {...rest} className={classNames("container px-4 mx-auto:1280 mx-auto", {}, [className || ""])}>
      {children}
    </div>
  );
};
