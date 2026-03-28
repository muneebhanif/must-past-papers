"use node";

import { randomBytes, createHmac } from "node:crypto";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

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
