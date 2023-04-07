<template>
  <component
    :is="component"
    class="button"
    :href="href"
    :data-outline="outline"
    :data-design="design"
    :data-text="!!_text"
    :style="{ '--color': _color }"
    target="_blank"
  >
    <component v-if="_icon" :is="_icon" class="icon" />
    <span v-if="_text">{{ _text }}</span>
    <slot />
  </component>
</template>

<script lang="ts">
import BandcampIcon from "@/assets/bandcamp.svg?component";
import SoundCloudIcon from "@/assets/soundcloud.svg?component";
import AppleMusicIcon from "@/assets/apple.svg?component";
import SpotifyIcon from "@/assets/spotify.svg?component";
import YouTubeIcon from "@/assets/youtube.svg?component";

export const types = {
  "": {
    icon: "",
    text: "",
    color: "",
  },
  bandcamp: {
    icon: BandcampIcon,
    text: "Bandcamp",
    color: "#14b8a6",
  },
  soundcloud: {
    icon: SoundCloudIcon,
    text: "SoundCloud",
    color: "#f97316",
  },
  applemusic: {
    icon: AppleMusicIcon,
    text: "Apple Music",
    color: "#f43f5e",
  },
  spotify: {
    icon: SpotifyIcon,
    text: "Spotify",
    color: "#22c55e",
  },
  youtube: {
    icon: YouTubeIcon,
    text: "YouTube",
    color: "#ef4444",
  },
};
</script>

<script setup lang="ts">
import { FunctionalComponent, computed } from "vue";

type Props = {
  icon?: FunctionalComponent;
  text?: string;
  href?: string;
  outline?: boolean;
  design?: "dark" | "glass";
  type?: keyof typeof types;
};

const props = defineProps<Props>();

const component = computed(() => (props.href ? "a" : "button"));

const _icon = computed(() => props.icon || types[props.type || ""].icon);
const _text = computed(() => props.text || types[props.type || ""].text);
const _color = computed(() => types[props.type || ""].color);
</script>

<style scoped>
.button {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  padding: 0;
  border-radius: var(--rounded);
  border: none;
  background: none;
  color: inherit;
  font: inherit;
  line-height: 1.2em;
  letter-spacing: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: var(--fast);
  transition-property: background, color, box-shadow, transform;
  z-index: 0;
}

.button[data-text="true"] {
  padding: 10px 15px;
}

.button:where(:hover, :focus) {
  box-shadow: var(--shadow);
  transform: translate(-1px, -1px);
}

.button:active {
  box-shadow: var(--shadow-inset);
  transform: translate(0, 0);
}

.button[data-outline="true"]:after {
  content: "";
  position: absolute;
  inset: 0;
  border: solid 2px transparent;
  border-radius: inherit;
}

.button[data-outline="true"]:where(:hover, :focus):after {
  animation: outline 0.3s linear;
}

@keyframes outline {
  0%,
  100% {
    border-color: transparent;
    clip-path: inset(0 0 97% 0);
  }

  25% {
    border-color: var(--primary);
    clip-path: inset(0 97% 0 0);
  }
  50% {
    border-color: var(--secondary);
    clip-path: inset(97% 0 0 0);
  }
  75% {
    border-color: var(--tertiary);
    clip-path: inset(0 0 0 97%);
  }
}

.button[data-design="dark"] {
  background: var(--gray);
  color: white;
}

.button[data-design="glass"] {
  color: white;
  letter-spacing: 1px;
  backdrop-filter: saturate(200%) blur(5px);
  mix-blend-mode: screen;
}

.button[data-design="glass"]:before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--gray);
  opacity: 0.5;
  z-index: -1;
  transition: opacity var(--fast);
}

.button[data-design="glass"]:hover:before {
  opacity: 1;
}

.icon {
  flex-shrink: 0;
  transition: color var(--fast);
}

.button[data-text="true"] > .icon {
  height: 1.2em;
}

.button[data-text="false"] > .icon {
  height: 100%;
}

.button:where(:hover, :focus) > .icon {
  color: var(--color);
}
</style>
