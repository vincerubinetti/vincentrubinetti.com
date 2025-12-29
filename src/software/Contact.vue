<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";
import { Send } from "lucide-vue-next";
import { onSubmit, useAddress, useCaptcha } from "@/util/contact";
import Dash from "./components/Dash.vue";

/** form state */
const name = useLocalStorage("name", "");
const email = useLocalStorage("email", "");
const message = useLocalStorage("message", "");

const address = useAddress();
useCaptcha();
</script>

<template>
  <section class="paper bg-light">
    <h2>Contact<Dash /></h2>

    <div class="grid grid-cols-2 gap-12 max-lg:grid-cols-1">
      <div class="flex flex-col gap-4">
        <p>Please write me a message!</p>
        <p v-html="address" />
      </div>

      <form
        class="flex flex-col gap-4"
        @submit="onSubmit($event, name, email, message)"
        aria-label="Contact form"
      >
        <input v-model="name" required name="name" placeholder="Full Name" />
        <input
          v-model="email"
          required
          type="email"
          name="email"
          placeholder="Email"
        />
        <textarea
          v-model="message"
          required
          name="message"
          placeholder="Message"
          rows="5"
        />
        <button type="submit" class="button"><Send />Send</button>
      </form>
    </div>
  </section>
</template>
