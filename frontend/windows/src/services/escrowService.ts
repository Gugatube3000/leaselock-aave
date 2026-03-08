import { CreateEscrowInput, EscrowContract, EscrowStatus, LandlordRatingSummary } from "@/types/escrow";

const STORAGE_KEY = "rent-escrow-contracts-v1";

const AAVE_APY = 0.035; // 3.5% APY simulation
const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

const now = () => Date.now();

/** Simulate Aave yield based on elapsed time */
const computeAaveYield = (rentAmountEth: string, createdAt: number): string => {
  const elapsed = now() - createdAt;
  const principal = Number(rentAmountEth);
  const yieldEarned = principal * AAVE_APY * (elapsed / MS_PER_YEAR);
  return yieldEarned.toFixed(6);
};

const randomHex = (size: number) => {
  const chars = "0123456789abcdef";
  let value = "";
  for (let i = 0; i < size; i += 1) {
    value += chars[Math.floor(Math.random() * chars.length)];
  }
  return value;
};

const fakeAddress = () => `0x${randomHex(40)}`;
const fakeHash = () => `0x${randomHex(64)}`;

const asEth = (value: string) => Number(value || "0").toFixed(3);

const seedEscrows = (): EscrowContract[] => {
  const timestamp = now();
  const days = (d: number) => d * 24 * 60 * 60 * 1000;
  
  const landlords = [
    { adr: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", name: "Landlord 1" },
    { adr: "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", name: "Landlord 2" },
    { adr: "0x90F79bf6EB2c4f870365E785982E1f101E93b906", name: "Landlord 3" },
    { adr: "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", name: "Landlord 4" },
    { adr: "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc", name: "Landlord 5" },
    { adr: "0x1234567890abcdef1234567890abcdef12345678", name: "Landlord 6" },
  ];

  const escrows: EscrowContract[] = [];

  // Generate 25 historical escrows to build up reputation
  for (let i = 0; i < 25; i++) {
    const isCompleted = i % 3 !== 0; // 66% completed with ratings
    const ll = landlords[i % landlords.length].adr;
    const pastStart = timestamp - days(Math.random() * 60 + 10);
    
    // Some random rating from 3 to 5 (mostly good, some bad)
    const baseScore = i % 5 === 0 ? 1 : 5; 
    const isBad = baseScore === 1;

    escrows.push({
      address: fakeAddress(),
      tenant: `0xTenant_${Math.random()}`,
      landlord: ll,
      rentAmountEth: (Math.random() * 2 + 0.5).toFixed(3),
      yieldPercent: 3.5,
      deadline: pastStart + days(30),
      status: isCompleted ? "released" : "pending",
      createdAt: pastStart,
      lastUpdatedAt: pastStart + days(5),
      aaveYieldEarned: isCompleted ? (Math.random() * 0.05).toFixed(6) : computeAaveYield("1.000", pastStart),
      ratingHistory: isCompleted ? [{
        id: crypto.randomUUID(),
        reviewer: `0xTenant_${Math.random()}`,
        score: isBad ? Math.floor(Math.random() * 3 + 1) : Math.floor(Math.random() * 2 + 4), 
        review: isBad ? "Terrible communication. Withheld funds unfairly." : "Great property. Very smooth escrow process without banks.",
        timestamp: pastStart + days(30 + Math.random() * 5),
      }] : [],
      transactionHistory: [],
    });
  }

  // Generate one new one for the default UI
  const createdAt = timestamp - 2 * 24 * 60 * 60 * 1000;
  escrows.unshift({
    address: fakeAddress(),
    tenant: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    landlord: landlords[0].adr,
    rentAmountEth: "1.000",
    yieldPercent: 3,
    deadline: timestamp + 5 * 24 * 60 * 60 * 1000,
    status: "pending",
    createdAt,
    lastUpdatedAt: createdAt,
    aaveYieldEarned: computeAaveYield("1.000", createdAt),
    ratingHistory: [],
    transactionHistory: [
      {
        id: crypto.randomUUID(),
        action: "deposit_aave",
        hash: fakeHash(),
        timestamp: createdAt,
        amountEth: "1.000",
        note: "ETH wrapped to WETH and supplied to Aave V3 lending pool",
      },
      {
        id: crypto.randomUUID(),
        action: "create",
        hash: fakeHash(),
        timestamp: createdAt,
        amountEth: "1.000",
        note: "Tenant deposited rent into escrow contract",
      },
    ],
  });

  return escrows;
};

const readStore = (): EscrowContract[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = seedEscrows();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    return JSON.parse(raw) as EscrowContract[];
  } catch {
    const reset = seedEscrows();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
    return reset;
  }
};

const writeStore = (escrows: EscrowContract[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(escrows));
};

const averageRating = (escrow: EscrowContract) => {
  if (!escrow.ratingHistory.length) return 0;
  const total = escrow.ratingHistory.reduce((sum, entry) => sum + entry.score, 0);
  return total / escrow.ratingHistory.length;
};

const canRefund = (escrow: EscrowContract) => escrow.status === "pending" && now() > escrow.deadline;

const updateEscrow = (
  escrows: EscrowContract[],
  escrowAddress: string,
  updater: (escrow: EscrowContract) => EscrowContract,
): EscrowContract[] => escrows.map((escrow) => (escrow.address === escrowAddress ? updater(escrow) : escrow));

