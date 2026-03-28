import { mutation } from "./_generated/server";
import { requireUser } from "./lib";

export const checkAndLog = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);

    const now = Date.now();
    const tenMinutesAgo = now - 10 * 60 * 1000;
    const recentAuthRequests = await ctx.db
      .query("uploadAuthLogs")
      .withIndex("by_userId_createdAt", (q) =>
        q.eq("userId", user._id).gte("createdAt", tenMinutesAgo),
      )
      .collect();

    if (recentAuthRequests.length >= 10) {
      throw new Error("Rate limit exceeded. Please wait before requesting another upload.");
    }

    await ctx.db.insert("uploadAuthLogs", {
      userId: user._id,
      createdAt: now,
    });

    return { userId: user._id };
  },
});
