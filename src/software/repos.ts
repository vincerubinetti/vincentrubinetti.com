import { writeFileSync } from "fs";
import { Octokit } from "@octokit/core";
import { throttling } from "@octokit/plugin-throttling";

const login = "vincerubinetti";
const start = 2008;
const end = new Date().getFullYear();
const output = "src/software/repos.json";

const OctokitWithPlugins = Octokit.plugin(throttling);

const octokit = new OctokitWithPlugins({
  auth: process.env.GITHUB_TOKEN,
  throttle: { onRateLimit: () => true, onSecondaryRateLimit: () => true },
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

const getContributionsForYear = async (login: string, year: number) => {
  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;

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

const counts = { commits: 0, issues: 0, prs: 0, reviews: 0, private: 0 };

const contributions: Contributions = { total: { ...counts } };

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

for (let year = start; year < end; year++) {
  const data = await getContributionsForYear(login, year);

  for (const [source, target] of keys) {
    const datum = data[source];
    if (Array.isArray(datum)) {
      for (const repo of datum) {
        const key = repo.repository.nameWithOwner;
        contributions[key] ??= { ...counts };
        contributions[key][target] += repo.contributions.totalCount;
      }
    } else if (typeof datum === "number") contributions.total[target] += datum;
  }
}

writeFileSync(output, JSON.stringify(contributions, null, 2));
