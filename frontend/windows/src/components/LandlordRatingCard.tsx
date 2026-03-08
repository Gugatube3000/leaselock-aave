import { Star, Users, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LandlordRatingSummary } from "@/types/escrow";

interface LandlordRatingCardProps {
  summary: LandlordRatingSummary;
  onSelect: (landlordAddress: string) => void;
}

const renderStars = (value: number) =>
  Array.from({ length: 5 }, (_, index) => {
    const star = index + 1;
    return (
      <Star
        key={star}
        className={`h-4 w-4 ${star <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
      />
    );
  });

const compact = (address: string) => `${address.slice(0, 8)}...${address.slice(-6)}`;

const LandlordRatingCard = ({ summary, onSelect }: LandlordRatingCardProps) => {
  return (
    <Card
      className="cursor-pointer border-slate-700/80 bg-slate-900/55 text-slate-100 shadow-lg shadow-slate-950/20 backdrop-blur-sm transition-transform duration-200 hover:-translate-y-0.5"
      onClick={() => onSelect(summary.landlord)}
    >
      <CardHeader className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Landlord</p>
        <CardTitle className="font-mono text-sm text-slate-100">{compact(summary.landlord)}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 text-sm text-slate-300">
        <div className="flex items-center gap-2">{renderStars(summary.averageRating)}</div>
        <p>{summary.averageRating.toFixed(1)} average rating</p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md bg-slate-800/80 p-2">
            <Users className="mb-1 h-4 w-4 text-slate-400" />
            <p className="font-semibold text-slate-100">{summary.totalRatings}</p>
            <p className="text-slate-400">Total Ratings</p>
          </div>
          <div className="rounded-md bg-slate-800/80 p-2">
            <Wallet className="mb-1 h-4 w-4 text-slate-400" />
            <p className="font-semibold text-slate-100">{summary.escrowCount}</p>
            <p className="text-slate-400">Escrow Count</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LandlordRatingCard;
