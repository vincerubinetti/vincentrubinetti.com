import { mkdirSync } from "fs";
import { eachQuarterOfInterval } from "date-fns";
import { isEqual, uniqWith } from "lodash-es";
import { login, octokit } from "./";
import { exists, pairs, relative, write } from "./util";

const start = new Date(2008, 0, 1);
const end = new Date();

/** make directory if needed */
mkdirSync(relative("raw"), { recursive: true });

/** get self info */
const user = async () => {
  if (exists("raw", "user")) return;

  console.info("USER");

  const response = await octokit.rest.users.getAuthenticated();

  write(response.data, "raw", "user");
};

/** get self org memberships */
const memberships = async () => {
  if (exists("raw", "memberships")) return;

  console.info("MEMBERSHIPS");

  const result = await octokit.paginate(
    octokit.rest.orgs.listMembershipsForAuthenticatedUser,
  );

  write(result, "raw", "memberships");
};

/** get self owned repos */
const owned = async () => {
  if (exists("raw", "owned")) return;

  console.info("OWNED");

  /** all repos owned by self */
  const response = await octokit.paginate(
    octokit.rest.repos.listForAuthenticatedUser,
    { affiliation: "owner", per_page: 100 },
  );

  write(response, "raw", "owned");
};

/** get self contributions to all github repos */
const contributions = async () => {
  if (exists("raw", "contributions")) return;

  console.info("CONTRIBUTIONS");

  /** contributions per date range */
  const result: { from: string; to: string; data: Contributions }[] = [];

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
          }
        }
      }
    `;

  type Level = {
    repository: { nameWithOwner: string };
    contributions: { totalCount: number };
  };

  type Contributions = {
    user: {
      contributionsCollection: {
        commitContributionsByRepository: Level[];
        issueContributionsByRepository: Level[];
        pullRequestContributionsByRepository: Level[];
        pullRequestReviewContributionsByRepository: Level[];
      };
    };
  };

  /** one time chunk at a time */
  for (const [from, to] of pairs(eachQuarterOfInterval({ start, end }))) {
    console.info(from.toDateString(), "to", to.toDateString());

    /** request options */
    const options = { login, from: from.toISOString(), to: to.toISOString() };

    /** make request */
    const response = await octokit.graphql<Contributions>(query, options);

    result.push({
      from: from.toISOString(),
      to: to.toISOString(),
      data: response,
    });
  }

  /** transform one level of contributions response */
  const mapLevel = (contribution: Level) => {
    const full = contribution.repository.nameWithOwner;
    const [owner = "", repo = ""] = full.split("/");
    return { full, owner, repo, count: contribution.contributions.totalCount };
  };

  /** pre-transform contributions data */
  const transformed = result.map(({ data, ...range }) => {
    const {
      commitContributionsByRepository,
      issueContributionsByRepository,
      pullRequestContributionsByRepository,
      pullRequestReviewContributionsByRepository,
    } = data.user.contributionsCollection;
    return {
      ...range,
      commits: commitContributionsByRepository.map(mapLevel),
      issues: issueContributionsByRepository.map(mapLevel),
      prs: pullRequestContributionsByRepository.map(mapLevel),
      reviews: pullRequestReviewContributionsByRepository.map(mapLevel),
    };
  });

  write(transformed, "raw", "contributions");
};

/** get contributors per repo */
const contributors = async () => {
  if (exists("raw", "contributors")) return;

  console.info("CONTRIBUTORS");

  /** import raw data */
  const contributions = (await import("./raw/contributions.json")).default;

  /** all contribution repos */
  const names = uniqWith(
    contributions.flatMap(({ commits }) =>
      commits.map(({ full, owner, repo }) => ({ full, owner, repo })),
    ),
    isEqual,
  );

  /** contributors per repo */
  const result: Record<
    string,
    Awaited<ReturnType<typeof octokit.rest.repos.listContributors>>["data"]
  > = {};

  for (const { full, owner, repo } of names) {
    console.info(full);

    /** get repo contributors by commit count */
    const response = await octokit.rest.repos.listContributors({
      owner,
      repo,
      per_page: 10,
    });

    if (response.status !== 200) throw Error();

    result[full] = response.data;
  }

  write(result, "raw", "contributors");
};

/** get languages per repo */
const languages = async () => {
  if (exists("raw", "languages")) return;

  console.info("LANGUAGES");

  /** import raw data */
  const contributions = (await import("./raw/contributions.json")).default;

  /** all contribution repos */
  const names = uniqWith(
    contributions.flatMap(({ commits }) =>
      commits.map(({ full, owner, repo }) => ({ full, owner, repo })),
    ),
    isEqual,
  );

  /** languages per repo */
  const result: Record<
    string,
    Awaited<ReturnType<typeof octokit.rest.repos.listLanguages>>["data"]
  > = {};

  for (const { full, owner, repo } of names) {
    console.info(full);

    /** get repo languages */
    const response = await octokit.rest.repos.listLanguages({
      owner,
      repo,
    });

    if (response.status !== 200) throw Error();

    result[full] = response.data;
  }

  write(result, "raw", "languages");
};

await user();
await memberships();
await owned();
await contributions();
await contributors();
await languages();
