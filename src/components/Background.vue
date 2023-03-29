<template>
  <canvas ref="canvas" tabindex="0" @keydown="explode"></canvas>
  <svg
    ref="svg"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="780 2240 2460 1110"
    style="display: none"
  >
    <path
      d="M1257.05,2486.02c-38.2-38.9-143.87-98.43-155.09-219.2c-0.26-12.23-10.25-22.07-22.54-22.07h0 c-12.45,0-22.55,10.1-22.55,22.55v838.53c-38.15-28.12-95.44-37.04-152.16-19.13c-84.85,26.8-136.28,103.48-114.87,171.27 c21.41,67.79,107.55,101.03,192.4,74.23c71.66-22.63,119.49-80.85,119.72-139.24h0V2495c14.67,3.46,193.84,48.57,193.84,188.94 c0,91.49-35.58,139.35-56.59,174.76c-5.21,8.78-2.67,20.11,5.79,25.84c8.1,5.5,19.05,4.08,25.45-3.33 c25.68-29.72,84.79-109.03,84.79-209.38C1355.25,2571.9,1297.76,2527.48,1257.05,2486.02z"
    ></path>
  </svg>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useEventListener } from "@vueuse/core";
import {
  AdditiveBlending,
  BackSide,
  BoxHelper,
  Clock,
  ExtrudeGeometry,
  Mesh,
  MeshPhongMaterial,
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
import { bounce, clamp, cos, degToRad, rand, sin, triangle } from "@/util/math";
import { smoothedLevel } from "@/global/state";
import { useInterval } from "@/util/composables";
import { repeat } from "@/util/func";

const interval = computed(() =>
  smoothedLevel.value <= 0.01
    ? Infinity
    : Math.pow(1 - smoothedLevel.value, 1) * 200
);

const canvas = ref();
const svg = ref();
let explode: (event: KeyboardEvent) => void;

onMounted(() => {
  const debug = window.location.href.includes("debug");

  /** main objects */
  const renderer = new WebGLRenderer({ canvas: canvas.value });
  const scene = new Scene();
  const camera = new PerspectiveCamera(45, 1, 0.01, 10000);
  const clock = new Clock();
  const controls = new OrbitControls(camera, renderer.domElement);
  if (!debug) controls.enableZoom = false;
  let stats: any = null;
  if (debug) {
    stats = new Stats();
    document.body.append(stats.dom);
    stats.triangles = stats.addPanel(
      new Stats.Panel("triangles", "white", "black")
    );
    // stats.showPanel(0);
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
      opacity: 0.5,
      blending: AdditiveBlending,
    })
  );
  sphere.renderOrder = -1;
  if (debug) scene.add(new BoxHelper(sphere, "white"));
  scene.add(sphere);

  /** light colors */
  const colors = [
    "#e91e63",
    "#e91e63",
    "#9c27b0",
    "#9c27b0",
    "#03a9f4",
    "#03a9f4",
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
      { depth: 100, bevelEnabled: false }
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
    const particle = shape.clone();
    particle.geometry = shape.geometry.clone();
    particle.material = shape.material.clone();
    particle.name = "particle";
    particle.userData = {
      life: 0,
      a: (angle += increment || 26 + smoothedLevel.value * 45),
      r: 2,
      va: -0.1,
      vr: 0.001,
      vz: 0.05,
    };
    particle.position.z = -10;
    if (debug) {
      particle.userData.helper = new BoxHelper(particle, "white");
      scene.add(particle.userData.helper);
    }
    scene.add(particle);
  };

  /** spawn on a timer */
  useInterval(spawn, interval);

  /** spawn a bunch of particles on command */
  explode = ({ key }) => {
    if (key === "v") repeat(() => spawn(20), 360 / 20);
  };

  /** main frame loop */
  renderer.setAnimationLoop(() => {
    /** factor of reference fps */
    const d = Math.min(clock.getDelta() * 120, 1);

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
      light.intensity = 2 + smoothedLevel.value * 2;
    }

    /** particles */
    const particles = <Mesh[]>scene.getObjectsByProperty("name", "particle");
    for (const particle of particles) {
      /** move */
      particle.userData.a += particle.userData.va * d;
      particle.userData.r += particle.userData.vr * d;
      particle.position.z +=
        particle.userData.vz * d * (0.1 + smoothedLevel.value * 5);
      particle.position.x = cos(particle.userData.a) * particle.userData.r;
      particle.position.y = sin(particle.userData.a) * particle.userData.r;
      particle.rotation.z = degToRad(particle.userData.a);

      /** transparency */
      // particle.renderOrder = particle.userData.life;
      [particle.material].flat()[0].opacity = clamp(
        (1 - Math.abs(particle.position.z) / 10) *
          triangle(particle.userData.life, 0, 300, 0, 0.75),
        0,
        1
      );
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
    controls.update();
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);

    if (debug) {
      stats?.update();
      stats?.triangles.update(renderer.info.render.triangles, 200000);
    }
  });
});
</script>

<style scoped>
canvas {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  opacity: 0;
  z-index: -1;
  animation: fade 5s ease both;
  user-select: none;
  touch-action: auto !important;
}

canvas:focus {
  outline: none;
}

@keyframes fade {
  to {
    opacity: 1;
  }
}
</style>
