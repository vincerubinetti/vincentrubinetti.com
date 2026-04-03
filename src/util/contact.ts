import { onMounted, ref } from "vue";

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
  });

  return address;
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
  });

  /** debug */
  console.groupCollapsed("Response");
  console.debug(response);
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
