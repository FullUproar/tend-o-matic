// CashDrawer is a thin alias over the printer's drawer-kick: the
// drawer has no USB intelligence of its own, just a solenoid driven
// by the printer's DK port. This interface exists so that till code
// can talk about "opening the drawer" without knowing about the
// printer plumbing.
import type { EscPosPrinter } from "./printer";

export interface CashDrawer {
  open(): Promise<void>;
  isAvailable(): boolean;
}

export function cashDrawerFromPrinter(printer: EscPosPrinter): CashDrawer {
  return {
    open: () => printer.kickDrawer(),
    isAvailable: () => printer.isAvailable(),
  };
}
