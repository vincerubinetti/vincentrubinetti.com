<script setup lang="ts">
import { IconSend } from "@tabler/icons-vue";
import { useLocalStorage } from "@vueuse/core";
import { onSubmit, useAddress } from "@/util/contact";
import Divider from "./components/Divider.vue";

/** form state */
const name = useLocalStorage("name", "");
const email = useLocalStorage("email", "");
const message = useLocalStorage("message", "");

const address = useAddress();
</script>

<template>
  <section>
    <h2>Contact<Divider /></h2>

    <div class="grid grid-cols-2 gap-(--gap) max-lg:grid-cols-1">
      <div class="flex flex-col gap-4">
        <p>
          I'm passionate about software and always happy to chat about it.
          Please write me a message!
        </p>
        <p v-html="address" />
      </div>

      <form
        class="flex flex-col gap-4"
        title="Contact form"
        @submit="onSubmit($event, name, email, message)"
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
        <button type="submit" class="button-big"><IconSend />Send</button>
      </form>
    </div>
  </section>
</template>
