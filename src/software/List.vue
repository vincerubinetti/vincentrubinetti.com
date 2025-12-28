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
import {
  Bug,
  ChevronDown,
  Eye,
  GitCommit,
  GitPullRequest,
} from "lucide-vue-next";
import Dash from "@/components/Dash.vue";
import { formatValue } from "@/util/string";
import contributions from "./contributions.json";
import orgs from "./orgs.json";

/** fall-off function */
const value = (x: number, w: number, v: number) => (1 - 2 ** (-x / w)) * v;

/** sort repos */
const repos = fromPairs(
  orderBy(
    toPairs(
      mapValues(contributions, (repo) => ({
        ...repo,
        /** loose importance of repo */
        score:
          value(repo.commits, 50, 5) +
          value(repo.issues, 10, 1) +
          value(repo.prs, 100, 10) +
          value(repo.reviews, 100, 5),
      })),
    ),
    ([, repo]) => repo.score,
    "desc",
  ),
);

/** normalize scores */
const minScore = min(map(repos, "score"));
const maxScore = max(map(repos, "score"));
for (const repo of Object.values(repos))
  repo.score = ((repo.score - minScore!) / (maxScore! - minScore!)) ** 0.5;
delete repos.total;

/** show extra repo info */
const repoExtras = ref(false);
</script>

<template>
  <details>
    <summary class="highlight corners-4">
      All public GitHub work
      <ChevronDown />
    </summary>

    <div class="flex flex-col gap-4">
      <h3><Dash flip />Orgs<Dash /></h3>
      <div
        class="max-xs:[--cols:1] grid grid-cols-[repeat(var(--cols),auto)] place-content-center place-items-center gap-2 [--cols:5] max-sm:[--cols:3]"
      >
        <a
          v-for="({ name, avatar }, index) in orgs"
          :key="index"
          :href="`https://github.com/${name}`"
          :title="name"
          class="flex size-16 flex-col items-center hover:opacity-50"
        >
          <img :src="avatar" :alt="name" />
        </a>
      </div>
    </div>

    <div class="mt-4 flex flex-col items-center gap-4">
      <h3><Dash flip />Repos<Dash /></h3>
      <label>
        <input type="checkbox" v-model="repoExtras" />
        Extras
      </label>
      <div
        class="grid place-items-center gap-x-4"
        :class="
          repoExtras
            ? 'grid-cols-[1fr_auto_auto_auto_auto]'
            : 'grid-cols-[1fr_auto_auto]'
        "
      >
        <div
          class="col-span-full grid grid-cols-subgrid place-items-center bg-zinc-100 *:p-1"
        >
          <b class="justify-self-start">Repo</b>
          <div title="Commits"><GitCommit /></div>
          <div title="Pull Requests"><GitPullRequest /></div>
          <template v-if="repoExtras">
            <div title="Issues"><Bug /></div>
            <div title="Reviews"><Eye /></div>
          </template>
        </div>
        <template
          v-for="({ commits, issues, prs, reviews }, name) in repos"
          :key="name"
        >
          <div
            v-if="repoExtras || commits || prs || reviews"
            class="col-span-full grid grid-cols-subgrid place-items-center *:p-1 odd:bg-zinc-100"
          >
            <a
              :href="`https://github.com/${name}/graphs/contributors#:~:text=vincerubinetti`"
              class="grow justify-self-start truncate"
            >
              {{ name }}
            </a>
            <span class="text-center">
              {{ formatValue(commits) }}
            </span>
            <span class="text-center">
              {{ formatValue(prs) }}
            </span>
            <template v-if="repoExtras">
              <span class="text-center">
                {{ formatValue(issues) }}
              </span>
              <span class="text-center">
                {{ formatValue(reviews) }}
              </span>
            </template>
          </div>
        </template>
      </div>
    </div>
  </details>
</template>
