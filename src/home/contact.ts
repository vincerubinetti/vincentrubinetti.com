import { onMounted, ref } from "vue";
import { useScriptTag } from "@vueuse/core";

/** encoded email address link to reduce spam */
export const useAddress = () => {
  const address = ref("");

  const encode = (string = "") =>
    string
      .split("")
      .map((char) => `&#${char.charCodeAt(0)};`)
      .join("");

  onMounted(() => {
    const mailto = encode("mailto:vince@vincentrubinetti.com");
    const text = encode("vince@vincentrubinetti.com");
    address.value = `<a href="${mailto}" target="_blank">${text}</a>`;
    console.log("hi");
  });

  return address;
};

/** google captcha */
export const useCaptcha = () =>
  useScriptTag("https://www.google.com/recaptcha/api.js");

const getCaptcha = async () => {
  try {
    const key = "6LcLcs8ZAAAAAIXUglBHUKmWXLEGzv7vSWWIVLDu";
    return window.grecaptcha.execute(key, { action: "submit" });
  } catch (error) {
    return "";
  }
};

/** send email to server */
const sendEmail = async (args: unknown) =>
  (
    await fetch("email.php", { method: "POST", body: JSON.stringify(args) })
  ).text();

/** form submit */
export const onSubmit = async (
  event: Event,
  name: string,
  email: string,
  message: string,
) => {
  /** avoid nav */
  event.preventDefault();

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
