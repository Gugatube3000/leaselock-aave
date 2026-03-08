import { Clock, CheckCircle2, ArrowDownRight, ArrowUpRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockEscrow = {
  id: "0x7a3f…c91e",
  tenant: "0x1234…abcd",
  landlord: "0x5678…efgh",
  amount: "1,200",
  currency: "USDC",
  status: "awaiting_confirmation",
  yield: "3%",
  deadline: "Mar 15, 2026",
  rating: null,
};

const EscrowDashboard = () => {
  return (
    <section className="py-24 relative" id="dashboard">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Escrow <span className="text-gradient">Dashboard</span>
          </h2>
          <p className="text-muted-foreground text-lg">Track your active escrow contracts.</p>
        </div>

        <div className="max-w-2xl mx-auto glass rounded-2xl p-8 glow-border">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-primary" />
              <div>
                <div className="font-semibold">Escrow Contract</div>
                <div className="font-mono text-xs text-muted-foreground">{mockEscrow.id}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 text-warning text-sm">
              <Clock className="w-3 h-3" />
              Pending
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-muted-foreground text-sm">Amount</span>
              <span className="font-mono font-semibold text-lg">
                {mockEscrow.amount} <span className="text-primary text-sm">{mockEscrow.currency}</span>
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-muted-foreground text-sm">Yield Bonus</span>
              <span className="font-mono text-success">{mockEscrow.yield}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-muted-foreground text-sm">Tenant</span>
              <span className="font-mono text-xs text-muted-foreground">{mockEscrow.tenant}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-border/50">
              <span className="text-muted-foreground text-sm">Landlord</span>
              <span className="font-mono text-xs text-muted-foreground">{mockEscrow.landlord}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-muted-foreground text-sm">Refund Deadline</span>
              <span className="text-sm">{mockEscrow.deadline}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <CheckCircle2 className="w-4 h-4" />
              Confirm Lease
            </Button>
            <Button variant="outline" className="gap-2 border-border hover:bg-surface-hover">
              <ArrowDownRight className="w-4 h-4" />
              Request Refund
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EscrowDashboard;
