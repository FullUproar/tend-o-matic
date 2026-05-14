// ESC/POS receipt printer. Manages the receipt write surface and the
// printer-driven cash-drawer kick.
export type PrintJob = {
  // Lines of receipt content, already laid out by the kernel's
  // renderReceipt(). The hardware layer does NOT format; it only
  // transmits.
  lines: ReadonlyArray<string>;
  // Optional: after printing, fire the drawer-kick pulse on the
  // printer's DK port (the cash drawer is driven by the printer, not
  // by an independent USB device).
  openDrawer: boolean;
};

export interface EscPosPrinter {
  print(job: PrintJob): Promise<void>;
  isAvailable(): boolean;
  kickDrawer(): Promise<void>;
}
