export async function encryptWithPublicKey(plaintext, publicKeyPem) {
    console.log("plain text: " , plaintext);
  const pem = publicKeyPem
    .replace("-----BEGIN PUBLIC KEY-----", "")
    .replace("-----END PUBLIC KEY-----", "")
    .replace(/\s/g, "");

  const binaryDer = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "spki",
    binaryDer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    false,
    ["encrypt"]
  );

  const encoded = new TextEncoder().encode(plaintext);

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    cryptoKey,
    encoded
  );

  // return base64 for transport
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}
