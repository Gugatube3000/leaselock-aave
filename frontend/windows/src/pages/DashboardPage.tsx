import { AlertTriangle, PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";

import CreateEscrowForm from "@/components/CreateEscrowForm";
import EscrowCard from "@/components/EscrowCard";
import EscrowDetailsView from "@/components/EscrowDetailsView";
import EscrowTable from "@/components/EscrowTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEscrows } from "@/hooks/useEscrows";
import { EscrowContract } from "@/types/escrow";

interface DashboardPageProps {
  walletAddress: string | null;
}

const DashboardPage = ({ walletAddress }: DashboardPageProps) => {
  const {
    escrows,
    loading,
    error,
    escrowStats,
    createEscrow,
    confirmLease,
    releaseFunds,
    requestRefund,
    rateLandlord,
  } = useEscrows(walletAddress ?? undefined);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowContract | null>(null);

  const noEscrows = useMemo(() => !loading && escrows.length === 0, [escrows.length, loading]);

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
      </div>

      {showCreateForm ? <CreateEscrowForm walletAddress={walletAddress} onCreate={createEscrow} /> : null}

      {error ? (
        <div className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      ) : null}

      {noEscrows ? (
        <Card className="border-dashed border-slate-600 bg-slate-900/50 text-center text-slate-100 backdrop-blur-sm">
          <CardContent className="space-y-4 py-10">
            <p className="text-lg font-medium text-slate-100">You currently have no escrow contracts</p>
            <Button onClick={() => setShowCreateForm(true)}>Create New Escrow</Button>
          </CardContent>
        </Card>
      ) : null}

      {!noEscrows ? (
        <>
          <EscrowTable escrows={escrows} onSelect={setSelectedEscrow} />

          <div className="grid gap-4 xl:grid-cols-2">
            {escrows.map((escrow) => (
              <EscrowCard
                key={escrow.address}
                escrow={escrow}
                walletAddress={walletAddress}
                onConfirmLease={confirmLease}
                onReleaseFunds={releaseFunds}
                onRequestRefund={requestRefund}
                onRateLandlord={(address, score) =>
                  rateLandlord(address, walletAddress ?? "0x0000000000000000000000000000000000000000", score, "")
                }
                onViewDetails={setSelectedEscrow}
              />
            ))}
          </div>
        </>
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
