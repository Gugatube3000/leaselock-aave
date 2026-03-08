import { escrowService } from "@/services/escrowService";
import { LandlordRatingSummary, RatingSortOption } from "@/types/escrow";

const compareBySort = (a: LandlordRatingSummary, b: LandlordRatingSummary, sort: RatingSortOption) => {
  if (sort === "highest-rated") return b.averageRating - a.averageRating;
  if (sort === "most-rated") return b.totalRatings - a.totalRatings;
  return b.escrowCount - a.escrowCount;
};

export const ratingService = {
  listLandlords(search: string, sort: RatingSortOption) {
    const query = search.trim().toLowerCase();
    const all = escrowService.getLandlordSummaries();

    return all
      .filter((entry) => (query ? entry.landlord.toLowerCase().includes(query) : true))
      .sort((a, b) => compareBySort(a, b, sort));
  },
};
