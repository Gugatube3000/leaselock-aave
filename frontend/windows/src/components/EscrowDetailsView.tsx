import { Clock3, ShieldCheck, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EscrowContract } from "@/types/escrow";

interface EscrowDetailsViewProps {
  escrow: EscrowContract | null;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}

const EscrowDetailsView = ({ escrow, open, onOpenChange }: EscrowDetailsViewProps) => {
  if (!escrow) return null;

  const timeLeftMs = Math.max(escrow.deadline - Date.now(), 0);
  const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border-slate-300 bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="font-mono text-base">{escrow.address}</DialogTitle>
          <DialogDescription>
            Contract information, transaction history, rating history, and deadline countdown.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Contract Information</h3>
            <div className="rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">
              <p>Tenant: <span className="font-mono text-xs">{escrow.tenant}</span></p>
              <p>Landlord: <span className="font-mono text-xs">{escrow.landlord}</span></p>
              <p>Rent Amount: {escrow.rentAmountEth} ETH</p>
              <p>Yield: {escrow.yieldPercent}%</p>
              <p className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                Deadline in {hours}h
              </p>
              <p className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <Badge variant={escrow.status === "pending" ? "secondary" : "default"}>{escrow.status}</Badge>
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Aave V3 Yield</h3>
            <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-emerald-700">Earning Yield via Aave V3</span>
              </div>
              <p>Deposited: <span className="font-mono font-semibold">{escrow.rentAmountEth} WETH</span></p>
              <p>Yield Earned: <span className="font-mono font-semibold text-emerald-700">+{escrow.aaveYieldEarned || "0.000000"} ETH</span></p>
              <p>Est. APY: <span className="font-mono text-emerald-600">~3.5%</span></p>
              <p className="text-xs text-slate-500 mt-1">ETH is wrapped to WETH and supplied to Aave's lending pool. Yield accrues as aWETH in real-time.</p>
            </div>
          </section>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Rating History</h3>
            <div className="max-h-52 space-y-2 overflow-auto pr-2 text-sm">
              {escrow.ratingHistory.length ? (
                escrow.ratingHistory.map((entry) => (
                  <div key={entry.id} className="rounded-md border border-slate-300 p-2">
                    <p className="inline-flex items-center gap-2 text-amber-600">
                      <Star className="h-4 w-4" />
                      {entry.score}/5
                    </p>
                    <p className="text-xs text-slate-500">{entry.review || "No text review"}</p>
                    <p className="text-xs text-slate-400">{new Date(entry.timestamp).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-slate-500">No ratings yet for this landlord.</p>
              )}
            </div>
          </section>
        </div>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Transaction History</h3>
          <div className="max-h-44 space-y-2 overflow-auto pr-2 text-sm">
            {escrow.transactionHistory.map((txn) => (
              <div key={txn.id} className="rounded-md border border-slate-300 p-2">
                <p className="font-medium text-slate-800">{txn.note}</p>
                <p className="font-mono text-xs text-slate-500">{txn.hash}</p>
                <p className="text-xs text-slate-400">{new Date(txn.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>

        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default EscrowDetailsView;
