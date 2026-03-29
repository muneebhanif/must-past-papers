import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib";

export const listByPaper = query({
  args: { paperId: v.id("papers") },
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_paperId_createdAt", (q) => q.eq("paperId", args.paperId))
      .order("desc")
      .take(50);

    return Promise.all(
      comments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        return {
          ...comment,
          user: {
            _id: user?._id,
            name: user?.username ?? user?.name ?? "student",
            image: user?.image ?? "",
          },
        };
      }),
    );
  },
});

export const create = mutation({
  args: {
    paperId: v.id("papers"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const paper = await ctx.db.get(args.paperId);
    if (!paper) {
      throw new Error("Paper not found.");
    }

    const cleanContent = args.content.trim();
    if (cleanContent.length < 2 || cleanContent.length > 500) {
      throw new Error("Comment must be between 2 and 500 characters.");
    }

    const commentId = await ctx.db.insert("comments", {
      paperId: args.paperId,
      userId: user._id,
      content: cleanContent,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.paperId, {
      commentCount: (paper.commentCount ?? 0) + 1,
    });

    if (paper.uploadedBy !== user._id) {
      await ctx.db.insert("notifications", {
        userId: paper.uploadedBy,
        actorId: user._id,
        paperId: paper._id,
        type: "comment",
        content: cleanContent.slice(0, 140),
        read: false,
        createdAt: Date.now(),
      });
    }

    return commentId;
  },
});
