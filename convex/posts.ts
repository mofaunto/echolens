import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthenticatedUser } from "./users";

export const generateUploadUrl = mutation(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("No authorization done");
    return await ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
    args: {
        caption: v.optional(v.string()),
        storageId: v.id("_storage"),
    },

    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        const imageUrl = await ctx.storage.getUrl(args.storageId);
        if (!imageUrl) throw new Error("Image not found");

        // if all good, create post
        const postId = await ctx.db.insert("posts", {
            userId: currentUser._id,
            imageUrl,
            storageId: args.storageId,
            caption: args.caption,
            likes: 0,
            comments: 0,
        });

        // incrementing user's posts
        await ctx.db.patch(currentUser._id, {
            posts: currentUser.posts + 1,
        });

        return postId;
    },
});

export const getPosts = query({
    handler: async (ctx) => {
        const currentUser = await getAuthenticatedUser(ctx);

        //  fetch all posts of the currentUser

        const posts = await ctx.db.query("posts").order("desc").collect();
        if (posts.length === 0) return [];

        // get details of the posts, e.g. comments / likes / saves

        const postsDetails = await Promise.all(
            posts.map(async (post) => {
                const postAuthor = (await ctx.db.get(post.userId))!;

                const postLiked = await ctx.db
                    .query("likes")
                    .withIndex("by_user_and_post", (q) =>
                        q.eq("userId", currentUser._id).eq("postId", post._id),
                    )
                    .first();

                const postSaved = await ctx.db
                    .query("saves")
                    .withIndex("by_user_and_post", (q) =>
                        q.eq("userId", currentUser._id).eq("postId", post._id),
                    )
                    .first();

                return {
                    ...post,
                    author: {
                        _id: postAuthor?._id,
                        username: postAuthor?.username,
                        image: postAuthor?.image,
                    },

                    isLiked: !!postLiked,
                    isSaved: !!postSaved,
                };
            }),
        );

        return postsDetails;
    },
});

export const patchPost = mutation({
    args: {
        postId: v.id("posts"),
        caption: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        // Fetch the post to be patch
        const post = await ctx.db.get(args.postId);
        if (!post) throw new Error("Post not found");

        if (post.userId !== currentUser._id)
            throw new Error("You don't have ownership to this post");

        // Update the post with the new caption
        await ctx.db.patch(args.postId, {
            caption: args.caption,
        });

        return await ctx.db.get(args.postId);
    },
});

export const deletePost = mutation({
    args: { postId: v.id("posts") },

    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        const post = await ctx.db.get(args.postId);
        if (!post) throw new Error("Post not found");

        // checking ownership
        if (post.userId !== currentUser._id)
            throw new Error("You don't have ownership to this post");

        // delete likes of the post from db
        const likes = await ctx.db
            .query("likes")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect();

        for (const like of likes) {
            await ctx.db.delete(like._id);
        }

        // delete comments of the post from db
        const comments = await ctx.db
            .query("comments")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect();

        for (const comment of comments) {
            await ctx.db.delete(comment._id);
        }

        // delete saves of the post from db
        const saves = await ctx.db
            .query("saves")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect();

        for (const save of saves) {
            await ctx.db.delete(save._id);
        }

        // delete notifications
        const notifications = await ctx.db
            .query("notifications")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect();

        for (const notification of notifications) {
            await ctx.db.delete(notification._id);
        }

        // delete storage file
        await ctx.storage.delete(post.storageId);

        // finally, delete the post
        await ctx.db.delete(args.postId);

        // decrement current users posts count in db

        await ctx.db.patch(currentUser._id, {
            posts: Math.max(0, (currentUser.posts || 1) - 1),
        });
    },
});

export const toggleLike = mutation({
    args: { postId: v.id("posts") },

    handler: async (ctx, args) => {
        const currentUser = await getAuthenticatedUser(ctx);

        const existingLike = await ctx.db
            .query("likes")
            .withIndex("by_user_and_post", (q) =>
                q.eq("userId", currentUser._id).eq("postId", args.postId),
            )
            .first();

        const post = await ctx.db.get(args.postId);

        if (!post) throw new Error("Post not found");

        if (existingLike) {
            await ctx.db.delete(existingLike._id);
            await ctx.db.patch(args.postId, { likes: post.likes - 1 });
            return false;
        } else {
            await ctx.db.insert("likes", {
                userId: currentUser._id,
                postId: args.postId,
            });
            await ctx.db.patch(args.postId, { likes: post.likes + 1 });

            // liking other users post to send them notification
            if (currentUser._id !== post.userId) {
                await ctx.db.insert("notifications", {
                    receiverId: post.userId,
                    senderId: currentUser._id,
                    type: "like",
                    postId: args.postId,
                });
            }
            return true;
        }
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
