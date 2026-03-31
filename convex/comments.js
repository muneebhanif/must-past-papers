import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib";

const COMMENT_MIN_INTERVAL_MS = 8 * 1000;
const COMMENT_WINDOW_MS = 5 * 60 * 1000;
const MAX_COMMENTS_PER_WINDOW = 8;
const SAME_PAPER_WINDOW_MS = 2 * 60 * 1000;
const MAX_COMMENTS_PER_SAME_PAPER_WINDOW = 3;

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
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    const paper = await ctx.db.get(args.paperId);
    if (!paper) {
      throw new ConvexError("Paper not found.");
    }

    if (args.parentId) {
      const parent = await ctx.db.get(args.parentId);
      if (!parent || parent.paperId !== args.paperId) {
        throw new ConvexError("Parent comment not found.");
      }
    }

    const cleanContent = args.content.trim();
    if (cleanContent.length < 2 || cleanContent.length > 500) {
      throw new ConvexError("Comment must be between 2 and 500 characters.");
    }

    const lastComment = await ctx.db
      .query("comments")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", user._id))
      .order("desc")
      .first();

    if (lastComment && now - lastComment.createdAt < COMMENT_MIN_INTERVAL_MS) {
      throw new ConvexError("You're commenting too fast. Please wait a few seconds.");
    }

    const recentComments = await ctx.db
      .query("comments")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", user._id).gte("createdAt", now - COMMENT_WINDOW_MS),
      )
      .collect();

    if (recentComments.length >= MAX_COMMENTS_PER_WINDOW) {
      throw new ConvexError("Rate limit exceeded: max 8 comments per 5 minutes.");
    }

    const recentSamePaperCount = recentComments.filter(
      (comment) => comment.paperId === args.paperId && now - comment.createdAt <= SAME_PAPER_WINDOW_MS,
    ).length;

    if (recentSamePaperCount >= MAX_COMMENTS_PER_SAME_PAPER_WINDOW) {
      throw new ConvexError("Too many comments on this paper. Please wait 2 minutes.");
    }

    const duplicateRecent = recentComments.some(
      (comment) => comment.paperId === args.paperId && comment.content.trim() === cleanContent,
    );

    if (duplicateRecent) {
      throw new ConvexError("Duplicate comment detected. Please write a new comment.");
    }

    const commentId = await ctx.db.insert("comments", {
      paperId: args.paperId,
      userId: user._id,
      content: cleanContent,
      createdAt: now,
      ...(args.parentId ? { parentId: args.parentId } : {}),
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
        createdAt: now,
      });
    }

    return commentId;
  },
});

export const update = mutation({
  args: {
    commentId: v.id("comments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const comment = await ctx.db.get(args.commentId);

    if (!comment) {
      throw new ConvexError("Comment not found.");
    }

    if (comment.userId !== user._id) {
      throw new ConvexError("You can only edit your own comments.");
    }

    const cleanContent = args.content.trim();
    if (cleanContent.length < 2 || cleanContent.length > 500) {
      throw new ConvexError("Comment must be between 2 and 500 characters.");
    }

    if (cleanContent === comment.content) {
      return { ok: true };
    }

    await ctx.db.patch(args.commentId, {
      content: cleanContent,
      editedAt: Date.now(),
    });

    return { ok: true };
  },
});

export const remove = mutation({
  args: {
    commentId: v.id("comments"),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const comment = await ctx.db.get(args.commentId);

    if (!comment) {
      throw new ConvexError("Comment not found.");
    }

    if (comment.userId !== user._id) {
      throw new ConvexError("You can only delete your own comments.");
    }

    const replies = await ctx.db
      .query("comments")
      .withIndex("by_paperId_parentId_createdAt", (q) =>
        q.eq("paperId", comment.paperId).eq("parentId", comment._id),
      )
      .collect();
    for (const reply of replies) {
      await ctx.db.patch(reply._id, { parentId: undefined });
    }

    const paper = await ctx.db.get(comment.paperId);
    if (paper) {
      await ctx.db.patch(paper._id, {
        commentCount: Math.max((paper.commentCount ?? 0) - 1, 0),
      });
    }

    await ctx.db.delete(args.commentId);
    return { ok: true };
  },
});
