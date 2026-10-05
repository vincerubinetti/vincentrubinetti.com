<script setup lang="ts">
import type { Cols } from "@/software/components/Table.vue";
import {
  IconBug,
  IconExternalLink,
  IconEye,
  IconGitCommit,
  IconGitPullRequest,
  IconLaurelWreath1,
} from "@tabler/icons-vue";
import { map, max, min, orderBy, startCase } from "lodash-es";
import Table from "@/software/components/Table.vue";
import _repos from "./data/transform/repos.json";

/** fall-off function */
const value = (x: number, w: number, v: number) => (1 - 2 ** (-x / w)) * v;

/** sort repos */
const repos = orderBy(
  Object.entries(_repos).map(([fullName, repo]) => ({
    fullName,
    owner: fullName.includes("/") ? fullName.split("/")[0] : "",
    name: fullName.includes("/") ? fullName.split("/")[1] : "",
    ...repo,
    /** loose importance of repo */
    score:
      value(repo.commits, 50, 5) +
      value(repo.issues, 10, 1) +
      value(repo.prs, 100, 10) +
      value(repo.reviews, 100, 5) +
      value(1 / repo.rank, 1, 5),
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
  { name: "Commits", icon: IconGitCommit, key: "commits" },
  { name: "Issues", icon: IconBug, key: "issues" },
  { name: "PRs", icon: IconGitPullRequest, key: "prs" },
  { name: "Reviews", icon: IconEye, key: "reviews" },
  { name: "Contributor #", icon: IconLaurelWreath1, key: "rank", slot: "rank" },
];
</script>

<template>
  <section class="[--width:400]">
    <h2 class="sr-only">List</h2>

    <div class="self-center">
      All public GitHub repos I own, maintain, or have contributed to.
    </div>
    <Table :rows="repos" :cols="cols">
      <template #link="{ row }">
        <a
          v-if="row.fullName.includes('/')"
          :href="`https://github.com/${row.fullName}`"
          class="-mx-4 -my-2 button bg-transparent p-2"
        >
          Repo
          <IconExternalLink />
        </a>
        <b v-else>{{ startCase(row.fullName) }}</b>
      </template>
      <template #rank="{ row }">
        {{ row.rank < 99 ? row.rank : "-" }}
      </template>
    </Table>
  </section>
</template>
