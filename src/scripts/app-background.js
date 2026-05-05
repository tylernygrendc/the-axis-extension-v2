import { cleanStorage } from "./library/chrome-storage";

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  try {
    switch (req.type) {
      case "storage":
        //* to get stored records
        if (req.method === "get") {
          // look for matching records
          chrome.storage[req.location].get(req.query).then((records) => {
            // separate expired and unexpired
            const expiredRecords = [],
              unexpiredRecords = [];
            for (const [key, record] of Object.entries(records)) {
              if (record?.expiration < Date.now()) expiredRecords.push(key);
              else unexpiredRecords.push({ [key]: record });
            }
            // remove expired records
            if (expiredRecords.length) chrome.storage[req.location].remove(expiredRecords);
            // return unexpired records
            sendResponse(unexpiredRecords);
          });
          return true; // keeps the connection open
          //* to store new records
        } else if (req.method === "set") {
          for (const [key, record] of Object.entries(req.content)) {
            chrome.storage[req.location].set({
              [key]: {
                tabId: sender.tab.id,
                timestamp: new Date().now(),
                expiration: req.expires,
                content: record,
              },
            });
          }
          sendResponse({ ok: true });
          return true; // keeps the connection open
        }
      case "fetch":
        // add the oauth token before fetching
        chrome.storage.sync.get("oauthToken").then((records) => {
          // only if the token has been stored
          // ! don't send token with login requests
          if (records && req.resource !== "https://axis.thejoint.com/rest/v11_24/oauth2/token") {
            req.options.headers = {
              "OAuth-Token": records.oauthToken ? records.oauthToken.body : "",
            };
          }
          // add oauth to bulk requests, if applicable
          if (req.options.body.requests)
            req.options.body.requests.forEach((request) => {
              request.options.headers = {
                "OAuth-Token": records.oauthToken ? records.oauthToken.body : "",
              };
            });
          // stringify body (to prevent 422 error)
          if (typeof req.options.body === "object") req.options.body = JSON.stringify(req.options.body);
          // fetch the resource
          fetch(req.resource, req.options)
            .then((response) => {
              const result = {
                ok: response.ok,
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries()),
                url: response.url,
              };
              const contentType = response.headers.get("content-type") || "";
              if (contentType.includes("application/pdf") || req.resource.includes("download=true")) {
                response.arrayBuffer().then((buffer) => {
                  result.body = Array.from(new Uint8Array(buffer));
                  result.isBinary = true;
                  sendResponse(result);
                });
              } else {
                response.text().then((text) => {
                  result.body = text;
                  result.isBinary = false;
                  sendResponse(result);
                });
              }
            })
            .catch((error) => {
              sendResponse({ ok: false, statusText: error.message });
            });
        });
        return true;
    }
  } catch (error) {
    console.error(error);
    sendResponse({
      ok: false,
      statusText: error,
    });
  }
});
