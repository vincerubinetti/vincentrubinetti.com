import { throttling } from "@octokit/plugin-throttling";
import { Octokit } from "octokit";

export const login = "vincerubinetti";

/** github api client */
export const octokit = new (Octokit.plugin(throttling))({
  auth: process.env.GITHUB_TOKEN,
  throttle: {
    onRateLimit: (retryAfter, { method, url }) => {
      console.info(`Rate limit, retrying ${method} ${url} in ${retryAfter}s`);
      return true;
    },
    onSecondaryRateLimit: (retryAfter, { method, url }) => {
      console.info(
        `Secondary rate limit, retrying ${method} ${url} in ${retryAfter}s`,
      );
      return true;
    },
  },
});
