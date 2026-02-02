"use client";

import { createContext, ReactNode, useContext } from "react";
import { BibleManifest } from "../model/types";

const BibleContext = createContext<BibleManifest | null>(null);

export const ManifestProvider = ({
  children,
  manifest,
}: {
  children: ReactNode;
  manifest: BibleManifest;
}) => {
  return <BibleContext.Provider value={manifest} >{children}</BibleContext.Provider>
}


export const useBible = () => {
  const context = useContext(BibleContext);
  if (!context) {
    throw new Error("useBible must be use within a BibleProvider");
  }

  return context;
}