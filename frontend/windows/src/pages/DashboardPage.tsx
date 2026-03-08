import { AlertTriangle, PlusCircle, Search } from "lucide-react";
import { useState } from "react";

import CreateEscrowForm from "@/components/CreateEscrowForm";
import EscrowCard from "@/components/EscrowCard";
import EscrowDetailsView from "@/components/EscrowDetailsView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEscrows } from "@/hooks/useEscrows";
import { EscrowDisplay } from "@/services/blockchainService";

interface DashboardPageProps {
  walletAddress: string | null;
}

const DashboardPage = ({ walletAddress }: DashboardPageProps) => {
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
  } = useEscrows(walletAddress ?? undefined);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowDisplay | null>(null);
  const [trackAddress, setTrackAddress] = useState("");

  const noEscrows = !loading && escrows.length === 0;

  return (
    <div className="space-y-6">
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

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setShowCreateForm((prev) => !prev)}>
          <PlusCircle className="h-4 w-4" />
          {showCreateForm ? "Hide Create Form" : "Create New Escrow"}
        </Button>
        <Button variant="outline" onClick={() => refresh()} disabled={loading}>
          {loading ? "Loading..." : "🔄 Refresh"}
        </Button>
      </div>

      {showCreateForm ? (
        <CreateEscrowForm walletAddress={walletAddress} onCreate={createEscrow} txPending={txPending} />
      ) : null}

      {/* Track an existing escrow by address */}
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

      {error ? (
        <div className="inline-flex items-center gap-2 rounded-md border border-red-600/40 bg-red-900/30 px-3 py-2 text-sm text-red-400">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      ) : null}

      {loading ? (
        <Card className="border-dashed border-slate-600 bg-slate-900/50 text-center text-slate-100 backdrop-blur-sm">
          <CardContent className="space-y-4 py-10">
            <p className="text-lg font-medium text-slate-300">Loading escrows from blockchain...</p>
          </CardContent>
        </Card>
      ) : noEscrows ? (
        <Card className="border-dashed border-slate-600 bg-slate-900/50 text-center text-slate-100 backdrop-blur-sm">
          <CardContent className="space-y-4 py-10">
            <p className="text-lg font-medium text-slate-100">No escrow contracts tracked yet</p>
            <p className="text-sm text-slate-400">Create a new escrow or track an existing contract address above.</p>
            <Button onClick={() => setShowCreateForm(true)}>Create New Escrow</Button>
          </CardContent>
        </Card>
      ) : null}

      {!noEscrows && !loading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {escrows.map((escrow) => (
            <EscrowCard
              key={escrow.address}
              escrow={escrow}
              walletAddress={walletAddress}
              txPending={txPending}
              onConfirmLease={confirmLease}
              onReleaseFunds={releaseFunds}
              onRequestRefund={requestRefund}
              onRateLandlord={(address, score) => rateLandlord(address, score)}
            />
          ))}
        </div>
      ) : null}

      <EscrowDetailsView
        escrow={selectedEscrow}
        open={Boolean(selectedEscrow)}
        onOpenChange={(open) => {
          if (!open) setSelectedEscrow(null);
        }}
      />
    </div>
  );
};

export default DashboardPage;
