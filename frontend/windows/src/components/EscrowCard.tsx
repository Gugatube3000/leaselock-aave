import { Clock3, Copy, ExternalLink, HandCoins, ShieldCheck, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EscrowDisplay } from "@/services/blockchainService";
import { SEPOLIA_CONFIG } from "@/contracts/config";

interface EscrowCardProps {
  escrow: EscrowDisplay;
  walletAddress: string | null;
  txPending: boolean;
  onConfirmLease: (address: string) => void;
  onReleaseFunds: (address: string) => void;
  onRequestRefund: (address: string) => void;
  onRateLandlord: (address: string, score: number) => void;
}

const formatAddress = (address: string) => `${address.slice(0, 8)}...${address.slice(-6)}`;
const formatDeadline = (unixSec: number) => new Date(unixSec * 1000).toLocaleString();

const statusLabel: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  released: "Released",
  refunded: "Refunded",
};

const statusVariant = (status: string) =>
  status === "pending" ? "secondary" as const : "default" as const;

const EscrowCard = ({
  escrow,
  walletAddress,
  txPending,
  onConfirmLease,
  onReleaseFunds,
  onRequestRefund,
  onRateLandlord,
}: EscrowCardProps) => {
  const isTenant = walletAddress?.toLowerCase() === escrow.tenant.toLowerCase();
  const isActive = escrow.status === "pending" || escrow.status === "confirmed";

  return (
    <Card className="h-full border-slate-700/80 bg-slate-900/55 text-slate-100 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Escrow Contract</p>
            <CardTitle className="font-mono text-sm text-slate-100">{formatAddress(escrow.address)}</CardTitle>
          </div>
          <Badge variant={statusVariant(escrow.status)}>{statusLabel[escrow.status]}</Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md bg-slate-800/80 p-2">
            <p className="text-xs text-slate-400">Deposit</p>
            <p className="font-semibold text-slate-100">{Number(escrow.depositAmountEth).toFixed(4)} ETH</p>
          </div>
          <div className="rounded-md bg-slate-800/80 p-2">
            <p className="text-xs text-slate-400">Aave Balance</p>
            <p className="font-semibold text-slate-100">{Number(escrow.totalAaveBalanceEth).toFixed(6)} ETH</p>
          </div>
          {isActive && (
            <div className="col-span-2 rounded-md bg-emerald-950/40 border border-emerald-800/30 p-2">
              <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Aave Yield Earned (live)
              </p>
              <p className="font-mono font-semibold text-emerald-300 text-base">
                +{escrow.accruedYieldEth} ETH
              </p>
            </div>
          )}
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
          <span className="font-mono text-xs">{formatDeadline(escrow.deadline)}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-slate-200">
          <span className="inline-flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-500" />
            Landlord Rating
          </span>
          <span>
            {(escrow.averageRating / 100).toFixed(1)} ({escrow.numRatings} ratings)
          </span>
        </div>

        <div className="grid gap-2 md:grid-cols-2">
          {isTenant && escrow.status === "pending" && (
            <Button
              variant="outline"
              className="border-emerald-500 text-emerald-400 hover:bg-emerald-950"
              onClick={() => onConfirmLease(escrow.address)}
              disabled={txPending}
            >
              <ShieldCheck className="h-4 w-4" />
              {txPending ? "Confirming..." : "Confirm Lease"}
            </Button>
          )}

          {isTenant && escrow.status === "pending" && (
            <Button
              variant="outline"
              className="border-orange-500 text-orange-400 hover:bg-orange-950"
              onClick={() => onRequestRefund(escrow.address)}
              disabled={txPending}
            >
              <HandCoins className="h-4 w-4" />
              {txPending ? "Refunding..." : "Request Refund"}
            </Button>
          )}

          {escrow.status === "confirmed" && (
            <Button
              onClick={() => onReleaseFunds(escrow.address)}
              disabled={txPending}
            >
              {txPending ? "Releasing..." : "Release Funds"}
            </Button>
          )}

          {isTenant && escrow.status === "confirmed" && (
            <Button
              variant="outline"
              className="border-sky-500 text-sky-400 hover:bg-sky-950"
              onClick={() => {
                const score = window.prompt("Rate landlord 1-5", "5");
                const number = Number(score);
                if (number >= 1 && number <= 5) onRateLandlord(escrow.address, number);
              }}
              disabled={txPending}
            >
              <Star className="h-4 w-4" />
              Rate Landlord
            </Button>
          )}

          <Button
            variant="secondary"
            onClick={() => window.open(`${SEPOLIA_CONFIG.blockExplorer}/address/${escrow.address}`, "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
            View on Etherscan
          </Button>

          <Button
            variant="secondary"
            onClick={async () => {
              await navigator.clipboard.writeText(escrow.address);
            }}
          >
            <Copy className="h-4 w-4" />
            Copy Address
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EscrowCard;
