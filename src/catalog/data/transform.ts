import { mkdirSync } from "fs";
import { differenceInMonths } from "date-fns";
import { inRange, orderBy, uniq } from "lodash-es";
import { login } from "./";
import contributions from "./raw/contributions.json";
import contributors from "./raw/contributors.json";
import details from "./raw/details.json";
import languages from "./raw/languages.json";
import memberships from "./raw/memberships.json";
import user from "./raw/user.json";
import { relative, write } from "./util";

/** make directory if needed */
mkdirSync(relative("transform"), { recursive: true });

/** totals of all time */
const totals = () => {
  let repos = 0;
  let stars = 0;
  let commits = 0;
  let issues = 0;
  let prs = 0;
  let reviews = 0;

  /** tally stars */
  for (const [full, users] of Object.entries(contributors)) {
    /** get contributor rank */
    const rank = users.findIndex((user) => user.login === login) + 1;
    /** only consider repos where maintainer or top contributor */
    if (!inRange(rank, 1, 4)) continue;
    /** tally repos */
    repos += 1;
    /** tally stars */
    const { stargazers_count = 0 } =
      details[full as keyof typeof details] ?? {};
    stars += stargazers_count;
  }

  /** for each time range */
  for (const contribution of contributions) {
    /** tally commits */
    for (const { count } of contribution.commits) commits += count;
    /** tally issues */
    for (const { count } of contribution.issues) issues += count;
    /** tally prs */
    for (const { count } of contribution.prs) prs += count;
    /** tally pr reviews */
    for (const { count } of contribution.reviews) reviews += count;
  }

  /** misc extras */
  const active = differenceInMonths(new Date(), new Date(user.created_at)) / 12;
  const followers = user.followers;

  const data = {
    repos,
    stars,
    commits,
    issues,
    prs,
    reviews,
    active,
    followers,
  };

  write(data, "transform", "totals");
};

/** all organizations */
const orgs = () => {
  let result: string[] = [];

  /** pure org memberships */
  for (const membership of memberships)
    result.push(membership.organization.login);

  /** orgs by contributions */
  for (const [full, users] of Object.entries(contributors)) {
    /** get contributor rank */
    const rank = users.findIndex((user) => user.login === login) + 1;
    /** only consider repos where top contributor */
    if (!inRange(rank, 1, 11)) continue;
    result.push(full.split("/")[0]);
  }

  result = uniq(result);

  write(result, "transform", "orgs");
};

/** counts per repo */
const repos = () => {
  /** blank counts */
  const counts = { commits: 0, issues: 0, prs: 0, reviews: 0, rank: 999 };

  let result: Record<string, typeof counts> = {};

  /** for each time range */
  for (const { commits, issues, prs, reviews } of contributions) {
    /** tally commits */
    for (const { full, count } of commits) {
      result[full] ??= { ...counts };
      result[full].commits += count;
    }
    /** tally issues */
    for (const { full, count } of issues) {
      result[full] ??= { ...counts };
      result[full].issues += count;
    }
    /** tally prs */
    for (const { full, count } of prs) {
      result[full] ??= { ...counts };
      result[full].prs += count;
    }
    /** tally pr reviews */
    for (const { full, count } of reviews) {
      result[full] ??= { ...counts };
      result[full].reviews += count;
    }
  }

  for (const full of Object.keys(result)) {
    /** get contributor rank */
    const rank =
      (contributors[full as keyof typeof contributors]?.findIndex(
        (user) => user.login === login,
      ) ?? -1) + 1;
    if (!rank) continue;
    result[full].rank = rank;
  }

  /** sort */
  result = Object.fromEntries(
    orderBy(
      Object.entries(result),
      [
        ([, value]) => value.commits,
        ([, value]) => value.issues,
        ([, value]) => value.prs,
        ([, value]) => value.reviews,
      ],
      ["desc", "desc", "desc", "desc"],
    ),
  );

  write(result, "transform", "repos");
};

/** commits over time */
const commits = () => {
  const result: {
    from: string;
    to: string;
    commits: Record<string, number>;
  }[] = [];

  /** for each time range */
  for (const { from, to, commits } of contributions) {
    const entry: (typeof result)[number] = { from, to, commits: { total: 0 } };

    /** tally commits */
    for (const { full, count } of commits) {
      entry.commits[full] = count;
      entry.commits.total += count;
    }

    result.push({ ...entry });
  }

  write(result, "transform", "commits");
};

/** rank per repo */
const rank = () => {
  let result: Record<string, number> = {};

  for (const [full, users] of Object.entries(contributors)) {
    /** get contributor rank */
    const rank = users.findIndex((user) => user.login === login) + 1;
    if (!rank) continue;
    result[full] = rank;
  }

  /** sort */
  result = Object.fromEntries(
    orderBy(Object.entries(result), ([, value]) => value, "asc"),
  );

  write(result, "transform", "rank");
};

/** language fluency per maintained repo */
const fluency = () => {
  let result: Record<string, number> = {};

  for (const [full, breakdown] of Object.entries(languages)) {
    /** get contributor rank */
    const rank =
      (contributors[full as keyof typeof contributors]?.findIndex(
        (user) => user.login === login,
      ) ?? -1) + 1;
    /** only consider repos where top contributor */
    if (!inRange(rank, 1, 11)) continue;
    /** tally languages */
    for (const [language, bytes] of Object.entries(breakdown))
      result[language] = (result[language] || 0) + bytes;
  }

  /** sort */
  result = Object.fromEntries(
    orderBy(Object.entries(result), ([, value]) => value, "desc"),
  );

  write(result, "transform", "fluency");
};

totals();
orgs();
repos();
commits();
rank();
fluency();
