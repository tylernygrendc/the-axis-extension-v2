import { App } from "./library/axis-app.js";
import { el } from "./_element.mjs";

// inject script dependencies
document.body.append(
  document.createComment("praktiki for axis"),
  el({
    tagName: "script",
    attributes: { defer: "", type: "module" },
    src: chrome.runtime.getURL("scripts/components.js"),
  }),
  el({
    tagName: "script",
    attributes: { defer: "", type: "module" },
    src: chrome.runtime.getURL("scripts/pdf.js"),
  }),
);

const app = new App();

// show the correct ui
app.connectSheet();
// and make sure ui updates with navigation (for front office)
window.addEventListener("popstate", (e) => {
  app.disconnect();
  app.connectSheet();
});
