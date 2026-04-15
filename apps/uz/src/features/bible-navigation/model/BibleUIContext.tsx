"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import { ChaptersTable } from "../ui/ChaptersTable";

type UIState = {
  booksOpen: boolean;
  chaptersOpen: boolean;
};

type BibleUiContextValue = {
  state: UIState;
  openBooks: () => void;
  openChapters: () => void;
  setOpen: (key: keyof UIState, value: boolean) => void;
};

const BibleUiContext = createContext<BibleUiContextValue | null>(null);

export function BibleUiProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UIState>({
    booksOpen: false,
    chaptersOpen: false,
  });

  const actions = useMemo(
    () => ({
      openBooks: () => setState((prev) => ({ ...prev, booksOpen: true, chaptersOpen: false })),
      openChapters: () => setState((prev) => ({ ...prev, booksOpen: false, chaptersOpen: true })),
      closeAll: () => setState((prev) => ({ ...prev, openChapters: false, chaptersOpen: false })),
      setOpen: (key: keyof UIState, value: boolean) => setState((prev) => ({ ...prev, [key]: value })),
    }),
    [],
  );

  return (
    <BibleUiContext.Provider value={{ state, ...actions }}>
      {children}
      <ChaptersTable
        open={state.chaptersOpen}
        onOpenChange={(val) => actions.setOpen("chaptersOpen", val)}
        hideTrigger
      />
    </BibleUiContext.Provider>
  );
}

export const useBibleUI = () => {
  const ctx = useContext(BibleUiContext);

  if (!ctx) {
    throw new Error("use BibleUI must be use within BibleUIProvider");
  }

  return ctx;
};
