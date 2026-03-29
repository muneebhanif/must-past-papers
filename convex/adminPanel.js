import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

const sessionDurationMs = 1000 * 60 * 60 * 12;

const getAdminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const requireValidSession = async (ctx, token) => {
  const session = await ctx.db
    .query("adminSessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();

  if (!session || session.expiresAt < Date.now()) {
    throw new ConvexError("Admin session expired. Please sign in again.");
  }

  return session;
};

const enrichPaper = async (ctx, paper) => {
  const uploader = await ctx.db.get(paper.uploadedBy);

  const likes = await ctx.db
    .query("likes")
    .withIndex("by_paperId", (q) => q.eq("paperId", paper._id))
    .collect();

  const comments = await ctx.db
    .query("comments")
    .withIndex("by_paperId_createdAt", (q) => q.eq("paperId", paper._id))
    .collect();

  return {
    ...paper,
    uploader: {
      _id: uploader?._id,
      name: uploader?.username ?? uploader?.name ?? "student",
      image: uploader?.image ?? "",
    },
    stats: {
      likeCount: likes.length,
      commentCount: comments.length,
      likedByMe: false,
    },
  };
};

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const password = args.password;

    const allowedEmails = getAdminEmails();
    const adminPanelPassword = process.env.ADMIN_PANEL_PASSWORD;

    if (!adminPanelPassword) {
      throw new ConvexError("Admin panel password is not configured.");
    }

    if (!allowedEmails.includes(email) || password !== adminPanelPassword) {
      throw new ConvexError("Invalid admin credentials.");
    }

    const token =
      `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}_${Math.random()
        .toString(36)
        .slice(2)}`;
    const now = Date.now();

    const existing = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    }

    await ctx.db.insert("adminSessions", {
      token,
      email,
      expiresAt: now + sessionDurationMs,
      createdAt: now,
    });

    return {
      token,
      expiresAt: now + sessionDurationMs,
    };
  },
});

export const me = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    try {
      const session = await requireValidSession(ctx, args.token);
      return { ok: true, email: session.email, expiresAt: session.expiresAt };
    } catch {
      return { ok: false };
    }
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { ok: true };
  },
});

export const listPending = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireValidSession(ctx, args.token);

    const papers = await ctx.db
      .query("papers")
      .withIndex("by_status_createdAt", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(200);

    return Promise.all(papers.map((paper) => enrichPaper(ctx, paper)));
  },
});

export const setStatus = mutation({
  args: {
    token: v.string(),
    paperId: v.id("papers"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
  },
  handler: async (ctx, args) => {
    await requireValidSession(ctx, args.token);

    const paper = await ctx.db.get(args.paperId);
    if (!paper) {
      throw new ConvexError("Paper not found.");
    }

    await ctx.db.patch(args.paperId, { status: args.status });
    return { ok: true };
  },
});

