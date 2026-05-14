// NTEP-certified scale for weigh-on-demand sales (flower by weight).
// The scale exposes a stable reading; the till captures the reading
// only when the scale reports stability. Tare and zero are operator
// concerns surfaced in the till UI.
export type Reading = {
  grams: number;
  stable: boolean;
  // Device-local capture timestamp.
  at: string;
};

export interface NtepScale {
  read(): Promise<Reading>;
  tare(): Promise<void>;
  zero(): Promise<void>;
  isAvailable(): boolean;
}
