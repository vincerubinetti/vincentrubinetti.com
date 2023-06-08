<template>
  <canvas
    ref="canvas"
    v-bind="$attrs"
    class="canvas"
    :style="{ opacity: playing ? 1 : 0 }"
    title="Click and drag to rotate. Double click to reset camera. Alt/shift + mouse wheel to zoom."
  />
  <svg
    ref="svg"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 522 918"
    style="display: none"
  >
    <path
      d="M423.05 212.02c-38.2-38.9-93.87-68.43-105.09-189.2C317.7 10.59 307.71.75 295.42.75c-12.45 0-22.55 10.1-22.55 22.55v658.53c-38.15-28.12-95.44-37.04-152.16-19.13C35.86 689.5-15.57 766.18 5.84 833.97 27.25 901.76 113.39 935 198.24 908.2c71.66-22.63 119.49-80.85 119.72-139.24V251c14.67 3.46 143.84 18.57 143.84 158.94 0 91.49-35.58 139.35-56.59 174.76-5.21 8.78-2.67 20.11 5.79 25.84 8.1 5.5 19.05 4.08 25.45-3.33 25.68-29.72 84.79-109.03 84.79-209.38.01-99.93-57.48-144.35-98.19-185.81Z"
    />
  </svg>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from "vue";
import { useEventListener, useIntersectionObserver } from "@vueuse/core";
import {
  AddEquation,
  AdditiveBlending,
  BackSide,
  BoxHelper,
  Clock,
  CustomBlending,
  DstColorFactor,
  ExtrudeGeometry,
  HexColorString,
  Mesh,
  MeshPhongMaterial,
  OneFactor,
  PerspectiveCamera,
  PointLight,
  PointLightHelper,
  Scene,
  SphereGeometry,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import Stats from "three/addons/libs/stats.module.js";
import { bounce, clamp, cos, degToRad, rand, sin } from "@/util/math";
import { playing, smoothedLevel } from "@/global/state";
import { useInterval } from "@/util/composables";
import { repeat } from "@/util/func";

/** elements */
const canvas = ref();
const svg = ref();

/** track if user doesn't like motion */
// const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
const reduceMotion = ref(false);

/** track if in view */
const isVisible = ref(false);
useIntersectionObserver(
  canvas,
  ([{ isIntersecting }]) => (isVisible.value = isIntersecting),
  { threshold: 0 }
);

/** main objects */
let renderer: WebGLRenderer;
let scene: Scene;
let camera: PerspectiveCamera;
let clock: Clock;
let controls: OrbitControls;
let stats: typeof Stats;

/** particle spawn interval */
const interval = computed(() =>
  smoothedLevel.value <= 0.01 || reduceMotion.value
    ? Infinity
    : Math.pow(1 - smoothedLevel.value, 2) * 100
);

onMounted(() => {
  const debug = window.location.href.includes("debug");

  /** main objects */
  renderer = new WebGLRenderer({ canvas: canvas.value, alpha: true });
  scene = new Scene();
  camera = new PerspectiveCamera(45, 1, 0.01, 10000);
  clock = new Clock();
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableRotate = window.matchMedia("(hover: hover)").matches;
  if (debug) {
    stats = new Stats();
    document.body.append(stats.dom);
    stats.triangles = stats.addPanel(
      new Stats.Panel("triangles", "white", "black")
    );
  }

  /** resize scene */
  const resize = () => {
    if (!canvas.value) return;
    camera.aspect = canvas.value.clientWidth / canvas.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.render(scene, camera);
  };
  resize();
  useEventListener(window, "resize", resize);

  /** reset camera */
  const reset = () => {
    camera.position.set(0, 0, 10);
    camera.rotation.set(0, 0, 0);
  };
  reset();
  useEventListener(canvas, "dblclick", reset);

  /** room to project lights onto */
  const sphere = new Mesh(
    new SphereGeometry(10, 64, 64),
    new MeshPhongMaterial({
      color: "black",
      side: BackSide,
      transparent: true,
      opacity: 1,
      blending: AdditiveBlending,
    })
  );
  sphere.renderOrder = -1;
  if (debug) scene.add(new BoxHelper(sphere, "white"));
  scene.add(sphere);

  /** light colors */
  const colors: HexColorString[] = [
    "#e91e63",
    "#e91e63",
    "#9c27b0",
    "#9c27b0",
    "#2196f3",
    "#2196f3",
  ];

  /** generate lights */
  for (const color of colors) {
    const light = new PointLight(color, 2);
    light.name = "light";
    light.position.x = rand(-5, 5);
    light.position.y = rand(-5, 5);
    light.position.z = rand(-5, 5);
    light.userData = {
      vx: Math.random() > 0.5 ? -0.002 : 0.002,
      vy: Math.random() > 0.5 ? -0.002 : 0.002,
      vz: Math.random() > 0.5 ? -0.002 : 0.002,
    };
    if (debug) scene.add(new PointLightHelper(light));
    scene.add(light);
  }

  /** load svg shape */
  const shape = new Mesh(
    new ExtrudeGeometry(
      new SVGLoader().parse(svg.value.outerHTML).paths[0].toShapes(false)[0],
      { depth: 50, bevelEnabled: false }
    )
      .center()
      .scale(0.001, -0.001, 0.001)
      .rotateZ(degToRad(-90)),
    new MeshPhongMaterial({
      color: "black",
      transparent: true,
      opacity: 0,
    })
  );

  /** generate particles */
  let angle = 0;
  const spawn = (increment = 0) => {
    if (!isVisible.value) return;

    const particle = shape.clone();
    particle.geometry = shape.geometry.clone();
    particle.material = shape.material.clone();

    particle.name = "particle";
    particle.userData = {
      life: 0,
      a: (angle += increment || 36 + smoothedLevel.value * 10),
      r: 2,
      va: -0.1,
      vr: 0.001,
      vz: 0.05,
    };
    particle.position.z = -10;
    if (blend > 0) {
      particle.material.color.setHex(0x808080);
      particle.material.blending = CustomBlending;
      particle.material.blendEquation = AddEquation;
      particle.material.blendSrc = DstColorFactor;
      if (blend === 1) particle.material.blendDst = OneFactor;
      if (blend === 2) particle.material.blendDst = DstColorFactor;
    }
    if (debug) {
      particle.userData.helper = new BoxHelper(particle, "white");
      scene.add(particle.userData.helper);
    }
    scene.add(particle);
  };

  /** spawn on a timer */
  useInterval(spawn, interval);

  let blend = 0;
  useEventListener(window, "keydown", ({ key }) => {
    if (!isVisible.value) return;

    /** spawn a bunch of particles on command */
    if (key === "v") repeat(() => spawn(20), 360 / 20);
    /** change blending */
    if (key === "r") blend = (blend + 1) % 3;
  });

  /** main frame loop */
  renderer.setAnimationLoop(() => {
    if (!isVisible.value) return;

    /** factor of reference fps */
    let d = Math.min(clock.getDelta() * 120, 1);

    /** reduce motion */
    if (reduceMotion.value) d = d / 4;

    /** lights */
    const lights = <PointLight[]>scene.getObjectsByProperty("name", "light");
    for (const light of lights) {
      /** move */
      light.userData.vx = bounce(light.position.x, 5, light.userData.vx);
      light.userData.vy = bounce(light.position.y, 5, light.userData.vy);
      light.userData.vz = bounce(light.position.z, 5, light.userData.vz);
      light.position.x +=
        light.userData.vx * d * (1 + smoothedLevel.value * 20);
      light.position.y +=
        light.userData.vy * d * (1 + smoothedLevel.value * 20);
      light.position.z +=
        light.userData.vz * d * (1 + smoothedLevel.value * 20);

      /** brightness */
      if (!reduceMotion.value) light.intensity = 2 + smoothedLevel.value;
    }

    /** particles */
    const particles = <Mesh[]>scene.getObjectsByProperty("name", "particle");
    for (const particle of particles) {
      /** move */
      particle.userData.a += particle.userData.va * d;
      particle.userData.r += particle.userData.vr * d;
      particle.position.z +=
        particle.userData.vz * d * (smoothedLevel.value * 8);
      particle.position.x = cos(particle.userData.a) * particle.userData.r;
      particle.position.y = sin(particle.userData.a) * particle.userData.r;
      particle.rotation.z = degToRad(particle.userData.a);

      /** transparency */
      const alpha = clamp(
        Math.min(
          0.5 - Math.pow(Math.abs(particle.position.z) / 10, 1.5),
          (2 * 300 - particle.userData.life * 2) / 300
        ),
        0,
        1
      );
      [particle.material].flat()[0].opacity = alpha;

      /** destroy */
      particle.userData.life += 1 * d;
      if (particle.userData.life > 300 || particle.position.z > 10) {
        scene.remove(particle);
        particle.geometry.dispose();
        [particle.material].flat()[0].dispose();
        if (particle.userData.helper) {
          scene.remove(particle.userData.helper);
          particle.userData.helper.dispose();
        }
      }

      if (debug) particle.userData.helper?.update();
    }

    /** update */
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    controls?.update();

    if (debug) {
      stats?.update();
      stats?.triangles.update(renderer.info.render.triangles, 200000);
    }
  });
});

onBeforeUnmount(() => {
  renderer?.setAnimationLoop(null);
  renderer?.dispose();
  controls?.dispose();
  stats?.dispose();
});
</script>

<style scoped>
.canvas {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  z-index: -2;
  user-select: none;
  transition: var(--slow);
  transition-property: opacity, filter;
}

.canvas:focus {
  outline: none;
}
</style>
