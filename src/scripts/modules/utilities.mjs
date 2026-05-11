import { is } from "./type.mjs";

export const alphabet = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
];

export function duplicateNode(node) {
  let clone;
  try {
    s;
    clone = node.cloneNode(true);
    clone.id = getRandomId();
    clone.querySelectorAll("*").forEach((child) => {
      child.id = getRandomId();
    });
  } catch (error) {
    clone = document.createElement("div");
    console.groupCollapsed(`Could not duplicate ${node}.`);
    console.error(error);
    console.warn(`duplicateNode() returned ${clone} instead.`, clone);
    console.groupEnd();
  } finally {
    return clone;
  }
}
export function getRandomId() {
  let randomString = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
  for (var i = 0; i < 4; ++i) randomString = alphabet[Math.floor(Math.random() * 26)] + randomString;
  return randomString;
}
export function getQueue() {
  let queue;
  try {
    queue = document.querySelector("#utility-queue");
    if (queue === null) {
      queue = document.createElement("div");
      queue.id = "utility-queue";
      queue.style.display = "none";
      queue["aria-hidden"] = "true";
      document.body.append(queue);
    }
  } catch (error) {
    console.groupCollapsed(`Could not get #extension-queue.`);
    console.error(error);
    console.warn(`getQueue() returned ${queue} instead.`);
    console.groupEnd();
  } finally {
    return queue;
  }
}
export function showPlaceValues(number = 0, quantity = 2) {
  // the number parameter can be typeof string or number
  // coerce it to a string, regardless of type, and split at the decimal
  let str = number.toString().split(".");
  // if the string doesn't have a decimal, add trailing zeros
  if (str.length === 1) return `${str[0]}.00`;
  // if it does has a decimal
  if (str.length > 1) {
    // make sure there are at least place values to match quantity
    if (str[1].length < quantity) {
      let trailingZeros = "";
      for (let i = 0; i < quantity; ++i) trailingZeros += "0";
      str[1] += trailingZeros;
    }
    // trim the place values to match quantity
    return `${str[0]}.${str[1].substring(0, quantity)}`;
  }
}

/**
 * Encrypts a string using a password-derived key (PBKDF2 + AES-GCM).
 * @param {string} text - The text to encrypt.
 * @param {string} password - The password to derive the key from.
 * @returns {Promise<Object>} - { ciphertext, iv, salt } as Base64 strings.
 */
export async function encrypt(text, password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(text),
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv),
    salt: arrayBufferToBase64(salt),
  };
}

/**
 * Decrypts a string using a password-derived key (PBKDF2 + AES-GCM).
 * @param {Object} encryptedData - { ciphertext, iv, salt } as Base64 strings.
 * @param {string} password - The password to derive the key from.
 * @returns {Promise<string>} - The decrypted plaintext.
 */
export async function decrypt(encryptedData, password) {
  const { ciphertext, iv, salt } = encryptedData;

  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: base64ToArrayBuffer(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToArrayBuffer(iv) },
    key,
    base64ToArrayBuffer(ciphertext),
  );

  return new TextDecoder().decode(decrypted);
}

/**
 * Converts an ArrayBuffer to a Base64 string.
 * @param {ArrayBuffer} buffer
 * @returns {string}
 */
export function arrayBufferToBase64(buffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts a Base64 string to an ArrayBuffer.
 * @param {string} base64
 * @returns {ArrayBuffer}
 */
export function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
