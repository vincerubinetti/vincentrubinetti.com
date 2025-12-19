import { writeFileSync } from "fs";
import { throttling } from "@octokit/plugin-throttling";
import { Octokit } from "octokit";

/** params */
const login = "vincerubinetti";
const start = 2008;
const end = new Date().getFullYear();
const output = "src/software/contributions.json";

/** github api client */
const octokit = new (Octokit.plugin(throttling))({
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

type Response = {
  user: { contributionsCollection: ContributionsCollection };
};

type ContributionsCollection = {
  commitContributionsByRepository: ContributionsByRepository[];
  issueContributionsByRepository: ContributionsByRepository[];
  pullRequestContributionsByRepository: ContributionsByRepository[];
  pullRequestReviewContributionsByRepository: ContributionsByRepository[];
  totalCommitContributions: number;
  totalIssueContributions: number;
  totalPullRequestContributions: number;
  totalPullRequestReviewContributions: number;
  restrictedContributionsCount: number;
};

type ContributionsByRepository = {
  repository: { nameWithOwner: string };
  contributions: { totalCount: number };
};

/** get counts of different contributions for user in year */
const getContributions = async (login: string, year: number) => {
  /** date range */
  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;

  /** graph ql query */
  /** https://github.com/orgs/community/discussions/24350 */
  const query = `
    query($login: String!, $from: DateTime!, $to: DateTime!) {
      user(login: $login) {
        contributionsCollection(from: $from, to: $to) {
          commitContributionsByRepository(maxRepositories: 100) {
            repository {
              nameWithOwner
            }
            contributions {
              totalCount
            }
          }
          issueContributionsByRepository(maxRepositories: 100) {
            repository {
              nameWithOwner
            }
            contributions {
              totalCount
            }
          }
          pullRequestContributionsByRepository(maxRepositories: 100) {
            repository {
              nameWithOwner
            }
            contributions {
              totalCount
            }
          }
          pullRequestReviewContributionsByRepository(maxRepositories: 100) {
            repository {
              nameWithOwner
            }
            contributions {
              totalCount
            }
          }
          totalCommitContributions
          totalIssueContributions
          totalPullRequestContributions
          totalPullRequestReviewContributions
          restrictedContributionsCount
        }
      }
    }
  `;

  /** make request */
  const response = await octokit.graphql<Response>(query, { login, from, to });
  return response.user.contributionsCollection;
};

type ContributionCounts = {
  commits: number;
  issues: number;
  prs: number;
  reviews: number;
  private: number;
};

type Contributions = {
  [key: string]: ContributionCounts;
  total: ContributionCounts;
};

/** blank counts */
const counts = { commits: 0, issues: 0, prs: 0, reviews: 0, private: 0 };

/** total/collected contribution data */
const contributions: Contributions = { total: { ...counts } };

/** keys mapping raw contribution data to totaled/collected data */
const keys: [keyof ContributionsCollection, keyof ContributionCounts][] = [
  ["commitContributionsByRepository", "commits"],
  ["issueContributionsByRepository", "issues"],
  ["pullRequestContributionsByRepository", "prs"],
  ["pullRequestReviewContributionsByRepository", "reviews"],
  ["totalCommitContributions", "commits"],
  ["totalIssueContributions", "issues"],
  ["totalPullRequestContributions", "prs"],
  ["totalPullRequestReviewContributions", "reviews"],
  ["restrictedContributionsCount", "private"],
];

/** one year at a time */
for (let year = start; year < end; year++) {
  console.info(year);
  const data = await getContributions(login, year);

  /** add this year's data to totals */
  for (const [source, target] of keys) {
    const datum = data[source];
    /** by-repo counts */
    if (Array.isArray(datum)) {
      for (const repo of datum) {
        const key = repo.repository.nameWithOwner;
        contributions[key] ??= { ...counts };
        contributions[key][target] += repo.contributions.totalCount;
      }
    } else if (typeof datum === "number")
      /** total counts */
      contributions.total[target] += datum;
  }
}

/** save */
writeFileSync(output, JSON.stringify(contributions, null, 2));
