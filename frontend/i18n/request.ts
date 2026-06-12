// frontend/i18n/request.ts

export type Locale = "en" | "hi" | "te";

export async function getMessages(locale: Locale) {
  try {
    const messages = await import(`../messages/${locale}.json`);
    return messages.default;
  } catch (error) {
    console.error("Failed to load messages for locale:", locale);
    return (await import("../messages/en.json")).default;
  }
}
