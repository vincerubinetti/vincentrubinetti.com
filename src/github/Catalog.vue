<script setup lang="ts">
import { map, max, min, orderBy, startCase } from "lodash-es";
import {
  Bug,
  ExternalLink,
  Eye,
  GitCommit,
  GitPullRequest,
} from "lucide-vue-next";
import Table, { type Cols } from "./components/Table.vue";
import contributions from "./data/contributions.json";

/** fall-off function */
const value = (x: number, w: number, v: number) => (1 - 2 ** (-x / w)) * v;

/** sort repos */
const repos = orderBy(
  Object.entries(contributions).map(([fullName, repo]) => ({
    fullName,
    owner: fullName.includes("/") ? fullName.split("/")[0] : "",
    name: fullName.includes("/") ? fullName.split("/")[1] : "",
    ...repo,
    /** loose importance of repo */
    score:
      value(repo.commits, 50, 5) +
      value(repo.issues, 10, 1) +
      value(repo.prs, 100, 10) +
      value(repo.reviews, 100, 5),
  })),
  (repo) => repo.score,
  "desc",
);

/** normalize scores */
const minScore = min(map(repos, "score"));
const maxScore = max(map(repos, "score"));
for (const repo of Object.values(repos))
  repo.score = ((repo.score - minScore!) / (maxScore! - minScore!)) ** 0.5;

const cols: Cols<typeof repos> = [
  /** https://github.com/tanstack/table/issues/6077 */
  { name: " ", key: "fullName", slot: "link", align: "left", sortable: false },
  { name: "Owner", key: "owner", align: "left" },
  { name: "Name", key: "name", align: "left" },
  { name: "Commits", icon: GitCommit, key: "commits", slot: "commits" },
  { name: "Issues", icon: Bug, key: "issues", slot: "issues" },
  { name: "PRs", icon: GitPullRequest, key: "prs", slot: "prs" },
  { name: "Reviews", icon: Eye, key: "reviews", slot: "reviews" },
];
</script>

<template>
  <section class="bg-light paper">
    <hgroup class="flex flex-col gap-6">
      <h2 class="self-center text-center">GitHub Catalog</h2>

      <div class="text-center text-lg">
        Full listing of my public GitHub contributions
      </div>
    </hgroup>
  </section>

  <section>
    <Table :rows="repos" :cols="cols">
      <template #link="{ row }">
        <a
          v-if="row.fullName.includes('/')"
          :href="`https://github.com/${row.fullName}`"
          class="button -m-2 justify-start p-2"
        >
          Repo
          <ExternalLink />
        </a>
        <b v-else>{{ startCase(row.fullName) }}</b>
      </template>
    </Table>
  </section>
</template>
