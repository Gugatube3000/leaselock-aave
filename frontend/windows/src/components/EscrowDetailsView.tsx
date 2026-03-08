import { Clock3, ExternalLink, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EscrowDisplay } from "@/services/blockchainService";
import { SEPOLIA_CONFIG } from "@/contracts/config";

interface EscrowDetailsViewProps {
  escrow: EscrowDisplay | null;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}

const EscrowDetailsView = ({ escrow, open, onOpenChange }: EscrowDetailsViewProps) => {
  if (!escrow) return null;

  const deadlineDate = new Date(escrow.deadline * 1000);
  const timeLeftMs = Math.max(deadlineDate.getTime() - Date.now(), 0);
  const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
  const etherscanUrl = `${SEPOLIA_CONFIG.blockExplorer}/address/${escrow.address}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl border-slate-300 bg-white text-slate-900">
        <DialogHeader>
          <DialogTitle className="font-mono text-base">{escrow.address}</DialogTitle>
          <DialogDescription>
            On-chain escrow contract on Sepolia — powered by Aave V3.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Contract Info</h3>
            <div className="rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700 space-y-1">
              <p>Tenant: <span className="font-mono text-xs">{escrow.tenant}</span></p>
              <p>Landlord: <span className="font-mono text-xs">{escrow.landlord}</span></p>
              <p>Deposit: <span className="font-semibold">{Number(escrow.depositAmountEth).toFixed(4)} ETH</span></p>
              <p className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {timeLeftMs > 0 ? `Deadline in ${hours}h` : "Deadline passed"}
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
                <span className="font-semibold text-emerald-700">Live Yield from Aave V3</span>
              </div>
              <p>Aave Balance: <span className="font-mono font-semibold">{Number(escrow.totalAaveBalanceEth).toFixed(6)} ETH</span></p>
              <p>Yield Earned: <span className="font-mono font-semibold text-emerald-700">+{escrow.accruedYieldEth} ETH</span></p>
              <p className="text-xs text-slate-500 mt-1">Real yield from Aave's Sepolia lending pool. Accrues as aWETH in the contract.</p>
            </div>
          </section>
        </div>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Rating</h3>
          <div className="rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-700">
            <p>Average: {(escrow.averageRating / 100).toFixed(1)} / 5.0</p>
            <p>Total ratings: {escrow.numRatings}</p>
          </div>
        </section>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.open(etherscanUrl, "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            View on Etherscan
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EscrowDetailsView;
