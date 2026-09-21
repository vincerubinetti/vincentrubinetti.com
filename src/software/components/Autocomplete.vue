<script setup lang="ts">
import type { FunctionalComponent } from "vue";
import { useTemplateRef } from "vue";
import { IconX } from "@tabler/icons-vue";
import {
  AutocompleteAnchor,
  AutocompleteCancel,
  AutocompleteContent,
  AutocompleteInput,
  AutocompleteItem,
  AutocompletePortal,
  AutocompleteRoot,
  AutocompleteViewport,
} from "reka-ui";

type Props = {
  options: {
    value: string | number;
    label: string | number;
    info?: string | number;
    icon?: FunctionalComponent;
  }[];
  placeholder?: string;
};

defineProps<Props>();

const model = defineModel<string>();

const anchor = useTemplateRef("anchor");

defineExpose({ anchor });
</script>

<template>
  <AutocompleteRoot v-model="model" :openOnClick="true" :openOnFocus="true">
    <AutocompleteAnchor class="relative flex">
      <div ref="anchor" />
      <AutocompleteInput class="grow pr-24" :placeholder="placeholder" />
      <div
        class="*:hover:text-dark absolute right-0 flex h-full *:flex *:w-10 *:items-center"
      >
        <AutocompleteCancel title="Clear search">
          <IconX />
        </AutocompleteCancel>
      </div>
    </AutocompleteAnchor>

    <AutocompletePortal>
      <AutocompleteContent
        class="z-20 max-h-(--reka-combobox-content-available-height) w-(--reka-combobox-trigger-width) overflow-x-auto bg-white shadow"
        position="popper"
        align="start"
        :collisionPadding="20"
      >
        <AutocompleteViewport>
          <AutocompleteItem
            v-for="(option, index) in options"
            :key="index"
            :value="option.value"
            class="hover:bg-dark/10 data-highlighted:bg-dark/10 flex cursor-pointer items-center gap-4 p-2 transition"
          >
            <component :is="option.icon || 'div'" class="size-4" />
            <div class="flex items-center gap-2">
              {{ option.label }}
              <div v-if="option.info" class="opacity-50">
                {{ option.info }}
              </div>
            </div>
          </AutocompleteItem>
        </AutocompleteViewport>
      </AutocompleteContent>
    </AutocompletePortal>
  </AutocompleteRoot>
</template>
