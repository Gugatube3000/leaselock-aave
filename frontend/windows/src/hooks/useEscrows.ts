import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EscrowDisplay,
  loadAllEscrows,
  deployEscrow,
  confirmLease as confirmLeaseService,
  releaseFunds as releaseFundsService,
  refund as refundService,
  rateLandlord as rateLandlordService,
  addExistingAddress,
} from "@/services/blockchainService";

export interface CreateEscrowInput {
  landlord: string;
  rentAmountEth: string;
  durationDays: number;
}

export const useEscrows = (walletAddress?: string) => {
  const [escrows, setEscrows] = useState<EscrowDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [txPending, setTxPending] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const records = await loadAllEscrows(walletAddress);
      setEscrows(records);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load escrows");
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createEscrow = useCallback(
    async (payload: CreateEscrowInput) => {
      setTxPending(true);
      try {
        const durationSeconds = payload.durationDays * 24 * 60 * 60;
        const address = await deployEscrow(payload.landlord, durationSeconds, payload.rentAmountEth);
        await refresh();
        return address;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to deploy escrow");
        throw err;
      } finally {
        setTxPending(false);
      }
    },
    [refresh],
  );

  const confirmLease = useCallback(
    async (address: string) => {
      setTxPending(true);
      try {
        await confirmLeaseService(address);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to confirm lease");
      } finally {
        setTxPending(false);
      }
    },
    [refresh],
  );

  const releaseFunds = useCallback(
    async (address: string) => {
      setTxPending(true);
      try {
        await releaseFundsService(address);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to release funds");
      } finally {
        setTxPending(false);
      }
    },
    [refresh],
  );

  const requestRefund = useCallback(
    async (address: string) => {
      setTxPending(true);
      try {
        await refundService(address);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to request refund");
      } finally {
        setTxPending(false);
      }
    },
    [refresh],
  );

  const rateLandlordAction = useCallback(
    async (address: string, score: number) => {
      setTxPending(true);
      try {
        await rateLandlordService(address, score);
        await refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to rate landlord");
      } finally {
        setTxPending(false);
      }
    },
    [refresh],
  );

  const trackExistingEscrow = useCallback(
    (address: string) => {
      addExistingAddress(address);
      refresh();
    },
    [refresh],
  );

  const escrowStats = useMemo(() => {
    const totalValueEth = escrows
      .reduce((sum, e) => sum + Number(e.depositAmountEth), 0)
      .toFixed(4);
    const pending = escrows.filter((e) => e.status === "pending").length;
    const confirmed = escrows.filter((e) => e.status === "confirmed").length;
    const totalYieldEarned = escrows
      .reduce((sum, e) => sum + Number(e.accruedYieldEth), 0)
      .toFixed(6);

    return {
      totalEscrows: escrows.length,
      totalValueEth,
      pending,
      confirmed,
      totalYieldEarned,
    };
  }, [escrows]);

  return {
    escrows,
    loading,
    error,
    txPending,
    escrowStats,
    refresh,
    createEscrow,
    confirmLease,
    releaseFunds,
    requestRefund,
    rateLandlord: rateLandlordAction,
    trackExistingEscrow,
  };
};
