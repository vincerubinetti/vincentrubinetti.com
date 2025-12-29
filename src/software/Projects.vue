<script setup lang="ts">
import { orderBy, random, startCase, toPairs } from "lodash-es";
import { ExternalLink, Globe } from "lucide-vue-next";
import GitHub from "@/assets/logos/github.svg?component";
import Carousel from "@/components/Carousel.vue";
import Dash from "@/components/Dash.vue";
import List from "@/software/List.vue";
import { renderMarkdown } from "@/util/string";
import projects from "./projects.json";

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

/** get link icon */
const getIcon = (key: string) => {
  if (key.match(/site/i)) return Globe;
  if (key.match(/repo/i)) return GitHub;
  return ExternalLink;
};

/** project order */
const order = [
  "Lab Website Template",
  "SVG to PNG",
  "Human Microbiome Compendium",
  "Exploring Cancer in Colorado",
  "NIH Reporting",
  "3Blue1Brown.com",
  "3Blue1Brown Dubbing",
  "3Blue1Brown Captions",
  "Simplex",
  "GenePlexus",
  "Manubot",
  "Adage",
  "Connectivity Search",
  "Het.io",
  "mygeneset.info",
  "Misc. Logos",
  "Word Spot",
  "STRchive",
  "Word Lapse",
  "Preprint Similarity Search",
  "Set",
  "Word4Word",
  "Wall of Software",
  "DBMI Screensaver",
  "MIDI Humanizer",
  "Using the Music of 3Blue1Brown",
  "Lab Website Template Poster",
  "Redirects",
  "Intro to SVGs",
  "Preprint Bot",
  "hclust",
  "tislab.org",
  "Monarch",
  "Mute Tabs By URL",
];

/** displayed projects */
const _projects = orderBy(
  projects.map(({ name, ...project }) => ({
    name,
    ...project,
    images: images[name.toLowerCase()] ?? [],
  })),
  (project) => {
    const index = order.indexOf(project.name);
    return index === -1 ? 999 : index;
  },
);
</script>

<template>
  <section>
    <h2>Projects<Dash /></h2>

    <div class="grid grid-cols-3 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
      <!-- project card -->
      <div
        v-for="(
          {
            images,
            name,
            group,
            site,
            repo,
            type,
            description,
            foundation,
            features,
            work,
            tags,
          },
          index
        ) in _projects"
        :key="index"
        class="corners-2 bg-light paper flex flex-col gap-4 p-6"
      >
        <Carousel
          v-if="images.length"
          :slides="images.map((image) => ({ image }))"
        />
        <div
          v-else
          class="grid aspect-square place-items-center font-sans text-4xl text-current/50"
          :style="{ background: `oklch(90% 0.025 ${random(0, 360)})` }"
        >
          {{
            name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .toUpperCase()
          }}
        </div>

        <h3 class="mt-2 self-center text-center">
          {{ name }}
        </h3>

        <div class="flex flex-wrap justify-center gap-2">
          <a
            v-for="(link, key, index) in { repo, site }"
            :key="index"
            :href="link"
            class="button"
          >
            <component :is="getIcon(key)" />
            {{ startCase(key) }}
          </a>
        </div>

        <div>{{ group }}</div>
        <div>{{ type }}</div>
        <div v-html="renderMarkdown(description)" />
        <div>{{ foundation.join(", ") }}</div>
        <div>{{ features.join(", ") }}</div>
        <div>{{ work.join(", ") }}</div>
        <div>{{ tags.join(", ") }}</div>
      </div>
    </div>
    <List />
  </section>
</template>
