export type EscrowStatus = "pending" | "confirmed" | "released" | "refunded";

export interface EscrowTransaction {
  id: string;
  action: "create" | "confirm" | "release" | "refund" | "rate" | "deposit_aave";
  hash: string;
  timestamp: number;
  amountEth?: string;
  note: string;
}

export interface RatingEntry {
  id: string;
  reviewer: string;
  score: number;
  review: string;
  timestamp: number;
}

export interface EscrowContract {
  address: string;
  tenant: string;
  landlord: string;
  rentAmountEth: string;
  yieldPercent: number;
  deadline: number;
  status: EscrowStatus;
  createdAt: number;
  lastUpdatedAt: number;
  transactionHistory: EscrowTransaction[];
  ratingHistory: RatingEntry[];
  aaveYieldEarned: string;
}

export interface LandlordRatingSummary {
  landlord: string;
  averageRating: number;
  totalRatings: number;
  escrowCount: number;
  ratingHistory: RatingEntry[];
  escrows: EscrowContract[];
}

export interface CreateEscrowInput {
  landlord: string;
  rentAmountEth: string;
  yieldPercent: number;
  durationDays: number;
}

export type RatingSortOption = "highest-rated" | "most-rated" | "most-active";