export const escrowService = {
  listEscrows(walletAddress?: string) {
    const escrows = readStore().map((escrow) => ({
      ...escrow,
      // Recompute live Aave yield for active escrows
      aaveYieldEarned:
        escrow.status === "pending" || escrow.status === "confirmed"
          ? computeAaveYield(escrow.rentAmountEth, escrow.createdAt)
          : escrow.aaveYieldEarned,
    }));
    if (!walletAddress) return escrows;

    const normalized = walletAddress.toLowerCase();
    return escrows.filter(
      (escrow) =>
        escrow.tenant.toLowerCase() === normalized || escrow.landlord.toLowerCase() === normalized,
    );
  },

  createEscrow(input: CreateEscrowInput, tenant: string) {
    const timestamp = now();
    const escrow: EscrowContract = {
      address: fakeAddress(),
      tenant,
      landlord: input.landlord,
      rentAmountEth: asEth(input.rentAmountEth),
      yieldPercent: input.yieldPercent,
      deadline: timestamp + input.durationDays * 24 * 60 * 60 * 1000,
      status: "pending",
      createdAt: timestamp,
      lastUpdatedAt: timestamp,
      aaveYieldEarned: "0.000000",
      ratingHistory: [],
      transactionHistory: [
        {
          id: crypto.randomUUID(),
          action: "deposit_aave",
          hash: fakeHash(),
          timestamp,
          amountEth: asEth(input.rentAmountEth),
          note: "ETH wrapped to WETH and supplied to Aave V3 lending pool",
        },
        {
          id: crypto.randomUUID(),
          action: "create",
          hash: fakeHash(),
          timestamp,
          amountEth: asEth(input.rentAmountEth),
          note: "Escrow deployed with initial rent deposit",
        },
      ],
    };

    const escrows = [escrow, ...readStore()];
    writeStore(escrows);
    return escrow;
  },

  confirmLease(escrowAddress: string) {
    const timestamp = now();
    const escrows = updateEscrow(readStore(), escrowAddress, (escrow) => ({
      ...escrow,
      status: "confirmed",
      lastUpdatedAt: timestamp,
      transactionHistory: [
        {
          id: crypto.randomUUID(),
          action: "confirm",
          hash: fakeHash(),
          timestamp,
          note: "Tenant confirmed lease terms",
        },
        ...escrow.transactionHistory,
      ],
    }));

    writeStore(escrows);
  },

  releaseFunds(escrowAddress: string) {
    const timestamp = now();
    const escrows = updateEscrow(readStore(), escrowAddress, (escrow) => {
      const bonus = ((Number(escrow.rentAmountEth) * escrow.yieldPercent) / 100).toFixed(3);
      return {
        ...escrow,
        status: "released",
        lastUpdatedAt: timestamp,
        transactionHistory: [
          {
            id: crypto.randomUUID(),
            action: "release",
            hash: fakeHash(),
            timestamp,
            amountEth: escrow.rentAmountEth,
            note: `Funds released to landlord and tenant credited ${bonus} ETH yield`,
          },
          ...escrow.transactionHistory,
        ],
      };
    });

    writeStore(escrows);
  },

  requestRefund(escrowAddress: string) {
    const escrows = readStore();
    const target = escrows.find((escrow) => escrow.address === escrowAddress);

    if (!target) throw new Error("Escrow not found");
    if (!canRefund(target)) throw new Error("Refund is only available after deadline and before confirmation");

    const timestamp = now();
    const updated = updateEscrow(escrows, escrowAddress, (escrow) => ({
      ...escrow,
      status: "refunded",
      lastUpdatedAt: timestamp,
      transactionHistory: [
        {
          id: crypto.randomUUID(),
          action: "refund",
          hash: fakeHash(),
          timestamp,
          amountEth: escrow.rentAmountEth,
          note: "Tenant refunded because lease was not confirmed before deadline",
        },
        ...escrow.transactionHistory,
      ],
    }));

    writeStore(updated);
  },

  rateLandlord(escrowAddress: string, reviewer: string, score: number, review: string) {
    const timestamp = now();
    const escrows = updateEscrow(readStore(), escrowAddress, (escrow) => ({
      ...escrow,
      lastUpdatedAt: timestamp,
      ratingHistory: [
        {
          id: crypto.randomUUID(),
          reviewer,
          score,
          review,
          timestamp,
        },
        ...escrow.ratingHistory,
      ],
      transactionHistory: [
        {
          id: crypto.randomUUID(),
          action: "rate",
          hash: fakeHash(),
          timestamp,
          note: `Tenant submitted rating ${score}/5`,
        },
        ...escrow.transactionHistory,
      ],
    }));

    writeStore(escrows);
  },

  getLandlordSummaries(): LandlordRatingSummary[] {
    const grouped = new Map<string, EscrowContract[]>();
    for (const escrow of readStore()) {
      const key = escrow.landlord.toLowerCase();
      const existing = grouped.get(key) ?? [];
      existing.push(escrow);
      grouped.set(key, existing);
    }

    const result: LandlordRatingSummary[] = [];
    for (const escrows of grouped.values()) {
      const ratingEntries = escrows.flatMap((escrow) => escrow.ratingHistory);
      const ratedEscrows = escrows.filter((escrow) => averageRating(escrow) > 0);
      const average = ratedEscrows.length
        ? ratedEscrows.reduce((sum, escrow) => sum + averageRating(escrow), 0) / ratedEscrows.length
        : 0;

      result.push({
        landlord: escrows[0].landlord,
        averageRating: average,
        totalRatings: ratingEntries.length,
        escrowCount: escrows.length,
        ratingHistory: ratingEntries.sort((a, b) => b.timestamp - a.timestamp),
        escrows,
      });
    }

    return result;
  },

  statusLabel(status: EscrowStatus) {
    const labels: Record<EscrowStatus, string> = {
      pending: "Pending Confirmation",
      confirmed: "Lease Confirmed",
      released: "Funds Released",
      refunded: "Refunded",
    };
    return labels[status];
  },

  canRefund,
};
