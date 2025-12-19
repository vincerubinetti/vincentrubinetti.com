<script setup lang="ts">
import { ref } from "vue";
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

const includeIssues = ref(false);

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

      <div class="grid grid-cols-3 gap-2 max-md:grid-cols-2 max-sm:grid-cols-1">
        <template
          v-for="({ commits, issues, prs, reviews }, name) in repos"
          :key="name"
        >
          <a
            v-if="includeIssues || commits || prs || reviews"
            :href="`https://github.com/${name}/graphs/contributors#:~:text=vincerubinetti`"
            :title="
              toPairs({ commits, issues, prs, reviews })
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ')
            "
            class="truncate"
          >
            {{ name }}
          </a>
        </template>
        <label class="col-start-1 col-end-4 p-2">
          <input type="checkbox" v-model="includeIssues" />
          Include issues
        </label>
      </div>
    </details>
  </section>
</template>
