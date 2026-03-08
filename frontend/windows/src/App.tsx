import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import DashboardLayout from "@/components/DashboardLayout";
import { useWallet } from "@/hooks/useWallet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import ExplanationPage from "./pages/ExplanationPage";
import LandlordRatingsPage from "./pages/LandlordRatingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const { account, accountLabel, connecting, isConnected, onSepolia, connect, disconnect } = useWallet();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          {isConnected && !onSepolia && (
            <div className="bg-amber-700 text-white text-center py-2 text-sm font-medium">
              ⚠️ Please switch MetaMask to the <strong>Sepolia testnet</strong> to use this app.
            </div>
          )}
          <Routes>
            <Route
              element={
                <DashboardLayout
                  accountLabel={accountLabel}
                  isConnected={isConnected}
                  connecting={connecting}
                  onConnect={connect}
                  onDisconnect={disconnect}
                />
              }
            >
              <Route path="/" element={<ExplanationPage />} />
              <Route path="/dashboard" element={<DashboardPage walletAddress={account} />} />
              <Route path="/ratings" element={<LandlordRatingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
