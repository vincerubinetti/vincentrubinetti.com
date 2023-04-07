<template>
  <div :style="style">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { CSSProperties, computed } from "vue";

type Props = {
  display?: "inline" | "block";
  dir?: "row" | "col";
  gap?: "none" | "tiny" | "small" | "medium" | "big";
  hAlign?: "left" | "center" | "right" | "stretch" | "space";
  vAlign?: "top" | "center" | "bottom" | "stretch" | "space";
  wrap?: boolean;
};

const props = withDefaults(defineProps<Props>(), {
  display: "block",
  dir: "row",
  gap: "medium",
  hAlign: "center",
  vAlign: "center",
  wrap: true,
});

const aligns = {
  left: "flex-start",
  top: "flex-start",
  center: "center",
  right: "flex-end",
  bottom: "flex-end",
  stretch: "stretch",
  space: "space-between",
};

const gaps = {
  none: "0",
  tiny: "5px",
  small: "5px 10px",
  medium: "15px 30px",
  big: "30px 60px",
};

const style = computed<CSSProperties>(() => ({
  display: props.display === "inline" ? "inline-flex" : "flex",
  width: props.display === "block" ? "100%" : "",
  flexDirection: props.dir === "col" ? "column" : "row",
  justifyContent:
    props.dir === "col" ? aligns[props.vAlign] : aligns[props.hAlign],
  alignItems: props.dir === "col" ? aligns[props.hAlign] : aligns[props.vAlign],
  gap: gaps[props.gap],
  flexWrap: props.dir === "row" && props.wrap ? "wrap" : "nowrap",
}));
</script>
