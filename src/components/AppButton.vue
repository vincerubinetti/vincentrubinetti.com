<template>
  <component
    :is="component"
    class="button"
    :href="href"
    :data-outline="outline"
    :data-design="design"
    :data-text="!!text"
    :style="{ '--color': color }"
    target="_blank"
  >
    <component v-if="IconComponent" :is="IconComponent" class="icon" />
    <span v-if="text" class="text">{{ text }}</span>
    <slot />
  </component>
</template>

<script lang="ts">
import BandcampIcon from "@/assets/bandcamp.svg?component";
import SoundCloudIcon from "@/assets/soundcloud.svg?component";
import AppleIcon from "@/assets/apple.svg?component";
import SpotifyIcon from "@/assets/spotify.svg?component";
import YouTubeIcon from "@/assets/youtube.svg?component";
import SteamIcon from "@/assets/steam.svg?component";
import CodeIcon from "@/assets/code.svg?component";
import HeadphonesIcon from "@/assets/headphones.svg?component";
import LeafIcon from "@/assets/leaf.svg?component";
import NotesIcon from "@/assets/notes.svg?component";
import EnvelopeIcon from "@/assets/envelope.svg?component";

export const icons = {
  "": {
    component: "",
    color: "",
  },
  bandcamp: {
    component: BandcampIcon,
    color: "#14b8a6",
  },
  soundcloud: {
    component: SoundCloudIcon,
    color: "#f97316",
  },
  apple: {
    component: AppleIcon,
    color: "#f43f5e",
  },
  spotify: {
    component: SpotifyIcon,
    color: "#22c55e",
  },
  youtube: {
    component: YouTubeIcon,
    color: "#ef4444",
  },
  steam: {
    component: SteamIcon,
    color: "#3b82f6",
  },
  code: {
    component: CodeIcon,
    color: "#a855f7",
  },
  headphones: {
    component: HeadphonesIcon,
    color: "#f43f5e",
  },
  leaf: {
    component: LeafIcon,
    color: "#10b981",
  },
  notes: {
    component: NotesIcon,
    color: "#06b6d4",
  },
  envelope: {
    component: EnvelopeIcon,
    color: "#06b6d4",
  },
};
</script>

<script setup lang="ts">
import { FunctionalComponent, computed } from "vue";

type Props = {
  icon?: keyof typeof icons | FunctionalComponent;
  text?: string;
  href?: string;
  outline?: boolean;
  design?: "dark" | "glass";
};

const props = defineProps<Props>();

const component = computed(() => (props.href ? "a" : "button"));

const IconComponent = computed(() =>
  typeof props.icon === "string" ? icons[props.icon].component : props.icon
);
const color = computed(() =>
  typeof props.icon === "string" ? icons[props.icon].color : ""
);
</script>

<style scoped>
.button {
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  max-width: 100%;
  padding: 0;
  border-radius: var(--rounded);
  border: none;
  background: none;
  color: var(--dark-gray);
  font: inherit;
  line-height: 1.5em;
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
}

.button:active {
  box-shadow: inset 1px 1px 5px #40405010;
  transform: translate(0, 0);
}

.button[data-outline="true"]:where(:hover, :focus) {
  transform: translate(-1px, -1px);
}

.button[data-outline="true"]:after {
  content: "";
  position: absolute;
  inset: 0;
  border: solid 2px transparent;
  border-radius: inherit;
  z-index: 1;
}

.button[data-outline="true"]:where(:hover, :focus):after {
  animation: outline 0.3s linear;
  will-change: clip-path, border-color;
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
  background: var(--dark-gray);
  color: white;
}

.button[data-design="glass"] {
  color: white;
  letter-spacing: 1px;
  -webkit-backdrop-filter: saturate(300%) blur(3px);
  backdrop-filter: saturate(200%) blur(3px);
}

.button[data-design="glass"]:before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: var(--gray);
  opacity: 0.25;
  z-index: -1;
  transition: var(--fast);
  transition-property: background, opacity;
}

.button[data-design="glass"]:where(:hover, :focus):before {
  background: black;
  opacity: 0.5;
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

.text {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>
