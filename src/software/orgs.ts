import { writeFileSync } from "fs";
import { Octokit } from "octokit";

/** params */
const output = "src/software/orgs.json";

/** github api client */
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

/** get orgs that user is member of */
const getOrgs = async () =>
  (
    await octokit.paginate(
      octokit.rest.orgs.listMembershipsForAuthenticatedUser,
    )
  ).map((org) => ({
    name: org.organization.login,
    avatar: org.organization.avatar_url,
    state: org.state,
    role: org.role,
  }));

const orgs = await getOrgs();

/** save */
writeFileSync(output, JSON.stringify(orgs, null, 2));
