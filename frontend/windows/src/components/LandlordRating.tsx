import { Star, TrendingUp, Users, BarChart3 } from "lucide-react";

const mockLandlords = [
  {
    address: "0x5678…efgh",
    name: "Metro Housing LLC",
    avgRating: 4.7,
    totalRatings: 23,
    transactions: 45,
    trustScore: 92,
  },
  {
    address: "0x9abc…ijkl",
    name: "CityNest Properties",
    avgRating: 3.9,
    totalRatings: 12,
    transactions: 18,
    trustScore: 74,
  },
  {
    address: "0xdef0…mnop",
    name: "Global Student Homes",
    avgRating: 4.9,
    totalRatings: 56,
    transactions: 89,
    trustScore: 98,
  },
];

const StarDisplay = ({ rating }: { rating: number }) => {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= Math.round(rating)
              ? "fill-primary text-primary"
              : "text-border"
          }`}
        />
      ))}
    </div>
  );
};

const getTrustColor = (score: number) => {
  if (score >= 90) return "text-success";
  if (score >= 70) return "text-warning";
  return "text-destructive";
};

const LandlordRating = () => {
  return (
    <section className="py-24 relative">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Landlord <span className="text-gradient">Ratings</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            On-chain ratings + our API trust score based on transactions, history, and tenant reviews.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {mockLandlords.map((landlord) => (
            <div
              key={landlord.address}
              className="glass rounded-xl p-6 hover:glow-border transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{landlord.name}</h3>
                  <span className="font-mono text-xs text-muted-foreground">{landlord.address}</span>
                </div>
                <div className={`font-mono text-2xl font-bold ${getTrustColor(landlord.trustScore)}`}>
                  {landlord.trustScore}
                </div>
              </div>

              <StarDisplay rating={landlord.avgRating} />
              <div className="text-sm text-muted-foreground mt-1 mb-6">
                {landlord.avgRating.toFixed(1)} avg · {landlord.totalRatings} ratings
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg bg-surface">
                  <BarChart3 className="w-4 h-4 text-primary mx-auto mb-1" />
                  <div className="font-mono text-sm font-semibold">{landlord.transactions}</div>
                  <div className="text-xs text-muted-foreground">Txns</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-surface">
                  <Users className="w-4 h-4 text-primary mx-auto mb-1" />
                  <div className="font-mono text-sm font-semibold">{landlord.totalRatings}</div>
                  <div className="text-xs text-muted-foreground">Reviews</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-surface">
                  <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
                  <div className={`font-mono text-sm font-semibold ${getTrustColor(landlord.trustScore)}`}>
                    {landlord.trustScore}%
                  </div>
                  <div className="text-xs text-muted-foreground">Trust</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandlordRating;
