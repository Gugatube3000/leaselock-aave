import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CreateEscrowInput } from "@/types/escrow";

interface CreateEscrowFormProps {
  walletAddress: string | null;
  onCreate: (data: CreateEscrowInput, tenant: string) => void;
}

const initialState: CreateEscrowInput = {
  landlord: "",
  rentAmountEth: "",
  yieldPercent: 3,
  durationDays: 7,
};

const ethAddressPattern = /^0x[a-fA-F0-9]{40}$/;

const CreateEscrowForm = ({ walletAddress, onCreate }: CreateEscrowFormProps) => {
  const [form, setForm] = useState<CreateEscrowInput>(initialState);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isDisabled = useMemo(() => !walletAddress, [walletAddress]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
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
    if (form.yieldPercent < 0 || form.yieldPercent > 100) {
      setValidationError("Yield percentage must be between 0 and 100.");
      return;
    }
    if (form.durationDays < 1 || form.durationDays > 365) {
      setValidationError("Lease duration should be between 1 and 365 days.");
      return;
    }

    onCreate(form, walletAddress);
    setValidationError(null);
    setForm(initialState);
  };

  return (
    <Card className="border-slate-700/80 bg-slate-900/55 text-slate-100 shadow-lg shadow-slate-950/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl text-slate-100">Create New Escrow</CardTitle>
        <CardDescription className="text-slate-300">
          Deploy a new rent escrow contract with your landlord, deposit amount, and refund deadline.
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

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 text-sm font-medium text-slate-200">
              Rent Amount (ETH)
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
              Yield Percentage
              <Input
                type="number"
                min="0"
                max="100"
                className="bg-white text-slate-900"
                value={form.yieldPercent}
                onChange={(event) =>
                  setForm((current) => ({ ...current, yieldPercent: Number(event.target.value || "0") }))
                }
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

          {validationError ? <p className="text-sm text-red-600">{validationError}</p> : null}

          <Button disabled={isDisabled} className="w-full md:w-fit">
            Deposit & Deploy Escrow
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateEscrowForm;
