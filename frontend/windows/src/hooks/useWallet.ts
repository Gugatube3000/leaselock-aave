import { BrowserProvider } from "ethers";
import { useCallback, useEffect, useState } from "react";
import { SEPOLIA_CONFIG } from "@/contracts/config";

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

async function ensureSepoliaNetwork(): Promise<void> {
  if (!window.ethereum) return;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CONFIG.chainIdHex }],
    });
  } catch (err: unknown) {
    // Chain not added — add it
    if (err && typeof err === "object" && "code" in err && (err as { code: number }).code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: SEPOLIA_CONFIG.chainIdHex,
            chainName: SEPOLIA_CONFIG.chainName,
            rpcUrls: [SEPOLIA_CONFIG.rpcUrl],
            blockExplorerUrls: [SEPOLIA_CONFIG.blockExplorer],
            nativeCurrency: SEPOLIA_CONFIG.nativeCurrency,
          },
        ],
      });
    }
  }
}

export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onSepolia, setOnSepolia] = useState(false);

  const checkNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const chainId = (await window.ethereum.request({ method: "eth_chainId" })) as string;
      setOnSepolia(parseInt(chainId, 16) === SEPOLIA_CONFIG.chainId);
    } catch {
      setOnSepolia(false);
    }
  }, []);

  const loadExistingAccount = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_accounts", []);
      const first = accounts[0] as string | undefined;
      setAccount(first ?? null);
      await checkNetwork();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to detect wallet");
    }
  }, [checkNetwork]);

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

    const handleChainChanged = () => {
      checkNetwork();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum?.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener("chainChanged", handleChainChanged);
    };
  }, [checkNetwork]);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      setError("No injected wallet found. Install MetaMask or another EVM wallet.");
      return;
    }

    setConnecting(true);
    try {
      await ensureSepoliaNetwork();
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const first = accounts[0] as string | undefined;
      setAccount(first ?? null);
      setError(null);
      await checkNetwork();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wallet connection failed");
    } finally {
      setConnecting(false);
    }
  }, [checkNetwork]);

  const disconnect = useCallback(() => {
    setAccount(null);
  }, []);

  return {
    account,
    accountLabel: account ? shorten(account) : "Connect Wallet",
    connecting,
    error,
    isConnected: Boolean(account),
    onSepolia,
    connect,
    disconnect,
  };
};
