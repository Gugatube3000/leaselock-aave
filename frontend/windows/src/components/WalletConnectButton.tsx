import { LogOut, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";

interface WalletConnectButtonProps {
  accountLabel: string;
  isConnected: boolean;
  connecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const WalletConnectButton = ({
  accountLabel,
  isConnected,
  connecting,
  onConnect,
  onDisconnect,
}: WalletConnectButtonProps) => {
  return isConnected ? (
    <Button variant="outline" className="gap-2 border-primary/35" onClick={onDisconnect}>
      <LogOut className="h-4 w-4" />
      {accountLabel}
    </Button>
  ) : (
    <Button className="gap-2" onClick={onConnect} disabled={connecting}>
      <Wallet className="h-4 w-4" />
      {connecting ? "Connecting..." : accountLabel}
    </Button>
  );
};

export default WalletConnectButton;
