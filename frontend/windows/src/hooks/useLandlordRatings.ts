import { useMemo } from "react";

import { ratingService } from "@/services/ratingService";
import { RatingSortOption } from "@/types/escrow";

export const useLandlordRatings = (search: string, sort: RatingSortOption) => {
  return useMemo(() => ratingService.listLandlords(search, sort), [search, sort]);
};
