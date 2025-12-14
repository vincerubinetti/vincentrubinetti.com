<script setup lang="ts">
import { shallowRef, watchEffect } from "vue";
import { useLoop } from "@tresjs/core";
import { useIntervalFn } from "@vueuse/core";
import { gsap } from "gsap";
import { range, sample } from "lodash-es";
import { Color, Matrix4, Vector3 } from "three";
import type { InstancedMesh, OrthographicCamera } from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { cos, sin } from "@/util/math";

/** scene parameters */
const bounds = 5;
const size = 1;
const corner = 1;

/** point objects */
const points = range(-bounds + 1, bounds)
  .map((x) =>
    range(-bounds + 1, bounds)
      .map((y) =>
        range(-bounds + 1, bounds).map((z) => ({
          position: new Vector3(x, y, z),
          scale: new Vector3(0, 0, 0),
          transform: new Matrix4(),
          color: new Color(`hsl(${sample([10, 30, 160, 200])}, 100%, 50%)`),
          timeline: gsap.timeline(),
        })),
      )
      .flat(),
  )
  .flat();

/** put points closer to origin first */
points.sort((a, b) => a.position.length() - b.position.length());

/** scene objects */
const camera = shallowRef<OrthographicCamera>();
const pointMesh = shallowRef<InstancedMesh>();

/** turn off gsap default ticker */
gsap.ticker.remove(gsap.updateRoot);

const { onBeforeRender } = useLoop();

/** update points static props */
watchEffect(() => {
  points.forEach(({ color }, index) => {
    if (!pointMesh.value) return;
    pointMesh.value.setColorAt(index, color);
    pointMesh.value.instanceColor!.needsUpdate = true;
  });
});

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

  /** update points dynamic props */
  points.forEach(({ position, scale, transform }, index) => {
    if (!pointMesh.value) return;
    transform.makeScale(scale.x, scale.y, scale.z);
    transform.setPosition(position);
    pointMesh.value.setMatrixAt(index, transform.clone());
    pointMesh.value.instanceMatrix.needsUpdate = true;
  });
});

/** periodically */
useIntervalFn(() => {
  if (!pointMesh.value) return;

  /** pick a random point */
  const point = sample(points)!;
  if (point.timeline.isActive()) return;
  /** animate scale */
  const duration = 2;
  const ease = "power1.inOut";
  point.timeline
    .to(point.scale, { x: 1, y: 1, z: 1, duration, ease })
    .to(point.scale, { x: 0, y: 0, z: 0, duration, ease, delay: duration });
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
const cornersMaterial = new LineMaterial({ color: "black", linewidth: size });
const corners = new LineSegments2(cornersGeometry, cornersMaterial);
</script>

<template>
  <TresOrthographicCamera ref="camera" :zoom="1 / bounds / 2" />
  <TresInstancedMesh
    ref="pointMesh"
    :args="[undefined, undefined, points.length]"
    :frustum-culled="false"
  >
    <TresBoxGeometry :args="[size, size, size]" />
    <TresMeshPhysicalMaterial :roughness="1" :metalness="0" />
  </TresInstancedMesh>

  <TresAmbientLight :intensity="5" color="white" />
  <TresDirectionalLight
    :intensity="5"
    :position="[0, bounds, 0]"
    color="white"
  />

  <primitive :object="corners" />
</template>
