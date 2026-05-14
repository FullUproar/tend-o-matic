// 1D / 2D barcode scanner. On Android tablets, this is typically a
// HID-keyboard-wedge scanner; on iOS / web kiosks it falls back to the
// camera via WebUSB / WebHID where available.
export type ScanEvent = {
  // Raw scanned text as the scanner emitted it.
  raw: string;
  // Capture timestamp (device-local).
  at: string;
  // Best-guess symbology when the scanner reports it.
  symbology?: string;
};

export interface BarcodeScanner {
  onScan(handler: (e: ScanEvent) => void): () => void;
  isAvailable(): boolean;
}
