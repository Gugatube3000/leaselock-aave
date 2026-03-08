import { useCallback, useEffect, useMemo, useState } from "react";

import { escrowService } from "@/services/escrowService";
import { CreateEscrowInput, EscrowContract } from "@/types/escrow";

export const useEscrows = (walletAddress?: string) => {
  const [escrows, setEscrows] = useState<EscrowContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    try {
      const records = escrowService.listEscrows(walletAddress);
      setEscrows(records.sort((a, b) => b.createdAt - a.createdAt));
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
    (payload: CreateEscrowInput, tenant: string) => {
      escrowService.createEscrow(payload, tenant);
      refresh();
    },
    [refresh],
  );

  const confirmLease = useCallback(
    (address: string) => {
      escrowService.confirmLease(address);
      refresh();
    },
    [refresh],
  );

  const releaseFunds = useCallback(
    (address: string) => {
      escrowService.releaseFunds(address);
      refresh();
    },
    [refresh],
  );

  const requestRefund = useCallback(
    (address: string) => {
      escrowService.requestRefund(address);
      refresh();
    },
    [refresh],
  );

  const rateLandlord = useCallback(
    (address: string, reviewer: string, score: number, review: string) => {
      escrowService.rateLandlord(address, reviewer, score, review);
      refresh();
    },
    [refresh],
  );

  const escrowStats = useMemo(() => {
    const totalValueEth = escrows.reduce((sum, escrow) => sum + Number(escrow.rentAmountEth), 0).toFixed(3);
    const pending = escrows.filter((escrow) => escrow.status === "pending").length;
    const confirmed = escrows.filter((escrow) => escrow.status === "confirmed").length;
    const totalYieldEarned = escrows
      .reduce((sum, escrow) => sum + Number(escrow.aaveYieldEarned || 0), 0)
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
    escrowStats,
    refresh,
    createEscrow,
    confirmLease,
    releaseFunds,
    requestRefund,
    rateLandlord,
  };
};
