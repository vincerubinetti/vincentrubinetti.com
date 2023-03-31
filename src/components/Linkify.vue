<template>
  <p v-html="_content" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import linkifyStr from "linkify-string";

type Props = {
  content: string;
};

const props = defineProps<Props>();

const _content = computed(() =>
  linkifyStr(props.content, {
    format: (value) => {
      const { hostname, pathname, search, hash } = new URL(value);
      return (
        hostname.replace(/^www\./, "") +
        pathname.replace(/\/$/, "") +
        search +
        hash
      );
    },
    nl2br: true,
  })
);
</script>
