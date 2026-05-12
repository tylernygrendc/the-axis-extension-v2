import * as pdfjsLib from "pdfjs-dist";

chrome.runtime.onMessage.addListener(async (req, sender, sendResponse) => {
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
            if (expiredRecords.length)
              chrome.storage[req.location].remove(expiredRecords);
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
                timestamp: Date.now(),
                expiration: req.expires,
                content: record,
              },
            });
          }
          sendResponse({ ok: true });
        }
      case "fetch":
        // add the oauth token before fetching
        const records = await chrome.storage.sync.get("oauth_token");
        // continue if the token is found
        if (records?.oauth_token) {
          // add oauth token to every bulk request item if necessary
          if (req.options?.body?.requests) {
            req.options.body.requests.forEach((request) => {
              request.options = {
                ...request.options,
                headers: {
                  ...request.options?.headers,
                  "OAuth-Token": records.oauth_token.content,
                },
              };
            });
          }
          // then attempt the fetch
          const response = await fetch(req.resource, req.options);
          // prepare the result for sending via sendMessage()
          const result = {
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            url: response.url,
          };
          // handle content based on content type
          const contentType = response.headers.get("content-type") || "";
          // for pdf downloads
          if (
            contentType.includes("application/pdf") ||
            req.resource.includes("download=true")
          ) {
            result.body = await getPDFText(await response.arrayBuffer());
            sendResponse(result);
            // for json
          } else if (contentType.includes("application/json")) {
            result.body = await response.json();
            // for everything else
          } else {
            result.body = await response.text();
            sendResponse(result);
          }
        } else {
          // TODO attempt refresh
        }
    }
  } catch (error) {
    // TODO handle errors
  }
  return true; // keeps the connection open for all cases
});

async function getPDFText(arrayBuffer) {
  let fullText = "";
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  // iterate through pdf pages and scrape text
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str);
    fullText += strings.join(" ") + "\n";
  }
  return fullText;
}
