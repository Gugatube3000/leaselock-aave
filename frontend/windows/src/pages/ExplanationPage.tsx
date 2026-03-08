import { ArrowRight, Shield, TimerReset, TrendingUp, UserRoundCheck } from "lucide-react";
import { Fragment } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  "International student deposits rent into escrow",
  "Lease details are confirmed on-chain",
  "Landlord receives released rent on confirmation",
  "Student earns a small yield while funds are held",
  "Student leaves a landlord rating for future tenants",
];

const benefits = [
  {
    title: "Trustless Security",
    description: "Escrow funds are controlled by smart contracts, so neither side can access them unfairly.",
    icon: Shield,
  },
  {
    title: "Cross-Border Transparency",
    description: "International students and families can verify every escrow action with transparent on-chain history.",
    icon: UserRoundCheck,
  },
  {
    title: "Tenant Protection",
    description: "If lease confirmation does not happen before deadline, the student can recover funds safely.",
    icon: TimerReset,
  },
  {
    title: "Yield While You Wait",
    description: "Students can earn a small yield during escrow, helping offset exchange and transfer costs.",
    icon: TrendingUp,
  },
];

const ExplanationPage = () => {
  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-slate-600/80 bg-[linear-gradient(120deg,rgba(34,197,94,0.1)_0%,rgba(34,197,94,0.04)_45%,rgba(24,28,34,0.92)_100%)] p-8 shadow-xl shadow-slate-950/30 md:p-12">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-primary">About RentEscrow</p>
        <h2 className="max-w-3xl font-serif text-4xl font-semibold leading-tight text-slate-100 md:text-5xl">
          Built for International Students Renting Across Borders
        </h2>
        <p className="mt-4 max-w-3xl text-slate-300">
          Renting in a new country is stressful, especially when paying from abroad. RentEscrow keeps your rent in a
          secure smart contract until lease confirmation, gives both sides transparent status updates, and adds a small
          yield while your payment is being processed.
        </p>
        <div className="mt-8">
          <Button asChild size="lg" className="group">
            <Link to="/dashboard">
              Open Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="font-serif text-3xl text-slate-100">How Rent Escrow Works</h3>
        <div className="flex flex-col gap-3 md:flex-row md:items-stretch md:gap-2">
          {steps.map((step, index) => (
            <Fragment key={step}>
              <div
                className="relative flex-1 rounded-xl border border-slate-600/80 bg-slate-800/75 p-4 shadow-md shadow-slate-950/30"
              >
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Step {index + 1}</p>
                <p className="text-sm text-slate-200">{step}</p>
              </div>
              {index < steps.length - 1 ? (
                <div className="flex items-center justify-center px-1 text-primary md:px-0">
                  <span className="text-lg leading-none md:hidden">↓</span>
                  <span className="hidden text-lg leading-none md:inline">→</span>
                </div>
              ) : null}
            </Fragment>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="font-serif text-3xl text-slate-100">Benefits for Students and Landlords</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="border-slate-600/80 bg-slate-800/75 shadow-md shadow-slate-950/30">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <benefit.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl text-slate-100">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-300">{benefit.description}</CardContent>
            </Card>
          ))}
          <Card className="border-slate-700/80 bg-slate-900/95 text-slate-100 shadow-md shadow-slate-950/40 md:col-span-2">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Landlord Reputation Layer</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-200">
              Every completed escrow can include a 1-5 landlord rating, helping new international students choose
              reliable housing with more confidence.
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ExplanationPage;
