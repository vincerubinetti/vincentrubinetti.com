<template>
  <AppSection v-appear id="contact" heading="Contact">
    <p>
      To use the <b>3Blue1Brown music</b>,
      <a
        href="https://vincerubinetti.github.io/using-the-music-of-3blue1brown/"
        target="_blank"
        >go here</a
      >. If you want to use my other music in your videos/projects, commission
      custom music or other services, or just talk about anything interesting,
      please write me a message:
    </p>

    <div v-html="vinceEmail" v-appear />

    <form v-appear class="form" @submit="onSubmit">
      <input
        v-model="name"
        class="textbox"
        required
        name="name"
        placeholder="Full Name"
      />
      <input
        v-model="email"
        class="textbox"
        required
        type="email"
        name="email"
        placeholder="Email"
      />
      <textarea
        v-model="message"
        class="textbox"
        required
        name="message"
        placeholder="Message"
        rows="5"
      />
      <AppButton type="submit" icon="envelope" text="SEND" :outline="true" />
    </form>
  </AppSection>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useLocalStorage, useScriptTag } from "@vueuse/core";

const name = useLocalStorage("name", "");
const email = useLocalStorage("email", "");
const message = useLocalStorage("message", "");

const vinceEmail = ref("");

onMounted(() => {
  /** encode email link to reduce spam */
  const address = "vince@vincentrubinetti.com";
  const encode = (string = "") =>
    string
      .split("")
      .map((char) => `&#${char.charCodeAt(0)};`)
      .join("");
  vinceEmail.value = `<a href="${encode(
    "mailto:" + address
  )}" target="_blank">${encode(address)}</a>`;
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
  console.log(token);
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
  console.log(response);
  console.groupEnd();

  /** alert response */
  if (response.includes("Mail sent successfully!"))
    alert("Message sent successfully! I'll get back to you as soon as I can.");
  else
    alert(
      "Sorry, there was an issue sending your message. Try emailing me directly; my email address is right next to the contact form."
    );
};

useScriptTag("https://www.google.com/recaptcha/api.js");
</script>

<style scoped>
.form {
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: center;
  align-items: stretch;
  flex-direction: column;
  gap: 20px;
}

.textbox {
  padding: 0.5em 1em;
  border: solid 1px var(--light-gray);
  border-radius: var(--rounded);
  font: inherit;
  box-shadow: none;
  resize: vertical;
  transition: var(--fast);
  transition-property: box-shadow, transform;
}

.textbox:focus {
  transform: scale(1.03);
  box-shadow: var(--shadow);
  z-index: 1;
}
</style>
