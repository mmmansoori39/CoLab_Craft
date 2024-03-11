import { v } from "convex/values";
import { getAllOrThrow } from "convex-helpers/server/relationships";

import { query } from "./_generated/server";

export const get = query({
  args: {
    orgId: v.string(),
    search: v.optional(v.string()),
    favorites: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    if (args.favorites) {
      const favoritedCrafts = await ctx.db
        .query("userFavorites")
        .withIndex("by_user_org", (q) => 
          q
            .eq("userId", identity.subject)
            .eq("orgId", args.orgId)
        )
        .order("desc")
        .collect();

      const ids = favoritedCrafts.map((b) => b.craftId);

      const crafts = await getAllOrThrow(ctx.db, ids);

      return crafts.map((craft) => ({
        ...craft,
        isFavorite: true,
      }));
    }

    const title = args.search as string;
    let crafts = [];

    if (title) {
      crafts = await ctx.db
        .query("crafts")
        .withSearchIndex("search_title", (q) => 
          q
            .search("title", title)
            .eq("orgId", args.orgId)
        )
        .collect();
    } else {
      crafts = await ctx.db
        .query("crafts")
        .withIndex("by_org", (q) => q.eq("orgId", args.orgId))
        .order("desc")
        .collect();
    }

    const craftsWithFavoriteRelation = crafts.map((craft) => {
      return ctx.db
        .query("userFavorites")
        .withIndex("by_user_craft", (q) => 
          q
            .eq("userId", identity.subject)
            .eq("craftId", craft._id)
        )
        .unique()
        .then((favorite) => {
          return {
            ...craft,
            isFavorite: !!favorite,
          };
        });
    });

    const craftsWithFavoriteBoolean = Promise.all(craftsWithFavoriteRelation);

    return craftsWithFavoriteBoolean;
  },
});
