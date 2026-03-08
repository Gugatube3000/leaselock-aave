import { BrowserProvider, Contract, ContractFactory, formatEther, parseEther } from "ethers";
import { AAVE_RENT_ESCROW_ABI, AAVE_RENT_ESCROW_BYTECODE } from "@/contracts/AaveRentEscrowABI";
import { AAVE_ADDRESSES, ESCROW_ADDRESSES_KEY } from "@/contracts/config";

// ─── Types ──────────────────────────────────────────────────────────────

export interface OnChainEscrow {
  address: string;
  tenant: string;
  landlord: string;
  depositAmountEth: string;
  deadline: number;         // unix seconds
  confirmed: boolean;
  accruedYieldEth: string;
  totalAaveBalanceEth: string;
  averageRating: number;
  numRatings: number;
}

export type EscrowStatus = "pending" | "confirmed" | "released" | "refunded";

export interface EscrowDisplay extends OnChainEscrow {
  status: EscrowStatus;
}

// ─── Address Tracking (localStorage) ────────────────────────────────────

function getSavedAddresses(): string[] {
  try {
    return JSON.parse(localStorage.getItem(ESCROW_ADDRESSES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAddress(address: string): void {
  const addresses = getSavedAddresses();
  if (!addresses.includes(address)) {
    addresses.unshift(address);
    localStorage.setItem(ESCROW_ADDRESSES_KEY, JSON.stringify(addresses));
  }
}

export function addExistingAddress(address: string): void {
  saveAddress(address);
}

export function removeAddress(address: string): void {
  const addresses = getSavedAddresses().filter((a) => a !== address);
  localStorage.setItem(ESCROW_ADDRESSES_KEY, JSON.stringify(addresses));
}

// ─── Provider Helpers ───────────────────────────────────────────────────

function getProvider(): BrowserProvider {
  if (!window.ethereum) throw new Error("No wallet detected. Please install MetaMask.");
  return new BrowserProvider(window.ethereum);
}

function getEscrowContract(address: string, signerOrProvider: unknown): Contract {
  return new Contract(address, AAVE_RENT_ESCROW_ABI, signerOrProvider as never);
}

// ─── Deploy ─────────────────────────────────────────────────────────────

export async function deployEscrow(
  landlordAddress: string,
  durationSeconds: number,
  depositEth: string,
): Promise<string> {
  const provider = getProvider();
  const signer = await provider.getSigner();

  const factory = new ContractFactory(AAVE_RENT_ESCROW_ABI, AAVE_RENT_ESCROW_BYTECODE, signer);

  const contract = await factory.deploy(
    landlordAddress,
    durationSeconds,
    AAVE_ADDRESSES.POOL,
    AAVE_ADDRESSES.WETH,
    AAVE_ADDRESSES.A_WETH,
    { value: parseEther(depositEth) },
  );

  await contract.waitForDeployment();
  const address = await contract.getAddress();
  saveAddress(address);
  return address;
}

// ─── Read On-Chain State ────────────────────────────────────────────────

export async function loadEscrow(address: string): Promise<EscrowDisplay | null> {
  try {
    const provider = getProvider();
    const contract = getEscrowContract(address, provider);

    const [tenant, landlord, depositAmount, deadline, confirmed, accruedYield, totalBalance, avgRating, numRatings] =
      await Promise.all([
        contract.tenant() as Promise<string>,
        contract.landlord() as Promise<string>,
        contract.depositAmount() as Promise<bigint>,
        contract.deadline() as Promise<bigint>,
        contract.confirmed() as Promise<boolean>,
        contract.getAccruedYield() as Promise<bigint>,
        contract.getTotalAaveBalance() as Promise<bigint>,
        contract.getAverageRating() as Promise<bigint>,
        contract.getNumRatings() as Promise<bigint>,
      ]);

    // Determine status — if Aave balance is 0 the funds have been withdrawn
    const hasBalance = totalBalance > 0n;
    let status: EscrowStatus;
    if (!hasBalance && confirmed) {
      status = "released";
    } else if (!hasBalance && !confirmed) {
      status = "refunded";
    } else if (confirmed) {
      status = "confirmed";
    } else {
      status = "pending";
    }

    return {
      address,
      tenant,
      landlord,
      depositAmountEth: formatEther(depositAmount),
      deadline: Number(deadline),
      confirmed,
      accruedYieldEth: formatEther(accruedYield),
      totalAaveBalanceEth: formatEther(totalBalance),
      averageRating: Number(avgRating),
      numRatings: Number(numRatings),
      status,
    };
  } catch (err) {
    console.error(`Failed to load escrow at ${address}:`, err);
    return null;
  }
}

export async function loadAllEscrows(walletAddress?: string): Promise<EscrowDisplay[]> {
  const addresses = getSavedAddresses();
  const results = await Promise.all(addresses.map(loadEscrow));
  const valid = results.filter((e): e is EscrowDisplay => e !== null);

  if (!walletAddress) return valid;
  const normalized = walletAddress.toLowerCase();
  return valid.filter(
    (e) => e.tenant.toLowerCase() === normalized || e.landlord.toLowerCase() === normalized,
  );
}

// ─── Write Transactions ─────────────────────────────────────────────────

export async function confirmLease(escrowAddress: string): Promise<string> {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const contract = getEscrowContract(escrowAddress, signer);
  const tx = await contract.confirmLease();
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function releaseFunds(escrowAddress: string): Promise<string> {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const contract = getEscrowContract(escrowAddress, signer);
  const tx = await contract.releaseFunds();
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function refund(escrowAddress: string): Promise<string> {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const contract = getEscrowContract(escrowAddress, signer);
  const tx = await contract.refund();
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function rateLandlord(escrowAddress: string, score: number): Promise<string> {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const contract = getEscrowContract(escrowAddress, signer);
  const tx = await contract.rateLandlord(score);
  const receipt = await tx.wait();
  return receipt.hash;
}
