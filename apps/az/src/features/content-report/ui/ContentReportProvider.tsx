"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/app/providers/I18n/ui/useI18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { useTextSelection } from "../lib/useTextSelection";
import { submitReport } from "../lib/submitReport";

/** How long the submit button stays disabled after the dialog opens — a
 * human cannot type a real comment faster than this, a script can. */
const SUBMIT_GUARD_MS = 1000;
const TRIGGER_MARGIN = 8;

type Step = "form" | "sending" | "success" | "rate-limited" | "contact-success" | "error";

export function ContentReportProvider() {
  const { t } = useI18n();
  const selection = useTextSelection();
  const [open, setOpen] = useState(false);
  // Ctrl/Cmd+Enter only exists as a discoverable shortcut where there's a
  // real keyboard — showing the hint on a touch device would just confuse.
  const [hasKeyboard, setHasKeyboard] = useState(false);
  const [shortcutLabel, setShortcutLabel] = useState("Ctrl+Enter");
  const [pendingText, setPendingText] = useState("");
  const [comment, setComment] = useState("");
  const [contact, setContact] = useState("");
  const [contactOnly, setContactOnly] = useState("");
  const [step, setStep] = useState<Step>("form");
  const openedAtRef = useRef(0);
  const [canSubmit, setCanSubmit] = useState(false);

  const openDialog = (text: string) => {
    setPendingText(text);
    setComment("");
    setContact("");
    setContactOnly("");
    setStep("form");
    setCanSubmit(false);
    openedAtRef.current = Date.now();
    setOpen(true);
  };

  // Ctrl/Cmd+Enter opens the dialog directly for the current selection —
  // the desktop power-user path alongside the floating trigger below.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.key === "Enter" && (e.ctrlKey || e.metaKey))) return;
      const text = window.getSelection()?.toString().trim() ?? "";
      if (text.length < 2) return;
      e.preventDefault();
      openDialog(text);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => setCanSubmit(true), SUBMIT_GUARD_MS);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setHasKeyboard(mq.matches);
    const handler = (e: MediaQueryListEvent) => setHasKeyboard(e.matches);
    mq.addEventListener("change", handler);

    if (navigator.platform?.toLowerCase().includes("mac")) setShortcutLabel("⌘+Enter");

    return () => mq.removeEventListener("change", handler);
  }, []);

  const honeypotRef = useRef<HTMLInputElement>(null);

  const handleSubmitReport = async () => {
    if (!canSubmit || comment.trim().length < 3) return;
    setStep("sending");
    const result = await submitReport({
      type: "report",
      pageUrl: window.location.href,
      selectedText: pendingText,
      comment,
      contact: contact || undefined,
      honeypot: honeypotRef.current?.value ?? "",
    });
    if (result === "ok") setStep("success");
    else if (result === "rate_limited") setStep("rate-limited");
    else setStep("error");
  };

  const handleSubmitContact = async () => {
    if (contactOnly.trim().length < 3) return;
    setStep("sending");
    const result = await submitReport({
      type: "contact",
      pageUrl: window.location.href,
      contact: contactOnly,
      honeypot: honeypotRef.current?.value ?? "",
    });
    setStep(result === "ok" ? "contact-success" : "error");
  };

  return (
    <>
      {selection && !open && (
        <Button
          type="button"
          variant="outline"
          // Without this, mousedown/touchstart on the button collapses the
          // live selection (browser default for a click outside the range)
          // before the click fires — on a slow/held click the debounced
          // selectionchange handler unmounts this button mid-gesture and the
          // click never lands. preventDefault keeps the selection (and the
          // button) alive for the whole gesture.
          onMouseDown={(e) => e.preventDefault()}
          onTouchStart={(e) => e.preventDefault()}
          onClick={() => openDialog(selection.text)}
          style={{
            position: "fixed",
            left: Math.max(
              TRIGGER_MARGIN,
              Math.min(selection.rect.left, window.innerWidth - 220 - TRIGGER_MARGIN),
            ),
            top:
              selection.rect.top > 48
                ? selection.rect.top - 44
                : selection.rect.bottom + TRIGGER_MARGIN,
          }}
          className="z-40 h-9 gap-1.5 bg-white px-3.5 text-xs font-medium text-zinc-700 shadow-md dark:bg-zinc-900 dark:text-zinc-200"
        >
          {t("reportTriggerLabel")}
          {hasKeyboard && (
            <kbd className="rounded border border-current/20 bg-black/5 px-1.5 py-0.5 font-sans text-[10px] font-normal text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
              {shortcutLabel}
            </kbd>
          )}
        </Button>
      )}

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setStep("form");
        }}
      >
        <DialogContent>
          {/* Bots fill every field, including hidden ones; kept out of tab order and off-screen rather than display:none, which some scrapers skip. */}
          <input
            ref={honeypotRef}
            type="text"
            name="website"
            autoComplete="off"
            tabIndex={-1}
            aria-hidden="true"
            className="absolute -left-[9999px]"
          />

          {(step === "form" || step === "sending") && (
            <>
              <DialogHeader>
                <DialogTitle>{t("reportDialogTitle")}</DialogTitle>
                <DialogDescription>
                  {t("reportSelectedTextLabel")}
                  {hasKeyboard && (
                    <>
                      {" · "}
                      {t("reportShortcutHint")} <kbd className="rounded border border-current/20 px-1 py-0.5 font-sans text-[10px]">{shortcutLabel}</kbd>
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>

              <blockquote className="max-h-24 overflow-y-auto rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm italic text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                “{pendingText}”
              </blockquote>

              <div className="flex flex-col gap-3">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={t("reportCommentPlaceholder")}
                  aria-label={t("reportCommentLabel")}
                  maxLength={2000}
                  rows={4}
                  autoFocus
                />
                <Input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={t("reportContactPlaceholder")}
                  aria-label={t("reportContactLabel")}
                  maxLength={200}
                />
              </div>

              <DialogFooter>
                <Button
                  onClick={handleSubmitReport}
                  disabled={!canSubmit || comment.trim().length < 3 || step === "sending"}
                >
                  {t("reportSubmit")}
                </Button>
              </DialogFooter>
            </>
          )}

          {step === "success" && (
            <div className="py-4 text-center">
              <p className="text-base font-medium">{t("reportSuccess")}</p>
            </div>
          )}

          {step === "error" && (
            <div className="py-4 text-center">
              <p className="text-base font-medium text-destructive">{t("reportErrorGeneric")}</p>
            </div>
          )}

          {step === "rate-limited" && (
            <>
              <DialogHeader>
                <DialogTitle>{t("reportRateLimitedTitle")}</DialogTitle>
                <DialogDescription>{t("reportRateLimitedText")}</DialogDescription>
              </DialogHeader>

              <Input
                value={contactOnly}
                onChange={(e) => setContactOnly(e.target.value)}
                placeholder={t("reportContactPlaceholder")}
                aria-label={t("reportContactLabel")}
                maxLength={200}
                autoFocus
              />

              <DialogFooter>
                <Button onClick={handleSubmitContact} disabled={contactOnly.trim().length < 3}>
                  {t("reportContactSubmit")}
                </Button>
              </DialogFooter>
            </>
          )}

          {step === "contact-success" && (
            <div className="py-4 text-center">
              <p className="text-base font-medium">{t("reportContactSuccess")}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
