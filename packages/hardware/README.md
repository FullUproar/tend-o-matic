# @tend-o-matic/hardware

Device adapter interfaces: barcode scanner, PDF417 ID reader, ESC/POS receipt printer, cash drawer (printer-driven kick), NTEP-certified scale. Android tablet PWA-first; the Capacitor shell only gets added when peripheral access forces it.

v0.1 ships only interfaces. Concrete implementations (WebUSB / WebHID / native via Capacitor) land in Phase 1 alongside the till core, driven by what's available in-browser at the time each peripheral is needed.
