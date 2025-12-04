<script setup lang="ts">
import { computed, useTemplateRef } from "vue";
import Logo from "@/assets/brand/vr.svg?component";
import Apple from "@/assets/icons/apple.svg?component";
import Bandcamp from "@/assets/icons/bandcamp.svg?component";
import SoundCloud from "@/assets/icons/soundcloud.svg?component";
import Spotify from "@/assets/icons/spotify.svg?component";
import YouTube from "@/assets/icons/youtube.svg?component";

const links = [
  {
    name: "Bandcamp",
    icon: Bandcamp,
    href: "https://vincerubinetti.bandcamp.com",
    title: "Full discography",
  },
  {
    name: "Spotify",
    icon: Spotify,
    href: "https://open.spotify.com/artist/2SRhEEt2tlDQWxzwfUo9Dl",
    title: "Spotify",
  },
  {
    name: "Apple Music",
    icon: Apple,
    href: "https://itunes.apple.com/us/artist/vincent-rubinetti/274886492",
    title: "Apple Music",
  },
  {
    name: "SoundCloud",
    icon: SoundCloud,
    href: "https://soundcloud.com/vincerubinetti",
    title: "SoundCloud",
  },
  {
    name: "YouTube",
    icon: YouTube,
    href: "https://www.youtube.com/c/VincentRubinetti",
    title: "YouTube",
  },
];

const ref = useTemplateRef("ref");
const refs = useTemplateRef("refs");

const map = computed(() =>
  [
    ...links,
    {
      element: ref.value,
      href: "https://vincerubinetti.com",
      title: "Website",
    },
  ]
    .map((link, index) => ({
      element: "element" in link ? link.element : refs.value?.[index],
      ...link,
    }))
    .map(({ href, title, element }) => {
      if (!element) return "";
      const { x, y, width, height } = element.getBoundingClientRect();
      const coords = [x, y, x + width, y + height].join(",");
      return `<area shape="rect" coords="${coords}" href=${href} title="${title}">`;
    })
    .concat([])
    .join("\n"),
);
</script>

<template>
  <div class="dark flex h-[180px] w-[975px] flex-col items-center">
    <h1 ref="ref" class="my-auto flex items-center gap-5 text-3xl!">
      <Logo class="size-12!" />Vincent Rubinetti
    </h1>

    <div class="mb-5 flex items-center gap-5">
      <div
        v-for="({ name, icon }, index) in links"
        ref="refs"
        :key="index"
        class="flex items-center gap-3 p-3"
      >
        <component :is="icon" class="relative -top-0.5" />
        {{ name }}
      </div>
    </div>
  </div>
  <textarea :value="map" />
</template>
