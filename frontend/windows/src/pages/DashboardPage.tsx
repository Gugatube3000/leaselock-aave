import { AlertTriangle, PlusCircle, Search, Play, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import CreateEscrowForm from "@/components/CreateEscrowForm";
import EscrowCard from "@/components/EscrowCard";
import EscrowDetailsView from "@/components/EscrowDetailsView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEscrows } from "@/hooks/useEscrows";
import { EscrowDisplay } from "@/services/blockchainService";
import {
  demoLoadAllEscrows,
  demoDeployEscrow,
  demoConfirmLease,
  demoReleaseFunds,
  demoRefund,
  demoRateLandlord,
  demoTickYield,
} from "@/services/demoService";

interface DashboardPageProps {
  walletAddress: string | null;
}

// ─── Demo Mode Wrapper ──────────────────────────────────────────────────

function useDemoEscrows(demoWallet: string) {
  const [escrows, setEscrows] = useState<EscrowDisplay[]>([]);

  const refresh = useCallback(() => {
    setEscrows(demoLoadAllEscrows(demoWallet));
  }, [demoWallet]);

  useEffect(() => { refresh(); }, [refresh]);

  // Tick yield every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setEscrows(demoTickYield(demoWallet));
    }, 3000);
    return () => clearInterval(interval);
  }, [demoWallet]);

  const createEscrow = async (payload: { landlord: string; rentAmountEth: string; durationDays: number }) => {
    demoDeployEscrow(demoWallet, payload.landlord, payload.rentAmountEth, payload.durationDays);
    refresh();
    return "demo";
  };

  const confirmLease = async (addr: string) => { demoConfirmLease(demoWallet, addr); refresh(); };
  const releaseFunds = async (addr: string) => { demoReleaseFunds(demoWallet, addr); refresh(); };
  const requestRefund = async (addr: string) => { demoRefund(demoWallet, addr); refresh(); };
  const rateLandlord = async (addr: string, score: number) => { demoRateLandlord(demoWallet, addr, score); refresh(); };

  const stats = {
    totalEscrows: escrows.length,
    totalValueEth: escrows.reduce((s, e) => s + Number(e.depositAmountEth), 0).toFixed(4),
    pending: escrows.filter((e) => e.status === "pending").length,
    confirmed: escrows.filter((e) => e.status === "confirmed").length,
    totalYieldEarned: escrows.reduce((s, e) => s + Number(e.accruedYieldEth), 0).toFixed(6),
  };

  return {
    escrows,
    loading: false,
    error: null as string | null,
    txPending: false,
    escrowStats: stats,
    refresh,
    createEscrow,
    confirmLease,
    releaseFunds,
    requestRefund,
    rateLandlord,
    trackExistingEscrow: () => {},
  };
}

// ─── Page Component ─────────────────────────────────────────────────────

