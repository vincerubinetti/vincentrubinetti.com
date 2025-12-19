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
import contributions from "./contributions.json";
import orgs from "./orgs.json";

/** fall-off function */
const value = (x: number, w: number, v: number) => (1 - 2 ** (-x / w)) * v;

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

delete repos.total;

const repoExtras = ref(false);

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
        All public GitHub work
        <ChevronDown />
      </summary>

      <h3>Orgs</h3>
      <div
        class="max-xs:[--cols:1] grid w-full grid-cols-[repeat(var(--cols),auto)] place-content-center place-items-center gap-2 [--cols:5] max-sm:[--cols:3]"
      >
        <a
          v-for="({ name, avatar }, index) in orgs"
          :key="index"
          :href="`https://github.com/${name}`"
          :title="name"
          class="flex size-16 flex-col items-center border-2 border-transparent hover:border-black"
        >
          <img :src="avatar" :alt="name" />
        </a>
      </div>

      <h3>Repos</h3>
      <label>
        <input type="checkbox" v-model="repoExtras" />
        Extras
      </label>

      <div
        class="grid place-items-center gap-x-4 gap-y-2"
        :class="
          repoExtras
            ? 'grid-cols-[1fr_auto_auto_auto_auto]'
            : 'grid-cols-[1fr_auto_auto]'
        "
      >
        <b class="justify-self-start">Repo</b>
        <div title="Commits"><GitCommit /></div>
        <div title="Pull Requests"><GitPullRequest /></div>
        <template v-if="repoExtras">
          <div title="Issues"><Bug /></div>
          <div title="Reviews"><Eye /></div>
        </template>
        <template
          v-for="({ commits, issues, prs, reviews }, name) in repos"
          :key="name"
        >
          <template v-if="repoExtras || commits || prs || reviews">
            <a
              :href="`https://github.com/${name}/graphs/contributors#:~:text=vincerubinetti`"
              class="grow justify-self-start truncate"
            >
              {{ name }}
            </a>
            <span class="text-center">
              {{ commits }}
            </span>
            <span class="text-center">
              {{ prs }}
            </span>
            <template v-if="repoExtras">
              <span class="text-center">
                {{ issues }}
              </span>
              <span class="text-center">
                {{ reviews }}
              </span>
            </template>
          </template>
        </template>
      </div>
    </details>
  </section>
</template>
