import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

const images = [
  "/placeholders/1.svg",
  "/placeholders/2.svg",
  "/placeholders/3.svg",
  "/placeholders/4.svg",
  "/placeholders/5.svg",
  "/placeholders/6.svg",
  "/placeholders/7.svg",
  "/placeholders/8.svg",
  "/placeholders/9.svg",
  "/placeholders/10.svg",
];

export const create = mutation({
  args: {
    orgId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const randomImage = images[Math.floor(Math.random() * images.length)];

    console.log(randomImage, "TEST")
    console.log(identity)
    const craft = await ctx.db.insert("crafts", {
      title: args.title,
      orgId: args.orgId,
      authorId: identity.subject,
      authorName: identity.name!,
      imageUrl: randomImage,
    });

    return craft;
  },
});

export const remove = mutation({
  args: { id: v.id("crafts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const userId = identity.subject;

    const existingFavorite = await ctx.db
      .query("userFavorites")
      .withIndex("by_user_craft", (q) => 
        q
          .eq("userId", userId)
          .eq("craftId", args.id)
      )
      .unique();

    if (existingFavorite) {
      await ctx.db.delete(existingFavorite._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const update = mutation({
  args: { id: v.id("crafts"), title: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const title = args.title.trim();

    if (!title) {
      throw new Error("Title is required");
    }

    if (title.length > 60) {
      throw new Error("Title cannot be longer than 60 characters")
    }

    const craft = await ctx.db.patch(args.id, {
      title: args.title,
    });

    return craft;
  },
});

export const favorite = mutation({
  args: { id: v.id("crafts"), orgId: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const craft = await ctx.db.get(args.id);

    if (!craft) {
      throw new Error("Craft not found");
    }

    const userId = identity.subject;

    const existingFavorite = await ctx.db
      .query("userFavorites")
      .withIndex("by_user_craft", (q) => 
        q
          .eq("userId", userId)
          .eq("craftId", craft._id)
      )
      .unique();

    if (existingFavorite) {
      throw new Error("Craft already favorited");
    }

    await ctx.db.insert("userFavorites", {
      userId,
      craftId: craft._id,
      orgId: args.orgId,
    });

    return craft;
  },
});


export const unfavorite = mutation({
  args: { id: v.id("crafts") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const craft = await ctx.db.get(args.id);

    if (!craft) {
      throw new Error("Craft not found");
    }

    const userId = identity.subject;

    const existingFavorite = await ctx.db
      .query("userFavorites")
      .withIndex("by_user_craft", (q) => 
        q
          .eq("userId", userId)
          .eq("craftId", craft._id)
      )
      .unique();

    if (!existingFavorite) {
      throw new Error("Favorited craft not found");
    }

    await ctx.db.delete(existingFavorite._id);

    return craft;
  },
});

export const get = query({
  args: { id: v.id("crafts") },
  handler: async (ctx, args) => {
    const craft = ctx.db.get(args.id);

    return craft;
  },
});



