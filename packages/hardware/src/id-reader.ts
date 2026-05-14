// PDF417 ID reader. State-issued IDs encode DOB, expiration, name, etc.
// in PDF417. The reader returns a structured ScanResult; the till must
// not work with the raw barcode string.
export type IdScanResult = {
  // Parsed AAMVA fields. Names and identifying fields are present in
  // memory only long enough to verify; the persisted Customer row
  // stores only hashed identifiers and an encrypted DOB.
  firstName: string;
  lastName: string;
  // ISO date.
  dob: string;
  // ISO date (license expiration).
  expires: string;
  // State issuer (two-letter code).
  issuer: string;
  // Raw payload for downstream hashing only; do not persist.
  raw: string;
};

export interface IdReader {
  scan(): Promise<IdScanResult>;
  isAvailable(): boolean;
}
