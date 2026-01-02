<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { Send } from "lucide-vue-next";
import { onSubmit, useAddress, useCaptcha } from "@/util/contact";
import Outline from "./components/Outline.vue";

/** form state */
const name = useLocalStorage("name", "");
const email = useLocalStorage("email", "");
const message = useLocalStorage("message", "");

const address = useAddress();
useCaptcha();
</script>

<template>
  <section class="bg-light">
    <h2 class="sr-only">Contact</h2>

    <div class="grid grid-cols-2 gap-12 max-lg:grid-cols-1">
      <div class="flex flex-col gap-4">
        <p>
          To use the <b>3Blue1Brown music</b> in videos or projects,
          <a
            href="https://vincerubinetti.github.io/using-the-music-of-3blue1brown/"
            >go here</a
          >.
        </p>
        <p>
          If you want to use my other music, commission custom music or other
          services, or just chat about anything, please write me a message.
        </p>
        <p v-html="address" />
      </div>

      <form
        class="flex flex-col gap-4"
        @submit="onSubmit($event, name, email, message)"
        aria-label="Contact form"
      >
        <input
          v-model="name"
          required
          name="name"
          autocomplete="name"
          placeholder="Full Name"
        />
        <input
          v-model="email"
          required
          type="email"
          name="email"
          autocomplete="email"
          placeholder="Email"
        />
        <textarea
          v-model="message"
          required
          name="message"
          placeholder="Message"
          rows="5"
        />
        <button type="submit" class="button"><Outline /><Send />Send</button>
      </form>
    </div>
  </section>
</template>
