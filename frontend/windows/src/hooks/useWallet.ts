import { BrowserProvider } from "ethers";
import { useCallback, useEffect, useState } from "react";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on: (eventName: string, handler: (...args: unknown[]) => void) => void;
      removeListener: (eventName: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

const shorten = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadExistingAccount = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_accounts", []);
      const first = accounts[0] as string | undefined;
      setAccount(first ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to detect wallet");
    }
  }, []);

  useEffect(() => {
    loadExistingAccount();
  }, [loadExistingAccount]);

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (nextAccounts: unknown) => {
      if (Array.isArray(nextAccounts) && typeof nextAccounts[0] === "string") {
        setAccount(nextAccounts[0]);
      } else {
        setAccount(null);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    return () => window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("No injected wallet found. Install MetaMask or another EVM wallet.");
      return;
    }

    setConnecting(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const first = accounts[0] as string | undefined;
      setAccount(first ?? null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet connection failed");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAccount(null);
  }, []);

  return {
    account,
    accountLabel: account ? shorten(account) : "Connect Wallet",
    connecting,
    error,
    isConnected: Boolean(account),
    connect,
    disconnect,
  };
};
