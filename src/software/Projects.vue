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
import Carousel from "@/components/Carousel.vue";
import contributions from "./contributions.json";
import orgs from "./orgs.json";

/** import images */
const imports = toPairs(
  import.meta.glob<{ default: string }>("./projects/*.png", {
    eager: true,
    query: "url&w=800&format=jpeg",
  }),
);

/** group images by name */
const images: Record<string, string[]> = {};

for (const [path, { default: _default }] of imports) {
  const name = path.match(/.*\/(.*)-\d+\.png/)?.[1];
  if (!name) continue;
  images[name] ??= [];
  images[name].push(_default);
}

/** projects data */
const projects = [
  {
    name: "Manubot",
    points: [
      "lorem ipsum dolor sit amet",
      "consectetur adipiscing elit",
      "sed do eiusmod",
    ],
    tags: ["vanilla", "logo", "branding", "docs"],
  },
];

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
  <section>
    <h2>Projects</h2>

    <div class="grid grid-cols-3 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
      <!-- project card -->
      <div
        v-for="({ name, points, tags }, index) in projects"
        :key="index"
        class="corners-2 bg-light paper flex flex-col gap-2 p-4"
      >
        <Carousel
          :slides="
            (images[name.toLowerCase()] ?? []).map((image) => ({ image }))
          "
        />

        <h3>{{ name }}</h3>
        <ul>
          <li v-for="(point, index) in points" :key="index">{{ point }}</li>
        </ul>
        <div class="flex flex-wrap justify-center gap-2">
          <button
            v-for="(tag, index) in tags"
            :key="index"
            class="bg-mid p-2 hover:bg-gray-200"
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </div>

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
