import { mkdirSync } from "fs";
import { differenceInMonths } from "date-fns";
import { inRange, orderBy, sumBy, uniq } from "lodash-es";
import { login } from "@/catalog/data/stats";
import contributions from "./raw/contributions.json";
import contributors from "./raw/contributors.json";
import languages from "./raw/languages.json";
import memberships from "./raw/memberships.json";
import owned from "./raw/owned.json";
import user from "./raw/user.json";
import { relative, write } from "./util";

/** make directory if needed */
mkdirSync(relative("transform"), { recursive: true });

/** all organizations */
const orgs = () => {
  let result: string[] = [];

  /** pure org memberships */
  for (const membership of memberships)
    result.push(membership.organization.login);

  /** orgs by contributions */
  for (const [full, users] of Object.entries(contributors))
    if (users.find((user) => user.login === login)) result.push(full);

  result = uniq(result);

  write(result, "transform", "orgs");
};

/** counts per repo */
const repos = () => {
  /** blank counts */
  const counts = { commits: 0, issues: 0, prs: 0, reviews: 0 };

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

/** rank per repo */
const rank = () => {
  let result: Record<string, number> = {};

  for (const [full, users] of Object.entries(contributors)) {
    const index = users.findIndex((user) => user.login === login) + 1;
    if (index) result[full] = index;
  }

  /** sort */
  result = Object.fromEntries(
    orderBy(Object.entries(result), ([, value]) => value, "asc"),
  );

  write(result, "transform", "rank");
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

/** totals of all time */
const totals = () => {
  let commits = 0;
  let issues = 0;
  let prs = 0;
  let reviews = 0;

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

  /** other counts */
  const stars = sumBy(owned, (repo) => repo.stargazers_count);
  const followers = user.followers;
  const active = differenceInMonths(new Date(), new Date(user.created_at)) / 12;

  const data = {
    repos: owned.length,
    stars,
    commits,
    issues,
    prs,
    reviews,
    followers,
    active,
  };

  write(data, "transform", "totals");
};

/** language fluency per maintained repo */
const fluency = () => {
  let result: Record<string, number> = {};

  for (const [full, breakdown] of Object.entries(languages)) {
    const rank = contributors[full as keyof typeof contributors]?.findIndex(
      (user) => user.login === login,
    );
    if (!inRange(rank, 0, 1)) continue;
    for (const [language, bytes] of Object.entries(breakdown))
      result[language] = (result[language] || 0) + bytes;
  }

  /** sort */
  result = Object.fromEntries(
    orderBy(Object.entries(result), ([, value]) => value, "desc"),
  );

  write(result, "transform", "fluency");
};

orgs();
repos();
rank();
totals();
commits();
fluency();
