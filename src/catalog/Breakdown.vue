<script setup lang="ts">
import {
  IconBug,
  IconEye,
  IconGitBranch,
  IconGitCommit,
  IconHourglass,
  IconStar,
  IconUser,
} from "@tabler/icons-vue";
import { formatValue } from "@/util/string";
import commits from "./data/transform/commits.json";
import fluency from "./data/transform/fluency.json";
import orgs from "./data/transform/orgs.json";
import rank from "./data/transform/rank.json";
import totals from "./data/transform/totals.json";

const tiles = [
  {
    icon: IconStar,
    title: formatValue(totals.repos),
    description: "Repos *",
  },
  {
    icon: IconStar,
    title: formatValue(totals.stars),
    description: "Repo stars *",
  },
  {
    icon: IconUser,
    title: formatValue(orgs.length),
    description: "Organizations *",
  },
  {
    icon: IconHourglass,
    title: formatValue(totals.active),
    description: "Years active",
  },

  {
    icon: IconGitCommit,
    title: formatValue(totals.commits),
    description: "Commits made",
  },
  {
    icon: IconBug,
    title: formatValue(totals.issues),
    description: "Issue contributions",
  },
  {
    icon: IconGitBranch,
    title: formatValue(totals.prs),
    description: "Pull requests",
  },
  {
    icon: IconEye,
    title: formatValue(totals.reviews),
    description: "PR reviews",
  },
];

/** only consider these languages */
const languages = [
  "HTML",
  "CSS",
  "JavaScript",
  "TypeScript",
  "MDX",
  "Vue",
  "Astro",
  "SCSS",
];

const fluentLanguages = Object.entries(fluency).filter(([language]) =>
  languages.includes(language),
);
</script>

<template>
  <section>
    <h2 class="sr-only">Overview</h2>

    <div class="grid grid-cols-4 gap-8 max-md:grid-cols-2 max-sm:grid-cols-1">
      <div
        v-for="(tile, index) in tiles"
        :key="index"
        class="relative flex flex-col gap-2 rounded-md bg-dark/5 p-4"
      >
        <component
          :is="tile.icon"
          class="absolute top-0 right-0 size-10 rounded-md bg-dark/10 p-2 text-dark"
        />
        <b class="text-xl">
          {{ tile.title }}
        </b>
        <div>{{ tile.description }}</div>
      </div>
    </div>

    <p class="self-center">
      * Only counting repos where I am maintainer or top contributor, to avoid
      over-inflation.
    </p>
  </section>

  <section class="bg-pale [--width:300]">
    <h2 class="sr-only">Languages</h2>

    <div class="flex gap-8 max-md:flex-col">
      <p class="flex-1 self-center text-center">
        <b class="text-xl">Lines of code written</b><br />Estimated by
        <code>bytes / 40</code>
      </p>
      <div
        class="grid flex-2 grid-cols-4 gap-8 max-lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-1"
      >
        <div
          v-for="([language, bytes], index) in fluentLanguages"
          :key="index"
          class="relative isolate flex flex-col gap-2 p-4"
        >
          <div
            class="absolute inset-0 -z-10 rounded-md bg-mid"
            :style="{ opacity: 0.35 - 0.25 * (index / languages.length) }"
          />
          <b class="text-xl">
            {{ formatValue(bytes / 40) }}
          </b>
          <div>{{ language }}</div>
        </div>
      </div>
    </div>
  </section>
</template>
