import { Id } from "./_generated/dataModel";
import { mutation, MutationCtx, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";

// Create a new task with the given text
export const createUser = mutation({
    args: {
        username: v.string(),
        name: v.string(),
        image: v.string(),
        bio: v.optional(v.string()),
        email: v.string(),
        clerkId: v.string(),
    },

    handler: async (ctx, args) => {
        // check for existing user
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (existingUser) return;

        //post user
        await ctx.db.insert("users", {
            username: args.username,
            name: args.name,
            email: args.email,
            bio: args.bio,
            image: args.image,
            followers: 0,
            following: 0,
            posts: 0,
            clerkId: args.clerkId,
        });
    },
});

export const getUserByClerkId = query({
    args: { clerkId: v.string() },

    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        return user;
    },
});

export const updateUser = mutation({
    args: {
        name: v.string(),
        bio: v.optional(v.string()),
    },

    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        //post user
        await ctx.db.patch(currentUser._id, {
            name: args.name,
            bio: args.bio,
        });
    },
});

export const getUserProfile = query({
    args: {
        id: v.id("users"),
    },

    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.id);
        if (!user) throw new Error("User not found");

        return user;
    },
});

export const getPostsByUser = query({
    args: {
        userId: v.optional(v.id("users")),
    },

    handler: async (ctx, args) => {
        const user = args.userId
            ? await ctx.db.get(args.userId)
            : await getAuthenticatedUser(ctx);

        if (!user) throw new Error("User not found");

        const posts = await ctx.db
            .query("posts")
            .withIndex("by_user", (q) =>
                q.eq("userId", args.userId || user._id),
            )
            .collect();

        return posts;
    },
});

export const isFollowing = query({
    args: {
        followingId: v.id("users"),
    },

    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        const follow = await ctx.db
            .query("follows")
            .withIndex("by_both", (q) =>
                q
                    .eq("followerId", currentUser._id)
                    .eq("followingId", args.followingId),
            )
            .first();

        return !!follow;
    },
});

export const toggleFollow = mutation({
    args: {
        followingId: v.id("users"),
    },

    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        const existingFollow = await ctx.db
            .query("follows")
            .withIndex("by_both", (q) =>
                q
                    .eq("followerId", currentUser._id)
                    .eq("followingId", args.followingId),
            )
            .first();

        if (existingFollow) {
            await ctx.db.delete(existingFollow._id);
            await updateFollowCounts(
                ctx,
                currentUser._id,
                args.followingId,
                false,
            );
        } else {
            await ctx.db.insert("follows", {
                followerId: currentUser._id,
                followingId: args.followingId,
            });
            await updateFollowCounts(
                ctx,
                currentUser._id,
                args.followingId,
                true,
            );

            await ctx.db.insert("notifications", {
                receiverId: args.followingId,
                senderId: currentUser._id,
                type: "follow",
            });
        }
    },
});

export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No authorization done");

    const currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
        .first();

    if (!currentUser) throw new Error("User not found"); //otherwise TS thinks it is null

    return currentUser;
}

async function updateFollowCounts(
    ctx: MutationCtx,
    followerId: Id<"users">,
    followingId: Id<"users">,
    isFollow: boolean,
) {
    const follower = await ctx.db.get(followerId);
    const following = await ctx.db.get(followingId);

    if (follower && following) {
        await ctx.db.patch(followerId, {
            following: follower.following + (isFollow ? 1 : -1),
        });
        await ctx.db.patch(followingId, {
            followers: following.followers + (isFollow ? 1 : -1),
        });
    }
}
