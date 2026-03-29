"use node";

import { randomBytes, createHmac } from "node:crypto";
import { Buffer } from "node:buffer";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

export const getUploadAuth = action({
  args: {},
  handler: async (ctx) => {
    await ctx.runMutation(api.uploadAuthLogs.checkAndLog, {});

    const now = Date.now();

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

    if (!privateKey || !publicKey || !urlEndpoint) {
      throw new Error("ImageKit environment variables are not configured.");
    }

    const token = randomBytes(24).toString("hex");
    const expire = Math.floor(now / 1000) + 10 * 60;

    const signature = createHmac("sha1", privateKey)
      .update(token + expire)
      .digest("hex");

    return {
      token,
      expire,
      signature,
      publicKey,
      urlEndpoint,
      folder: "/past-papers-hub",
    };
  },
});

export const rejectPaperAndCleanup = action({
  args: {
    token: v.string(),
    paperId: v.id("papers"),
    reviewNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const me = await ctx.runQuery(api.adminPanel.me, { token: args.token });
    if (!me?.ok) {
      throw new Error("Admin session expired. Please sign in again.");
    }

    const cleanupData = await ctx.runQuery(api.adminPanel.getPaperCleanupData, {
      token: args.token,
      paperId: args.paperId,
    });

    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (privateKey) {
      const maybeDelete = async (fileId) => {
        if (!fileId) return;
        const auth = Buffer.from(`${privateKey}:`).toString("base64");
        const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Basic ${auth}`,
          },
        });

        if (!response.ok && response.status !== 404) {
          const body = await response.text().catch(() => "");
          throw new Error(`Image cleanup failed (${response.status}): ${body || "Unknown error"}`);
        }
      };

      await maybeDelete(cleanupData.imageFileId);
      await maybeDelete(cleanupData.secondImageFileId);
    }

    await ctx.runMutation(api.adminPanel.setStatus, {
      token: args.token,
      paperId: args.paperId,
      status: "rejected",
      reviewNote: args.reviewNote,
    });

    return { ok: true };
  },
});
