<script setup lang="ts">
import { map, startCase, toPairs, uniq } from "lodash-es";
import { ExternalLink, Globe } from "lucide-vue-next";
import GitHub from "@/assets/logos/github.svg?component";
import Carousel from "@/components/Carousel.vue";
import Dash from "@/components/Dash.vue";
import List from "@/software/List.vue";
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

/** all unique tags */
const tags = uniq(map(projects, (project) => project.tags).flat());

/** get link icon */
const getIcon = (key: string) => {
  if (key.match(/site/i)) return Globe;
  if (key.match(/repo/i)) return GitHub;
  return ExternalLink;
};
</script>

<template>
  <section>
    <h2>Projects<Dash /></h2>

    <div class="mb-4 flex flex-wrap gap-2">
      <button v-for="(tag, index) in tags" :key="index" class="button">
        {{ tag }}
      </button>
    </div>

    <div class="grid grid-cols-3 gap-4 max-md:grid-cols-2 max-sm:grid-cols-1">
      <!-- project card -->
      <div
        v-for="({ name, links, points, tags }, index) in projects"
        :key="index"
        class="corners-2 bg-light paper flex flex-col gap-4 p-6"
      >
        <Carousel
          :slides="
            (images[name.toLowerCase()] ?? []).map((image) => ({ image }))
          "
        />

        <h3 class="mt-2 self-center text-center">{{ name }}</h3>

        <ul>
          <li v-for="(point, index) in points" :key="index">{{ point }}</li>
        </ul>
        <div class="flex flex-wrap justify-center gap-2">
          <a
            v-for="(link, key, index) in links"
            :key="index"
            :href="link"
            :title="startCase(key)"
            class="button"
          >
            <component :is="getIcon(key)" />
          </a>
          <button v-for="(tag, index) in tags" :key="index" class="button">
            {{ tag }}
          </button>
        </div>
      </div>
    </div>

    <List />
  </section>
</template>