const DashboardPage = ({ walletAddress }: DashboardPageProps) => {
  const [demoMode, setDemoMode] = useState(false);
  const [demoWallet, setDemoWallet] = useState("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");

  // Real mode hook (always called — React rules of hooks)
  const realHook = useEscrows(walletAddress ?? undefined);
  const demoHook = useDemoEscrows(demoWallet);

  const hook = demoMode ? demoHook : realHook;

  const {
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
    rateLandlord,
    trackExistingEscrow,
  } = hook;

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowDisplay | null>(null);
  const [trackAddress, setTrackAddress] = useState("");

  const effectiveWallet = demoMode ? demoWallet : walletAddress;
  const noEscrows = !loading && escrows.length === 0;

  return (
    <div className="space-y-6">
      {/* ── Demo Mode Banner ─────────────────────────────────── */}
      <Card className={demoMode
        ? "border-violet-600/60 bg-violet-950/40 text-slate-100 backdrop-blur-sm"
        : "border-slate-700/80 bg-slate-900/55 text-slate-100 backdrop-blur-sm"
      }>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant={demoMode ? "default" : "outline"}
                onClick={() => setDemoMode((p) => !p)}
                className={demoMode ? "bg-violet-600 hover:bg-violet-700" : ""}
              >
                {demoMode ? <Play className="h-4 w-4" /> : <Wallet className="h-4 w-4" />}
                {demoMode ? "Demo Mode ON" : "Switch to Demo Mode"}
              </Button>
            </div>
            {demoMode && (
              <label className="flex-1 grid gap-1 text-sm font-medium text-slate-200 min-w-[260px]">
                Demo Wallet Address
                <Input
                  placeholder="Enter any 0x address"
                  className="bg-white text-slate-900 font-mono text-xs"
                  value={demoWallet}
                  onChange={(e) => setDemoWallet(e.target.value)}
                />
              </label>
            )}
            {demoMode && (
              <p className="text-xs text-violet-300">
                📋 Demo mode uses simulated data — no MetaMask or testnet ETH needed. Enter any address above.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <section className="grid gap-4 md:grid-cols-5">
        <Card className="border-slate-700/80 bg-slate-900/55 text-slate-100 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Escrows</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-100">{escrowStats.totalEscrows}</CardContent>
        </Card>
        <Card className="border-slate-700/80 bg-slate-900/55 text-slate-100 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Escrow Value</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-slate-100">{escrowStats.totalValueEth} ETH</CardContent>
        </Card>
        <Card className="border-slate-700/80 bg-slate-900/55 text-slate-100 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-amber-600">{escrowStats.pending}</CardContent>
        </Card>
        <Card className="border-slate-700/80 bg-slate-900/55 text-slate-100 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Confirmed</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold text-emerald-700">{escrowStats.confirmed}</CardContent>
        </Card>
        <Card className="border-emerald-700/60 bg-emerald-950/40 text-slate-100 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Aave Yield
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-mono font-semibold text-emerald-400">+{escrowStats.totalYieldEarned} ETH</CardContent>
        </Card>
      </section>

      {/* ── Actions ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setShowCreateForm((prev) => !prev)}>
          <PlusCircle className="h-4 w-4" />
          {showCreateForm ? "Hide Create Form" : "Create New Escrow"}
        </Button>
        <Button variant="outline" onClick={() => refresh()} disabled={loading}>
          {loading ? "Loading..." : "🔄 Refresh"}
        </Button>
      </div>

      {showCreateForm && (
        <CreateEscrowForm walletAddress={effectiveWallet} onCreate={createEscrow} txPending={txPending} />
      )}

      {/* Track existing (real mode only) */}
      {!demoMode && (
        <Card className="border-slate-700/80 bg-slate-900/55 text-slate-100 backdrop-blur-sm">
          <CardContent className="pt-4">
            <div className="flex gap-2 items-end">
              <label className="flex-1 grid gap-1 text-sm font-medium text-slate-200">
                Track Existing Escrow
                <Input
                  placeholder="0x... contract address"
                  className="bg-white text-slate-900"
                  value={trackAddress}
                  onChange={(e) => setTrackAddress(e.target.value)}
                />
              </label>
              <Button
                variant="outline"
                className="shrink-0"
                onClick={() => {
                  if (/^0x[a-fA-F0-9]{40}$/.test(trackAddress.trim())) {
                    trackExistingEscrow(trackAddress.trim());
                    setTrackAddress("");
                  }
                }}
              >
                <Search className="h-4 w-4" />
                Track
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="inline-flex items-center gap-2 rounded-md border border-red-600/40 bg-red-900/30 px-3 py-2 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {loading && (
        <Card className="border-dashed border-slate-600 bg-slate-900/50 text-center text-slate-100 backdrop-blur-sm">
          <CardContent className="space-y-4 py-10">
            <p className="text-lg font-medium text-slate-300">Loading escrows from blockchain...</p>
          </CardContent>
        </Card>
      )}

      {noEscrows && !loading && (
        <Card className="border-dashed border-slate-600 bg-slate-900/50 text-center text-slate-100 backdrop-blur-sm">
          <CardContent className="space-y-4 py-10">
            <p className="text-lg font-medium text-slate-100">No escrow contracts yet</p>
            <p className="text-sm text-slate-400">
              {demoMode
                ? "Create a demo escrow above to see it in action."
                : "Create a new escrow or track an existing contract address."}
            </p>
            <Button onClick={() => setShowCreateForm(true)}>Create New Escrow</Button>
          </CardContent>
        </Card>
      )}

      {!noEscrows && !loading && (
        <div className="grid gap-4 xl:grid-cols-2">
          {escrows.map((escrow) => (
            <EscrowCard
              key={escrow.address}
              escrow={escrow}
              walletAddress={effectiveWallet}
              txPending={txPending}
              onConfirmLease={confirmLease}
              onReleaseFunds={releaseFunds}
              onRequestRefund={requestRefund}
              onRateLandlord={(address, score) => rateLandlord(address, score)}
            />
          ))}
        </div>
      )}

      <EscrowDetailsView
        escrow={selectedEscrow}
        open={Boolean(selectedEscrow)}
        onOpenChange={(open) => { if (!open) setSelectedEscrow(null); }}
      />
    </div>
  );
};

export default DashboardPage;
