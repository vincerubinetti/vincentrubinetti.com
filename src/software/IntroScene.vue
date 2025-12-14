<script setup lang="ts">
import { shallowRef } from "vue";
import { useLoop, type TresObject } from "@tresjs/core";
import { useIntervalFn } from "@vueuse/core";
import { gsap } from "gsap";
import { range, sample } from "lodash-es";
import type { Mesh, OrthographicCamera } from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { cos, sin } from "@/util/math";

/** scene parameters */
const bounds = 5;
const size = 1;
const corner = 0.5;

/** point objects */
const points = shallowRef<
  { color: string; position: { x: number; y: number; z: number } }[]
>([]);

/** populate points */
for (const x of range(-bounds + 1, bounds))
  for (const y of range(-bounds + 1, bounds))
    for (const z of range(-bounds + 1, bounds))
      points.value?.push({
        position: { x, y, z },
        color: `hsl(${sample([10, 30, 160, 200])}, 100%, 50%)`,
      });

/** scene objects */
const camera = shallowRef<OrthographicCamera>();
const pointGroup = shallowRef<TresObject>();

/** turn off gsap default ticker */
gsap.ticker.remove(gsap.updateRoot);

const { onBeforeRender } = useLoop();

/** frame */
onBeforeRender(({ elapsed }) => {
  /* animate camera */
  if (camera.value) {
    const dist = 2 * bounds;
    const angle = (elapsed * 360) / 30;
    camera.value.position.x = sin(angle) * dist;
    camera.value.position.z = cos(angle) * dist;
    camera.value.position.y = cos(45) * dist;
    camera.value.lookAt(0, 0, 0);
  }

  /** manually tick gsap forward */
  gsap.updateRoot(elapsed);
});

useIntervalFn(() => {
  if (!pointGroup.value) return;

  /** pick a random point */
  const point = sample(pointGroup.value.children as Mesh[])!;
  /** animate scale */
  const duration = 2;
  const ease = "power1.inOut";
  let timeline: gsap.core.Timeline | undefined = point.userData.timeline;
  if (timeline?.isActive()) return;
  if (!timeline) {
    point.userData.timeline = timeline = gsap
      .timeline()
      .to(point.scale, { x: 1, y: 1, z: 1, duration, ease })
      .to(point.scale, { x: 0, y: 0, z: 0, duration, ease, delay: duration });
  }
  timeline.restart();
}, 100);

/** generate corner lines */
const cornersGeometry = new LineSegmentsGeometry();
cornersGeometry.setPositions(
  [-bounds, bounds]
    .map((x) =>
      [-bounds, bounds].map((y) =>
        [-bounds, bounds].map((z) =>
          [
            /** basis vectors */
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
          ].map(([dx, dy, dz]) => [
            /** from corner */
            x,
            y,
            z,
            /** back towards origin */
            x - dx * Math.sign(x) * corner,
            y - dy * Math.sign(y) * corner,
            z - dz * Math.sign(z) * corner,
          ]),
        ),
      ),
    )
    .flat(4),
);
const cornersMaterial = new LineMaterial({
  color: 0xffffff,
  linewidth: 2 * size,
  vertexColors: true,
});
const corners = new LineSegments2(cornersGeometry, cornersMaterial);
</script>

<template>
  <TresOrthographicCamera ref="camera" :zoom="1 / bounds / 2" />
  <TresGroup ref="pointGroup">
    <TresMesh
      v-for="({ color, position: { x, y, z } }, index) in points"
      :key="index"
      :position="[x, y, z]"
      :scale="0"
    >
      <TresBoxGeometry :args="[size, size, size]" />
      <TresMeshPhysicalMaterial :color="color" :roughness="1" :metalness="0" />
    </TresMesh>
  </TresGroup>

  <TresAmbientLight :intensity="5" color="white" />
  <TresDirectionalLight
    :intensity="5"
    :position="[0, bounds, 0]"
    color="white"
  />

  <primitive :object="corners" />
</template>
