import { Home, LayoutDashboard, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import WalletConnectButton from "@/components/WalletConnectButton";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  accountLabel: string;
  isConnected: boolean;
  connecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const links = [
  { to: "/", label: "About", icon: Home },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/ratings", label: "Landlord Ratings", icon: Star },
];

const DashboardLayout = ({
  accountLabel,
  isConnected,
  connecting,
  onConnect,
  onDisconnect,
}: DashboardLayoutProps) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#1d2128]">
      <header
        className={cn(
          "sticky top-0 z-30 transition-colors duration-300",
          scrolled
            ? "border-b border-slate-700 bg-[#12161c]/96 backdrop-blur"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="container flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between">
          <NavLink to="/" className="flex items-center gap-3">
            <img src="/logof.png" alt="LeaseLock Logo" className="h-10 w-auto" />
            <span className="font-serif text-2xl font-semibold tracking-tight text-slate-100 hidden sm:inline-block">
              RentEscrow
            </span>
          </NavLink>
          <nav
            className={cn(
              "flex flex-wrap items-center gap-2 rounded-xl p-1 transition-colors",
              scrolled ? "border border-slate-700 bg-slate-900/70" : "border border-transparent bg-transparent",
            )}
          >
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-700 text-white"
                      : "text-slate-200 hover:bg-slate-800 hover:text-white",
                  )
                }
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            ))}
            <div className="ml-1">
              <WalletConnectButton
                accountLabel={accountLabel}
                isConnected={isConnected}
                connecting={connecting}
                onConnect={onConnect}
                onDisconnect={onDisconnect}
              />
            </div>
          </nav>
        </div>
      </header>

      <main className="container py-8 md:py-12">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
