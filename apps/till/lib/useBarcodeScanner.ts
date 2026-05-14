"use client";

import { useEffect, useRef } from "react";

// Global keydown-capture barcode scanner. HID barcode readers (the
// most common type) act as keyboards, emitting digit/letter keystrokes
// followed by Enter. This hook captures keystrokes when no input or
// textarea is focused and treats fast-arriving sequences (chars within
// `gapMs` of each other) ending in Enter as a barcode.
//
// Pattern lifted from Afterroar (see CLAUDE.md note on
// `apps/ops/src/hooks/use-scanner.ts`): no hidden input fields, no
// listeners on individual inputs.

type Options = {
  onScan: (barcode: string) => void;
  gapMs?: number;
  minLength?: number;
};

const DEFAULT_GAP = 60; // ms; human typing rarely faster than this
const DEFAULT_MIN = 4;

function inputIsFocused(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return Boolean((el as HTMLElement).isContentEditable);
}

export function useBarcodeScanner({
  onScan,
  gapMs = DEFAULT_GAP,
  minLength = DEFAULT_MIN,
}: Options): void {
  const bufferRef = useRef<string>("");
  const lastEventRef = useRef<number>(0);
  // Stash latest onScan in a ref so the effect doesn't re-bind on each render.
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    function handle(e: KeyboardEvent) {
      // Skip if user is typing in a form field.
      if (inputIsFocused()) return;

      const now = Date.now();
      if (now - lastEventRef.current > gapMs) {
        bufferRef.current = "";
      }
      lastEventRef.current = now;

      if (e.key === "Enter") {
        const code = bufferRef.current;
        bufferRef.current = "";
        if (code.length >= minLength) {
          onScanRef.current(code);
        }
        return;
      }

      // Accept single-char prints (alphanumerics, common barcode chars).
      if (e.key.length === 1 && /[\w-]/.test(e.key)) {
        bufferRef.current += e.key;
      }
    }
    // Use capture-phase so we see the event before app-level handlers.
    window.addEventListener("keydown", handle, true);
    return () => window.removeEventListener("keydown", handle, true);
  }, [gapMs, minLength]);
}
