<script setup lang="ts">
import { onMounted, shallowRef, watch, watchEffect } from "vue";
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
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { GLTF } from "three/addons/loaders/GLTFLoader.js";
import type { pointerCoords } from "@/util/dom";
import { cos, mod, sin } from "@/util/math";
import arrow from "./images/models/arrow.glb?url";
import check from "./images/models/check.glb?url";
import flask from "./images/models/flask.glb?url";
import star from "./images/models/star.glb?url";

/** scene parameters */
const bounds = 10;
const size = 1;
const corner = 1;

type Props = {
  pointer?: ReturnType<typeof pointerCoords>;
  inside?: boolean;
  shape?: string;
};

const { pointer, inside, shape } = defineProps<Props>();

/** color palette */
const colors = `
  --color-light: hsl(30, 100%, 90%);
  --color-light: hsl(10, 100%, 90%);
  --color-mid: hsl(160, 100%, 90%);
  --color-sky: hsl(200, 100%, 90%);
`
  .split("\n")
  .map((line) => line.split(":")[1]?.trim().slice(0, -1))
  .filter(Boolean)
  .map((hsl) => hsl.match(/(\d+)\D+(\d+)\D+(\d+)/) ?? [])
  .filter(Boolean)
  .map(([, h, s, l]) => `hsl(${h}, ${s}%, ${+l / 2}%)`)
  .map((color) => new Color(color));

/** point objects */
const points = range(-bounds + 1, bounds)
  .map((x) =>
    range(-bounds + 1, bounds)
      .map((y) =>
        range(-bounds + 1, bounds).map((z) => {
          /** position */
          const position = new Vector3(x, y, z);
          /** scale */
          const scale = new Vector3(0, 0, 0);
          /** combined transform */
          const transform = new Matrix4();
          /** color */
          const color = sample(colors)!;
          /** shape membership */
          const shapes: Record<string, boolean> = {};
          /** inflate/deflate animation */
          const timeline = gsap
            .timeline({ paused: true })
            .to(scale, { x: 1, y: 1, z: 1, delay: random(0, 0.5, true) })
            .to(scale, { x: 0, y: 0, z: 0, delay: 0.5 });
          return { position, scale, transform, color, shapes, timeline };
        }),
      )
      .flat(),
  )
  .flat();

/** put points closer to origin first */
points.sort((a, b) => a.position.length() - b.position.length());

/** turn off gsap default ticker */
gsap.ticker.remove(gsap.updateRoot);

/** gsap defaults */
gsap.defaults({ ease: "power1.out", duration: 1 });

const loader = new GLTFLoader();
const raycaster = new Raycaster();
const shapes = { arrow, check, flask, star };

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

/** switch model shape */
watch(
  () => shape,
  () => {
    /** go through all points */
    for (const point of points) {
      const { shapes, timeline } = point;
      /** should point be "on" */
      const fill = !!shapes[shape ?? ""];
      /** timeline progress */
      const progress = timeline.progress();
      /** cancel previous delayed call */
      timeline.cancel?.kill();
      if (fill) {
        /** restart */
        timeline.restart();
        /** set color */
        point.color =
          colors[Object.keys(shapes).indexOf(shape ?? "") % colors.length];
        /** pause in middle of animation */
        timeline.cancel = gsap.delayedCall(1, () => timeline.pause());
      } else if (!shape && progress > 0) {
        /** if shape has turned off and in middle of animation, play to end */
        timeline.resume();
      } else {
        /** immediately reset */
        timeline.pause().seek(0);
        /** clear color */
        point.color = sample(colors)!;
      }
    }
  },
);

/** twinkle */
useIntervalFn(() => {
  sample(points)!.timeline.restart();
}, 200);

/** scene objects */
const camera = shallowRef<OrthographicCamera>();
const pointMesh = shallowRef<InstancedMesh>();

/** camera angle */
const rotate = { value: 0 };

watchEffect(() => {
  /** rotate by pointer */
  if (inside) {
    gsap.killTweensOf(rotate);
    const currentAngle = mod(rotate.value, 1);
    const newAngle = mod(-(pointer?.x ?? 0.5), 1);
    const cw = newAngle + 1 - currentAngle;
    const ccw = newAngle - currentAngle;
    const diff = Math.abs(cw) < Math.abs(ccw) ? cw : ccw;
    gsap.to(rotate, { value: rotate.value + diff });
  }
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

const { onBeforeRender } = useLoop();

/** frame */
onBeforeRender(({ elapsed, delta }) => {
  /* animate camera */
  if (camera.value) {
    const dist = 2 * bounds;
    camera.value.position.x = sin(rotate.value * 360) * dist;
    camera.value.position.z = cos(rotate.value * 360) * dist;
    camera.value.position.y = cos(45) * dist;
    camera.value.lookAt(0, 0, 0);
  }

  /** slow rotate */
  if (!inside) {
    gsap.killTweensOf(rotate);
    rotate.value += delta / 20;
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
