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
      <div ref="anchor" class="scroll-mt-16" />
      <AutocompleteInput class="grow pr-24" :placeholder="placeholder" />
      <div
        class="absolute right-0 flex h-full *:flex *:w-10 *:items-center *:hover:text-dark"
      >
        <AutocompleteCancel title="Clear search" @click.stop>
          <IconX />
        </AutocompleteCancel>
      </div>
    </AutocompleteAnchor>

    <AutocompletePortal>
      <AutocompleteContent
        class="z-20 max-h-(--reka-combobox-content-available-height) w-(--reka-combobox-trigger-width) overflow-x-auto bg-white shadow-md shadow-black/25"
        position="popper"
        align="start"
        :collisionPadding="20"
      >
        <AutocompleteViewport>
          <AutocompleteItem
            v-for="(option, index) in options"
            :key="index"
            :value="option.value"
            class="flex cursor-pointer scroll-mt-8 items-center gap-4 p-2 transition hover:bg-dark/10 data-highlighted:bg-dark/10"
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
