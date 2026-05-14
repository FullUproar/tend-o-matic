// ESC/POS byte-stream encoder. Pure function: takes a rendered
// ReceiptContent (from packages/compliance/src/receipt-renderer.ts)
// and produces the byte sequence a typical 80mm thermal printer
// expects. Drivers (WebUSB, network IP, serial) ship the bytes; the
// formatting decisions live here so they can be tested without
// hardware.
//
// Reference: Epson TM-T20 / TM-T88 ESC/POS command set. Most cannabis
// dispensary printers (Star TSP-100, Citizen CT-S310, generic Epson)
// support this subset. Specific fonts / character sets / cut commands
// may need printer-specific tweaks; keep those in a printer-profile
// layer above this encoder when the time comes.

import type { ReceiptContent } from "@tend-o-matic/compliance";

// Control bytes — see ESC/POS command reference.
const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

const ALIGN_LEFT = 0x00;
const ALIGN_CENTER = 0x01;
const ALIGN_RIGHT = 0x02;

const FONT_NORMAL = 0x00;
const FONT_DOUBLE_HEIGHT = 0x10;
const FONT_DOUBLE_WIDTH = 0x20;
const FONT_BOLD_ON = 0x08;

export type EncoderOptions = {
  // Characters per line at default font. 80mm paper at default size:
  // 42 chars. 58mm paper: 32 chars. The compliance renderer's
  // formatReceiptAsText() also takes a width; pass the same value
  // through so the line-formatting in both is consistent.
  width?: number;
  // Open the cash drawer after printing (DK port pulse).
  openDrawer?: boolean;
  // Cut paper at the end. Most thermal printers expect GS V 1 (partial
  // cut) or GS V 0 (full cut). Default: partial cut (keeps the next
  // receipt tab-attached so the cashier can tear cleanly).
  cut?: "none" | "partial" | "full";
};

function formatCents(c: number): string {
  const neg = c < 0;
  const abs = Math.abs(c);
  return `${neg ? "-" : ""}$${(abs / 100).toFixed(2)}`;
}

function center(width: number, s: string): string {
  if (s.length >= width) return s.slice(0, width);
  const pad = Math.floor((width - s.length) / 2);
  return " ".repeat(pad) + s;
}

function twoCol(width: number, left: string, right: string): string {
  const pad = Math.max(1, width - left.length - right.length);
  return left + " ".repeat(pad) + right;
}

// Helper to concatenate Uint8Arrays in a stream-friendly way.
class ByteBuffer {
  private chunks: number[] = [];
  push(...bytes: number[]): this {
    this.chunks.push(...bytes);
    return this;
  }
  text(s: string): this {
    // Encode as latin-1 / CP437 surrogate (printers accept basic ASCII;
    // smart-quote / em-dash get lost gracefully). For production we'd
    // run a CP-translation table; ASCII is fine for v0.1 receipts.
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      this.chunks.push(c > 0x7f ? 0x3f : c); // replace non-ASCII with '?'
    }
    return this;
  }
  line(s: string): this {
    return this.text(s).push(LF);
  }
  align(mode: number): this {
    return this.push(ESC, 0x61, mode);
  }
  font(mode: number): this {
    return this.push(ESC, 0x21, mode);
  }
  cut(mode: "none" | "partial" | "full"): this {
    if (mode === "none") return this;
    // GS V 1 (partial) or GS V 0 (full)
    return this.push(GS, 0x56, mode === "partial" ? 0x01 : 0x00);
  }
  drawerKick(): this {
    // ESC p 0 m t — DK1 pulse (m=0), default on/off times.
    return this.push(ESC, 0x70, 0x00, 0x32, 0xff);
  }
  toUint8Array(): Uint8Array {
    return Uint8Array.from(this.chunks);
  }
}

export function encodeReceiptToEscPos(
  receipt: ReceiptContent,
  options: EncoderOptions = {},
): Uint8Array {
  const width = options.width ?? 42;
  const cutMode = options.cut ?? "partial";
  const buf = new ByteBuffer();

  // Init printer.
  buf.push(ESC, 0x40);

  // Header: centered, bold, double-height first line (store name).
  buf.align(ALIGN_CENTER);
  if (receipt.header.length > 0) {
    buf.font(FONT_DOUBLE_HEIGHT | FONT_BOLD_ON);
    buf.line(center(width / 2, receipt.header[0] ?? ""));
    buf.font(FONT_NORMAL);
    for (let i = 1; i < receipt.header.length; i++) {
      buf.line(center(width, receipt.header[i] ?? ""));
    }
  }
  buf.line("-".repeat(width));

  // Customer block (left-aligned).
  buf.align(ALIGN_LEFT);
  for (const line of receipt.customerBlock) buf.line(line);
  if (receipt.customerBlock.length > 0) buf.line("-".repeat(width));

  // Lines.
  for (const line of receipt.lines) {
    buf.line(line.description);
    buf.line(
      twoCol(
        width,
        `  ${line.qty} x ${formatCents(line.unitPriceCents)}`,
        formatCents(line.lineTotalCents),
      ),
    );
    if (line.taxes) {
      for (const t of line.taxes) {
        buf.line(twoCol(width, `    + ${t.label}`, formatCents(t.amountCents)));
      }
    }
  }
  buf.line("-".repeat(width));

  // Totals (right-aligned via two-column).
  buf.line(twoCol(width, "Subtotal", formatCents(receipt.totals.subtotalCents)));
  for (const t of receipt.taxLines) {
    buf.line(twoCol(width, t.label, formatCents(t.amountCents)));
  }
  buf.line(twoCol(width, "Tax total", formatCents(receipt.totals.taxCents)));

  // TOTAL on a double-width line for emphasis.
  buf.font(FONT_DOUBLE_WIDTH | FONT_BOLD_ON);
  buf.line(twoCol(width / 2, "TOTAL", formatCents(receipt.totals.totalCents)));
  buf.font(FONT_NORMAL);
  buf.line("-".repeat(width));

  // Footer.
  for (const f of receipt.footer) buf.line(f);

  // Some printers need a few LFs before the cutter so the cut lands
  // after the printed area.
  buf.push(LF, LF, LF, LF);
  buf.cut(cutMode);

  if (options.openDrawer) buf.drawerKick();

  return buf.toUint8Array();
}
