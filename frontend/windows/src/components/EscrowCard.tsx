import { Clock3, Copy, Eye, HandCoins, ShieldCheck, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { escrowService } from "@/services/escrowService";
import { EscrowContract } from "@/types/escrow";

interface EscrowCardProps {
  escrow: EscrowContract;
  walletAddress: string | null;
  onConfirmLease: (address: string) => void;
  onReleaseFunds: (address: string) => void;
  onRequestRefund: (address: string) => void;
  onRateLandlord: (address: string, score: number) => void;
  onViewDetails: (escrow: EscrowContract) => void;
}

const formatAddress = (address: string) => `${address.slice(0, 8)}...${address.slice(-6)}`;
const formatDate = (date: number) => new Date(date).toLocaleString();

const average = (escrow: EscrowContract) => {
  if (!escrow.ratingHistory.length) return 0;
  const total = escrow.ratingHistory.reduce((sum, entry) => sum + entry.score, 0);
  return total / escrow.ratingHistory.length;
};

const EscrowCard = ({
  escrow,
  walletAddress,
  onConfirmLease,
  onReleaseFunds,
  onRequestRefund,
  onRateLandlord,
  onViewDetails,
}: EscrowCardProps) => {
  const isTenant = walletAddress?.toLowerCase() === escrow.tenant.toLowerCase();
  const refundEnabled = escrowService.canRefund(escrow);

  return (
    <Card className="h-full border-slate-700/80 bg-slate-900/55 text-slate-100 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Escrow Contract</p>
            <CardTitle className="font-mono text-sm text-slate-100">{formatAddress(escrow.address)}</CardTitle>
          </div>
          <Badge variant={escrow.status === "pending" ? "secondary" : "default"}>{escrowService.statusLabel(escrow.status)}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md bg-slate-800/80 p-2">
            <p className="text-xs text-slate-400">Rent Amount</p>
            <p className="font-semibold text-slate-100">{escrow.rentAmountEth} ETH</p>
          </div>
          <div className="rounded-md bg-slate-800/80 p-2">
            <p className="text-xs text-slate-400">Yield %</p>
            <p className="font-semibold text-emerald-700">{escrow.yieldPercent}%</p>
          </div>
          <div className="col-span-2 rounded-md bg-emerald-950/40 border border-emerald-800/30 p-2">
            <p className="text-xs text-emerald-400 flex items-center gap-1.5">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Aave Yield Earned
            </p>
            <p className="font-mono font-semibold text-emerald-300 text-base">
              +{escrow.aaveYieldEarned || "0.000000"} ETH
            </p>
          </div>
          <div className="rounded-md bg-slate-800/80 p-2">
            <p className="text-xs text-slate-400">Tenant</p>
            <p className="font-mono text-xs text-slate-200">{formatAddress(escrow.tenant)}</p>
          </div>
          <div className="rounded-md bg-slate-800/80 p-2">
            <p className="text-xs text-slate-400">Landlord</p>
            <p className="font-mono text-xs text-slate-200">{formatAddress(escrow.landlord)}</p>
          </div>
        </div>

      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-800/65 px-3 py-2 text-sm text-slate-200">
          <span className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4" />
            Refund Deadline
          </span>
          <span className="font-mono text-xs">{formatDate(escrow.deadline)}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-200">
          <span className="inline-flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            Landlord Rating
          </span>
          <span>
            {average(escrow).toFixed(1)} ({escrow.ratingHistory.length} ratings)
          </span>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {isTenant ? (
            <Button
              variant="outline"
              className="border-emerald-500 text-emerald-700 hover:bg-emerald-50"
              onClick={() => onConfirmLease(escrow.address)}
              disabled={escrow.status !== "pending"}
            >
              <ShieldCheck className="h-4 w-4" />
              Confirm Lease
            </Button>
          ) : null}

          {isTenant ? (
            <Button
              variant="outline"
              className="border-orange-500 text-orange-700 hover:bg-orange-50"
              onClick={() => onRequestRefund(escrow.address)}
              disabled={!refundEnabled}
            >
              <HandCoins className="h-4 w-4" />
              Request Refund
            </Button>
          ) : null}

          {isTenant ? (
            <Button
              variant="outline"
              className="border-sky-500 text-sky-700 hover:bg-sky-50"
              onClick={() => {
                const score = window.prompt("Rate landlord 1-5", "5");
                const number = Number(score);
                if (number >= 1 && number <= 5) onRateLandlord(escrow.address, number);
              }}
            >
              <Star className="h-4 w-4" />
              Rate Landlord
            </Button>
          ) : null}

          {escrow.status === "confirmed" ? (
            <Button onClick={() => onReleaseFunds(escrow.address)}>
              Release Funds
            </Button>
          ) : null}

          <Button variant="secondary" onClick={() => onViewDetails(escrow)}>
            <Eye className="h-4 w-4" />
            View Contract Details
          </Button>

          <Button
            variant="secondary"
            onClick={async () => {
              await navigator.clipboard.writeText(escrow.address);
            }}
          >
            <Copy className="h-4 w-4" />
            Copy Contract Address
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EscrowCard;
