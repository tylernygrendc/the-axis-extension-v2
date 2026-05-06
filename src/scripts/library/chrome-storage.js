import { toMS } from "../_date.mjs";
import { is, coerce } from "../_type.mjs";
export const contentStorage = {
  set: async (obj = {}, location = "sync", expires = toMS.h(10)) => {
    // route storage through app-background.js
    return await chrome.runtime.sendMessage({
      type: "storage",
      method: "set",
      location: location,
      expires: Date.now() + expires,
      content: coerce.object(obj),
    });
  },
  get: async (query = [], location = "sync") => {
    return await chrome.runtime.sendMessage({
      type: "storage",
      method: "get",
      location: location,
      query: coerce.array(query),
    });
  },
};
