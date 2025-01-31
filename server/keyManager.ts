
const encoder = new TextEncoder();
const keyData = Deno.env.get("SECRET_KEY") || "your_secret_key";

const key: CryptoKey = await crypto.subtle.importKey(
  "raw",
  encoder.encode(keyData),
  { name: "HMAC", hash: "SHA-256" },
  false,
  ["sign", "verify"],
);

export const getKey = (): CryptoKey => {
  if (!key) {
    console.error("Key is not initialized. Ensure `setKey` is called before using `getKey`.");
    throw new Error("Key is not initialized");
  }
  return key;
};
