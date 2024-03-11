import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  crafts: defineTable({
    title: v.string(),
    orgId: v.string(),
    authorId: v.string(),
    authorName: v.string(),
    imageUrl: v.string(),
  })
    .index("by_org", ["orgId"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["orgId"]
    }),
  userFavorites: defineTable({
    orgId: v.string(),
    userId: v.string(),
    craftId: v.id("crafts")
  })
    .index("by_craft", ["craftId"])
    .index("by_user_org", ["userId", "orgId"])
    .index("by_user_craft", ["userId", "craftId"])
    .index("by_user_craft_org", ["userId", "craftId", "orgId"])
});
