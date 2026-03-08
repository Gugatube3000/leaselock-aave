import { Shield, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg tracking-tight">RentEscrow</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Ratings
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Docs
          </a>
        </div>

        <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
