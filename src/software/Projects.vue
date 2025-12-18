<script setup lang="ts">
import {
  fromPairs,
  map,
  mapValues,
  max,
  min,
  orderBy,
  toPairs,
} from "lodash-es";
import { ChevronDown } from "lucide-vue-next";
import contributions from "./contributions.json";

/** how much to value commits vs prs vs etc when calculating score */
const commitWeight = 1 / 10;
const issueWeight = 1 / 20;
const prWeight = 1 / 5;
const reviewWeight = 1 / 10;

const repos = fromPairs(
  orderBy(
    toPairs(
      mapValues(contributions, (repo) => ({
        ...repo,
        /** loose importance of repo */
        score:
          repo.commits * commitWeight +
          repo.issues * issueWeight +
          repo.prs * prWeight +
          repo.reviews * reviewWeight,
      })),
    ),
    ([, repo]) => repo.score,
    "desc",
  ),
);

delete repos.total;

/** normalize scores */
const minScore = min(map(repos, "score"));
const maxScore = max(map(repos, "score"));
for (const repo of Object.values(repos))
  repo.score = ((repo.score - minScore!) / (maxScore! - minScore!)) ** 0.5;
</script>

<template>
  <section>
    <h2>Projects</h2>

    <details>
      <summary class="highlight corners-4">
        All GitHub contributions
        <ChevronDown />
      </summary>

      <div class="grid grid-cols-3">
        <a
          v-for="({ commits, issues, prs, reviews }, name) in repos"
          :key="name"
          :href="`https://github.com/${name}/graphs/contributors#:~:text=vincerubinetti`"
          :title="
            toPairs({ commits, issues, prs, reviews })
              .map(([k, v]) => `${k}: ${v}`)
              .join(', ')
          "
          class="truncate px-1 py-2"
        >
          {{ name }}
        </a>
      </div>
    </details>
  </section>
</template>
