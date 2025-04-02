import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const toggleSave = mutation({
    args: { postId: v.id("posts") },

    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        const existingSave = await ctx.db
            .query("saves")
            .withIndex("by_user_and_post", (q) =>
                q.eq("userId", currentUser._id).eq("postId", args.postId),
            )
            .first();

        if (existingSave) {
            await ctx.db.delete(existingSave._id);
            return false;
        } else {
            await ctx.db.insert("saves", {
                userId: currentUser._id,
                postId: args.postId,
            });
            return true;
        }
    },
});

export const getSaves = query({
    // get saves of the current user
    handler: async (ctx) => {
        const currentUser = await getAuthenticatedUser(ctx);

        const saves = await ctx.db
            .query("saves")
            .withIndex("by_user", (q) => q.eq("userId", currentUser._id))
            .order("desc")
            .collect();

        const savesInfo = await Promise.all(
            saves.map(async (save) => {
                const post = await ctx.db.get(save.postId);

                return post;
            }),
        );

        return savesInfo;
    },
});
