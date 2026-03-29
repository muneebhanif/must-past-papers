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

const sanitizeUsername = (value) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);

const ensureUniqueUsername = async (ctx, username, ignoreUserId) => {
  const existing = await ctx.db
    .query("users")
    .withIndex("username", (q) => q.eq("username", username))
    .first();

  if (existing && existing._id !== ignoreUserId) {
    throw new ConvexError("Username is already taken.");
  }
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
    reviewNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await requireValidSession(ctx, args.token);

    const paper = await ctx.db.get(args.paperId);
    if (!paper) {
      throw new ConvexError("Paper not found.");
    }

    const note = (args.reviewNote ?? "").trim().slice(0, 500);

    if (args.status === "rejected" && !note) {
      throw new ConvexError("Please add a rejection note.");
    }

    await ctx.db.patch(args.paperId, {
      status: args.status,
      reviewNote: args.status === "rejected" ? note : undefined,
      reviewedAt: Date.now(),
      reviewedBy: session.email,
    });

    return { ok: true };
  },
});

export const listUsers = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireValidSession(ctx, args.token);

    const users = await ctx.db.query("users").order("desc").take(500);
    return Promise.all(
      users.map(async (user) => {
        const uploads = await ctx.db
          .query("papers")
          .withIndex("by_uploadedBy_createdAt", (q) => q.eq("uploadedBy", user._id))
          .collect();

        return {
          ...user,
          uploadCount: uploads.length,
        };
      }),
    );
  },
});

export const createUser = mutation({
  args: {
    token: v.string(),
    username: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireValidSession(ctx, args.token);

    const username = sanitizeUsername(args.username);
    if (username.length < 3) {
      throw new ConvexError("Username must be at least 3 characters.");
    }

    await ensureUniqueUsername(ctx, username);

    const email = args.email?.trim().toLowerCase();
    if (email && !email.includes("@")) {
      throw new ConvexError("Invalid email.");
    }

    const image = args.image?.trim();
    if (image && !/^https?:\/\//i.test(image)) {
      throw new ConvexError("Image URL must start with http or https.");
    }

    const userId = await ctx.db.insert("users", {
      username,
      name: args.name?.trim() || undefined,
      email,
      image: image || undefined,
      isAdmin: false,
      isAnonymous: false,
    });

    return ctx.db.get(userId);
  },
});

export const updateUser = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
    username: v.string(),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireValidSession(ctx, args.token);

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new ConvexError("User not found.");
    }

    const username = sanitizeUsername(args.username);
    if (username.length < 3) {
      throw new ConvexError("Username must be at least 3 characters.");
    }

    await ensureUniqueUsername(ctx, username, args.userId);

    const email = args.email?.trim().toLowerCase();
    if (email && !email.includes("@")) {
      throw new ConvexError("Invalid email.");
    }

    const image = args.image?.trim();
    if (image && !/^https?:\/\//i.test(image)) {
      throw new ConvexError("Image URL must start with http or https.");
    }

    await ctx.db.patch(args.userId, {
      username,
      name: args.name?.trim() || undefined,
      email,
      image: image || undefined,
    });

    return ctx.db.get(args.userId);
  },
});

export const deleteUser = mutation({
  args: {
    token: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const session = await requireValidSession(ctx, args.token);
    const target = await ctx.db.get(args.userId);

    if (!target) {
      throw new ConvexError("User not found.");
    }

    const adminEmails = getAdminEmails();
    if (target.email && adminEmails.includes(target.email.toLowerCase())) {
      throw new ConvexError("Cannot delete an admin allowlisted user.");
    }

    if (target.email && target.email.toLowerCase() === session.email) {
      throw new ConvexError("You cannot delete your own admin-linked account.");
    }

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", args.userId))
      .collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
    }

    const likes = await ctx.db
      .query("likes")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", args.userId))
      .collect();
    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    const papers = await ctx.db
      .query("papers")
      .withIndex("by_uploadedBy_createdAt", (q) => q.eq("uploadedBy", args.userId))
      .collect();
    for (const paper of papers) {
      await ctx.db.delete(paper._id);
    }

    const authLogs = await ctx.db
      .query("uploadAuthLogs")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", args.userId))
      .collect();
    for (const log of authLogs) {
      await ctx.db.delete(log._id);
    }

    await ctx.db.delete(args.userId);
    return { ok: true };
  },
});

