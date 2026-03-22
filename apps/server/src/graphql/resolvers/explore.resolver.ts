import * as exploreService from '../../services/explore.service.js';

export const exploreResolvers = {
  Query: {
    exploreCouples: async (
      _parent: unknown,
      args: { limit?: number; offset?: number; search?: string },
    ) => {
      return exploreService.exploreCouples(args);
    },

    trendingCouples: async (
      _parent: unknown,
      args: { limit?: number },
    ) => {
      return exploreService.trendingCouples(args.limit);
    },
  },
};
