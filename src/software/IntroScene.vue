<script setup lang="ts">
import { onMounted, shallowRef, watchEffect } from "vue";
import { useLoop } from "@tresjs/core";
import { useIntervalFn } from "@vueuse/core";
import { gsap } from "gsap";
import { random, range, sample } from "lodash-es";
import {
  Box3,
  Color,
  DoubleSide,
  Matrix4,
  Mesh,
  Raycaster,
  Vector3,
} from "three";
import type { InstancedMesh, OrthographicCamera } from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import brush from "@/assets/models/brush.glb?url";
import check from "@/assets/models/check.glb?url";
import star from "@/assets/models/star.glb?url";
import type { pointerCoords } from "@/util/dom";
import { cos, sin } from "@/util/math";
import { sleep } from "@/util/misc";

/** scene parameters */
const bounds = 11;
const size = 1;
const corner = 1;

type Props = {
  pointer?: ReturnType<typeof pointerCoords>;
  inside?: boolean;
};

const { pointer, inside } = defineProps<Props>();

/** point objects */
const points = range(-bounds + 1, bounds)
  .map((x) =>
    range(-bounds + 1, bounds)
      .map((y) =>
        range(-bounds + 1, bounds).map((z) => {
          const position = new Vector3(x, y, z);
          const scale = new Vector3(0, 0, 0);
          const transform = new Matrix4();
          const color = new Color(
            `hsl(${sample([10, 30, 160, 200])}, 100%, 50%)`,
          );
          const shapes: Record<string, boolean> = {};
          const timeline = gsap
            .timeline({ paused: true })
            .to(scale, { x: 1, y: 1, z: 1 })
            .to(scale, { x: 0, y: 0, z: 0, delay: 0.5 });
          return { position, scale, transform, color, shapes, timeline };
        }),
      )
      .flat(),
  )
  .flat();

/** put points closer to origin first */
points.sort((a, b) => a.position.length() - b.position.length());

const loader = new GLTFLoader();
const raycaster = new Raycaster();
const shapes = { brush, check, star };

onMounted(async () => {
  /** load low poly 3d models */
  const models = await Promise.all(
    Object.entries(shapes).map(
      ([name, url]) =>
        new Promise<{ name: string; model: GLTF }>((resolve) =>
          loader.load(url, (model) => resolve({ name, model })),
        ),
    ),
  );

  /** for each model */
  for (const { name, model } of models) {
    /** make sure all materials are double sided */
    model.scene.traverse((node) => {
      if (!(node instanceof Mesh)) return;
      if (Array.isArray(node.material))
        node.material.forEach((material) => (material.side = DoubleSide));
      else if (node.material) node.material.side = DoubleSide;
    });

    /** center and scale model into [-bounds, bounds]*/
    const box = new Box3().setFromObject(model.scene);
    const scale =
      (2 * bounds) / Math.max(...Object.values(box.getSize(new Vector3())));
    model.scene.scale.setScalar(scale);
    const position = box
      .getCenter(new Vector3())
      .negate()
      .multiplyScalar(scale);
    model.scene.position.set(...position.toArray());
    model.scene.updateMatrixWorld(true);

    /** find points inside/outside of model */
    for (const { position, shapes } of points) {
      raycaster.set(position, new Vector3(1, 0, 0));
      const intersections = raycaster.intersectObject(model.scene, true);
      const inside = intersections.length % 2 === 1;
      shapes[name] = inside;
    }
  }
});

/** periodically switch model shapes */
useIntervalFn(() => {
  const name = sample(Object.keys(shapes)) || "";
  for (const { shapes, timeline } of points) {
    const on = !!shapes[name];
    if (on) sleep(random(500)).then(() => timeline.restart());
  }
}, 2000);

/** twinkle */
useIntervalFn(() => {
  const { timeline } = sample(points) || {};
  if (!timeline?.isActive()) timeline?.restart();
}, 50);

/** scene objects */
const camera = shallowRef<OrthographicCamera>();
const pointMesh = shallowRef<InstancedMesh>();

/** turn off gsap default ticker */
gsap.ticker.remove(gsap.updateRoot);

/** gsap defaults */
gsap.defaults({ ease: "power2.out", duration: 1 });

const { onBeforeRender } = useLoop();

/** camera angle */
const rotate = { value: 0 };

watchEffect(() => {
  /** rotate by pointer */
  if (inside) gsap.to(rotate, { value: -(pointer?.x ?? 0) * 360 });
});

/** frame */
onBeforeRender(({ elapsed, delta }) => {
  /* animate camera */
  if (camera.value) {
    const dist = 2 * bounds;
    camera.value.position.x = sin(rotate.value) * dist;
    camera.value.position.z = cos(rotate.value) * dist;
    camera.value.position.y = cos(45) * dist;
    camera.value.lookAt(0, 0, 0);
  }

  /** slow rotate */
  if (!inside) {
    gsap.killTweensOf(rotate);
    rotate.value += (delta * 360) / 10;
  }

  /** update points dynamic props */
  points.forEach(({ position, scale, transform, color }, index) => {
    if (!pointMesh.value) return;
    transform.makeScale(scale.x, scale.y, scale.z);
    transform.setPosition(position);
    pointMesh.value.setMatrixAt(index, transform);
    pointMesh.value.instanceMatrix.needsUpdate = true;
    pointMesh.value.setColorAt(index, color);
    pointMesh.value.instanceColor!.needsUpdate = true;
  });

  /** manually tick gsap forward */
  gsap.updateRoot(elapsed);
});

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
