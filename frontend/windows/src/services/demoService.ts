import { EscrowDisplay } from "@/services/blockchainService";

// ─── Demo Mode Service ──────────────────────────────────────────────────
// Simulates on-chain escrow data so the app can be demoed without MetaMask
// or real testnet ETH. All data lives in memory.

const DEMO_STORAGE_KEY = "leaselock-demo-escrows";

function baseTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

function randomYield(): string {
  return (Math.random() * 0.005 + 0.0001).toFixed(6);
}

function seedDemoEscrows(walletAddress: string): EscrowDisplay[] {
  const landlord1 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const landlord2 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

  return [
    {
      address: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      tenant: walletAddress,
      landlord: landlord1,
      depositAmountEth: "0.5",
      deadline: baseTimestamp() + 86400 * 14,
      confirmed: true,
      accruedYieldEth: randomYield(),
      totalAaveBalanceEth: "0.5003",
      averageRating: 420,
      numRatings: 3,
      status: "confirmed",
    },
    {
      address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      tenant: walletAddress,
      landlord: landlord2,
      depositAmountEth: "0.25",
      deadline: baseTimestamp() + 86400 * 7,
      confirmed: false,
      accruedYieldEth: randomYield(),
      totalAaveBalanceEth: "0.2501",
      averageRating: 0,
      numRatings: 0,
      status: "pending",
    },
  ];
}

function load(wallet: string): EscrowDisplay[] {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  const seed = seedDemoEscrows(wallet);
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

function save(escrows: EscrowDisplay[]): void {
  localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(escrows));
}

export function demoLoadAllEscrows(walletAddress: string): EscrowDisplay[] {
  return load(walletAddress);
}

export function demoDeployEscrow(
  walletAddress: string,
  landlord: string,
  depositEth: string,
  durationDays: number,
): EscrowDisplay {
  const escrows = load(walletAddress);
  const newEscrow: EscrowDisplay = {
    address: "0x" + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join(""),
    tenant: walletAddress,
    landlord,
    depositAmountEth: depositEth,
    deadline: baseTimestamp() + durationDays * 86400,
    confirmed: false,
    accruedYieldEth: "0.000000",
    totalAaveBalanceEth: depositEth,
    averageRating: 0,
    numRatings: 0,
    status: "pending",
  };
  escrows.unshift(newEscrow);
  save(escrows);
  return newEscrow;
}

export function demoConfirmLease(walletAddress: string, escrowAddress: string): void {
  const escrows = load(walletAddress);
  const found = escrows.find((e) => e.address === escrowAddress);
  if (found) {
    found.confirmed = true;
    found.status = "confirmed";
  }
  save(escrows);
}

export function demoReleaseFunds(walletAddress: string, escrowAddress: string): void {
  const escrows = load(walletAddress);
  const found = escrows.find((e) => e.address === escrowAddress);
  if (found) {
    found.status = "released";
    found.totalAaveBalanceEth = "0";
  }
  save(escrows);
}

export function demoRefund(walletAddress: string, escrowAddress: string): void {
  const escrows = load(walletAddress);
  const found = escrows.find((e) => e.address === escrowAddress);
  if (found) {
    found.status = "refunded";
    found.totalAaveBalanceEth = "0";
  }
  save(escrows);
}

export function demoRateLandlord(walletAddress: string, escrowAddress: string, score: number): void {
  const escrows = load(walletAddress);
  const found = escrows.find((e) => e.address === escrowAddress);
  if (found) {
    found.numRatings += 1;
    found.averageRating = Math.round(((found.averageRating * (found.numRatings - 1)) + score * 100) / found.numRatings);
  }
  save(escrows);
}

// Simulate ticking yield (called periodically to make it feel alive)
export function demoTickYield(walletAddress: string): EscrowDisplay[] {
  const escrows = load(walletAddress);
  for (const e of escrows) {
    if (e.status === "pending" || e.status === "confirmed") {
      const current = Number(e.accruedYieldEth);
      const tick = Math.random() * 0.000003 + 0.000001;
      e.accruedYieldEth = (current + tick).toFixed(6);
      e.totalAaveBalanceEth = (Number(e.depositAmountEth) + Number(e.accruedYieldEth)).toFixed(6);
    }
  }
  save(escrows);
  return escrows;
}
