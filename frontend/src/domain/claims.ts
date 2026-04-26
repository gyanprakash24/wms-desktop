export type ClaimStatus = 'Draft' | 'Submitted' | 'Accepted' | 'Rejected' | 'NeedsReview';

export type Claim = {
  id: string;
  vin: string;
  partSerial: string;
  status: ClaimStatus;
  createdAt: string;
  updatedAt: string;
};

export function normalizeVin(input: string): string {
  return input.trim().toUpperCase();
}

// Minimal VIN check (length + allowed chars). Real VIN validation can be added later.
export function isValidVin(vin: string): boolean {
  if (vin.length !== 17) return false;
  // VIN excludes I, O, Q
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(vin);
}
