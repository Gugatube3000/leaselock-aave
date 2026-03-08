import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CreateEscrowInput } from "@/hooks/useEscrows";

interface CreateEscrowFormProps {
  walletAddress: string | null;
  onCreate: (data: CreateEscrowInput) => Promise<unknown>;
  txPending: boolean;
}

const initialState: CreateEscrowInput = {
  landlord: "",
  rentAmountEth: "",
  durationDays: 7,
};

const ethAddressPattern = /^0x[a-fA-F0-9]{40}$/;

const CreateEscrowForm = ({ walletAddress, onCreate, txPending }: CreateEscrowFormProps) => {
  const [form, setForm] = useState<CreateEscrowInput>(initialState);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [deploying, setDeploying] = useState(false);

  const isDisabled = useMemo(() => !walletAddress || txPending || deploying, [walletAddress, txPending, deploying]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!walletAddress) {
      setValidationError("Connect your wallet before creating an escrow.");
      return;
    }
    if (!ethAddressPattern.test(form.landlord.trim())) {
      setValidationError("Please enter a valid landlord EVM address.");
      return;
    }
    if (Number(form.rentAmountEth) <= 0) {
      setValidationError("Rent amount must be greater than 0 ETH.");
      return;
    }
    if (form.durationDays < 1 || form.durationDays > 365) {
      setValidationError("Lease duration should be between 1 and 365 days.");
      return;
    }

    setDeploying(true);
    setValidationError(null);
    try {
      await onCreate(form);
      setForm(initialState);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setDeploying(false);
    }
  };

  return (
    <Card className="border-slate-700/80 bg-slate-900/55 text-slate-100 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-slate-100">Create New Escrow</CardTitle>
        <CardDescription className="text-slate-300">
          Deploy a new AaveRentEscrow contract on Sepolia. Your ETH will be wrapped to WETH and supplied to Aave V3 for real yield.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={submit}>
          <label className="grid gap-2 text-sm font-medium text-slate-200">
            Landlord Address
            <Input
              placeholder="0x..."
              className="bg-white text-slate-900"
              value={form.landlord}
              onChange={(event) => setForm((current) => ({ ...current, landlord: event.target.value }))}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-slate-200">
              Rent Amount (Sepolia ETH)
              <Input
                type="number"
                step="0.001"
                min="0"
                className="bg-white text-slate-900"
                value={form.rentAmountEth}
                onChange={(event) => setForm((current) => ({ ...current, rentAmountEth: event.target.value }))}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-slate-200">
              Lease Duration (days)
              <Input
                type="number"
                min="1"
                max="365"
                className="bg-white text-slate-900"
                value={form.durationDays}
                onChange={(event) =>
                  setForm((current) => ({ ...current, durationDays: Number(event.target.value || "1") }))
                }
              />
            </label>
          </div>

          <div className="rounded-md bg-emerald-950/40 border border-emerald-800/30 p-3 text-sm text-emerald-300">
            <p className="flex items-center gap-1.5 font-medium">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Aave V3 Yield
            </p>
            <p className="text-xs text-emerald-400/80 mt-1">
              Your deposit will automatically earn yield from Aave's lending pool on Sepolia. The yield goes to the tenant when funds are released.
            </p>
          </div>

          {validationError ? <p className="text-sm text-red-400">{validationError}</p> : null}

          <Button disabled={isDisabled} className="w-full md:w-fit">
            {deploying ? "⏳ Deploying Contract..." : "🚀 Deploy Escrow on Sepolia"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateEscrowForm;
