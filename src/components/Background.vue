<template>
  <canvas ref="canvas" />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useEventListener } from "@vueuse/core";
import {
  Mesh,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  PointLight,
  SphereGeometry,
  BackSide,
  MeshPhongMaterial,
  AdditiveBlending,
  ExtrudeGeometry,
  MeshBasicMaterial,
  FrontSide,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
import Stats from "three/examples/jsm/libs/stats.module";
import note from "./note.svg";

const canvas = ref();
let size = 10;

onMounted(() => {
  if (!canvas.value) return;

  const stats = Stats();
  document.body.appendChild(stats.dom);

  const renderer = new WebGLRenderer({ canvas: canvas.value });
  const scene = new Scene();
  const camera = new PerspectiveCamera(45, 1, 0.01, size * 1000);
  const controls = new OrbitControls(camera, renderer.domElement);

  camera.position.set(0, 0, size);

  const boundary = new Mesh(
    new SphereGeometry(size, 64, 64),
    new MeshPhongMaterial({
      color: "#000000",
      side: BackSide,
      transparent: true,
      opacity: 0.5,
      blending: AdditiveBlending,
    })
  );
  scene.add(boundary);

  const lights = [
    "#e91e63",
    "#e91e63",
    "#9c27b0",
    "#9c27b0",
    "#03a9f4",
    "#03a9f4",
  ].map((color) => {
    const light = new PointLight(color, 2);
    light.position.x = -size / 2 + Math.random() * size;
    light.position.y = -size / 2 + Math.random() * size;
    light.position.z = -size / 2 + Math.random() * size;
    scene.add(light);
    return {
      light,
      vx: Math.random() > 0.5 ? -size / 500 : size / 500,
      vy: Math.random() > 0.5 ? -size / 500 : size / 500,
      vz: Math.random() > 0.5 ? -size / 500 : size / 500,
    };
  });

  new SVGLoader().load(note, (data) => {
    const [path] = data.paths;
    const [shape] = path.toShapes();

    const note = new Mesh(
      new ExtrudeGeometry(shape, {
        depth: 20,
        bevelEnabled: false,
      })
        .center()
        .scale(0.001, -0.001, 0.001),
      new MeshPhongMaterial({
        color: "#000000",
        shininess: 1000,
        side: BackSide,
        transparent: true,
        opacity: 0.5,
      })
    );
    scene.add(note);
  });

  renderer.setAnimationLoop(() => {
    for (const light of lights) {
      if (light.light.position.x > size / 2) light.vx = -Math.abs(light.vx);
      if (light.light.position.x < -size / 2) light.vx = Math.abs(light.vx);
      if (light.light.position.y > size / 2) light.vy = -Math.abs(light.vy);
      if (light.light.position.y < -size / 2) light.vy = Math.abs(light.vy);
      if (light.light.position.z > size / 2) light.vz = -Math.abs(light.vz);
      if (light.light.position.z < -size / 2) light.vz = Math.abs(light.vz);
      light.light.position.x += light.vx;
      light.light.position.y += light.vy;
      light.light.position.z += light.vz;
    }
    controls.update();
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    stats.update();
  });

  const onResize = () => {
    if (!canvas.value) return;
    camera.aspect = canvas.value.clientWidth / canvas.value.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.value.clientWidth, canvas.value.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.render(scene, camera);
    console.log(renderer.info.render.triangles);
  };
  useEventListener(window, "resize", onResize);
  onResize();
});
</script>

<style scoped>
canvas {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  z-index: -1;
  animation: fade 10s both;
}

@keyframes fade {
  from {
    opacity: 0;
  }
}
</style>
