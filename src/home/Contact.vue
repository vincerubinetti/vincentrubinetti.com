<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useLocalStorage, useScriptTag } from "@vueuse/core";
import { Send } from "lucide-vue-next";
import Outline from "@/components/Outline.vue";

/** form state */
const name = useLocalStorage("name", "");
const email = useLocalStorage("email", "");
const message = useLocalStorage("message", "");

const address = ref("");

const encode = (string = "") =>
  string
    .split("")
    .map((char) => `&#${char.charCodeAt(0)};`)
    .join("");

onMounted(() => {
  /** encode email link to reduce spam */
  const mailto = encode("mailto:vince@vincentrubinetti.com");
  const text = encode("vince@vincentrubinetti.com");

  address.value = `<a href="${mailto}" target="_blank">${text}</a>`;
});

/** google captcha */
const captchaKey = "6LcLcs8ZAAAAAIXUglBHUKmWXLEGzv7vSWWIVLDu";
const getCaptcha = async () => {
  try {
    return window.grecaptcha.execute(captchaKey, { action: "submit" });
  } catch (error) {
    return "";
  }
};

/** send email to server */
const sendEmail = async (args: unknown) =>
  (
    await fetch("email.php", {
      method: "POST",
      body: JSON.stringify(args),
    })
  ).text();

const onSubmit = async (event: Event) => {
  /** avoid nav */
  event.preventDefault();

  /** get form values */
  const form = event.target as HTMLFormElement;
  const { name, email, message } = Object.fromEntries(new FormData(form));

  /** google captcha */
  const token = await getCaptcha();

  /** debug */
  console.groupCollapsed("Token");
  console.info(token);
  console.groupEnd();

  /** send email to server */
  const response = await sendEmail({
    fromAddress: email,
    fromName: name,
    ccAddress: email,
    ccName: name,
    toAddress: "vince@vincentrubinetti.com",
    toName: "Vincent Rubinetti",
    subject: "vincentrubinetti.com email form submission from " + name,
    html: message,
    plain: message,
    token,
  });

  /** debug */
  console.groupCollapsed("Response");
  console.info(response);
  console.groupEnd();

  /** alert response */
  if (response.includes("Mail sent successfully!"))
    window.alert(
      "Message sent successfully! I'll get back to you as soon as I can.",
    );
  else
    window.alert(
      "Sorry, there was an issue sending your message. Try emailing me directly.",
    );
};

useScriptTag("https://www.google.com/recaptcha/api.js");
</script>

<template>
  <section class="bg-cream">
    <h2 class="sr-only">Contact</h2>

    <div class="grid grid-cols-2 gap-12 max-lg:grid-cols-1">
      <div class="flex flex-col gap-4">
        <p>
          To use the <b>3Blue1Brown music</b>,
          <a
            href="https://vincerubinetti.github.io/using-the-music-of-3blue1brown/"
            >go here</a
          >.
        </p>
        <p>
          If you want to use my other music in your videos/projects, commission
          custom music or other services, or just chat, please write me a
          message.
        </p>
        <span v-html="address" />
      </div>

      <form
        class="flex flex-col gap-4"
        @submit="onSubmit"
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
        <button type="submit" class="button"><Outline /><Send />Send</button>
      </form>
    </div>
  </section>
</template>
