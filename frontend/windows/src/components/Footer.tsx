import { Shield } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-semibold">RentEscrow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Secure rent payments for international students. Powered by smart contracts & stablecoins.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
