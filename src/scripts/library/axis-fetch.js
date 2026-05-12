import { frontOfficeAPI } from "./axis-api.js";
import { contentStorage } from "./chrome-storage";

// get front office resources from anywhere, routed via app-background.js
export async function frontOfficeFetch(resource = "", options = {}) {
  try {
    let response = await chrome.runtime.sendMessage({
      type: "fetch",
      resource: resource,
      options: options,
    });
    // repackage with async methods for consistency, and return
    return {
      ...response,
      async json() {
        try {
          return typeof this.body === "object"
            ? this.body
            : JSON.parse(this.body);
        } catch {
          return {};
        }
      },
      async text() {
        return String(this.body);
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      statusText: error.message,
    };
  }
}

// perform multiple front office get requests form anywhere using bulk api
export async function frontOfficeBulkFetch(requests = []) {
  // modify options for bulk fetch
  options = Object.assign(options, {
    body: { requests: requests },
    method: "POST",
  });
  // fetch normally via frontOfficeFetch
  // ? frontOfficeFetch handles its own errors
  return await frontOfficeFetch("https://axis.thejoint.com/rest/v11_24/bulk", {
    method: "POST",
    credentials: "include",
    body: { requests: requests },
  });
}

// login to back office from anywhere via app-background.js
export async function backOfficeLogin(token, email, password, status) {
  try {
    const api = backOfficeAPI.login(token, email, password, status);
    await frontOfficeLogin(email, password);
    await fetch(api.fetchRequest, api.fetchOptions);
    // TODO allow user to set default resource
    window.open("https://backoffice.thejoint.com/pending-notes", "_self");
  } catch (error) {
    console.error(error);
  }
}

// login to front office from anywhere via app-background.js
export async function frontOfficeLogin(email, password) {
  try {
    const api = frontOfficeAPI.login(email, password);
    let response = await frontOfficeFetch(api.fetchRequest, api.fetchOptions);
    if (response.ok) {
      response = await response.json();
      // update auth tokens in chrome.storage
      await contentStorage.set(
        {
          access_token: response.access_token,
          download_token: response.download_token,
        },
        "sync",
        toMS.s(response.expires_in),
      );
      await contentStorage.set(
        {
          refresh_token: response.refresh_token,
        },
        "sync",
        toMS.s(response.refresh_expires_in),
      );
      // avoid conflict with open front office tabs
      await updateTokensInAllFrontOfficeTabs(
        response.access_token,
        response.refresh_token,
        response.download_token,
      );
      // TODO update carbon credentails
    } else {
      throw new Error(response.statusText);
    }
    return { ok: true };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      statusText: error,
    };
  }
}

export async function frontOfficeRefresh() {
  try {
    // get refresh token
    let record = await contentStorage.get("refreshToken", "sync");
    // attempt refresh
    if (typeof record?.refreshToken === "string") {
      const api = frontOfficeAPI.refresh(record.refreshToken);
      let response = await frontOfficeFetch(api.fetchRequest, api.fetchOptions);
      if (response.ok) {
        response = await response.json();
        // update auth tokens in chrome.storage
        await contentStorage.set(
          {
            access_token: response.access_token,
            download_token: response.download_token,
          },
          "sync",
          toMS.s(response.expires_in),
        );
        await contentStorage.set(
          {
            refresh_token: response.refresh_token,
          },
          "sync",
          toMS.s(response.refresh_expires_in),
        );
        // avoid conflict with open front office tabs
        await updateTokensInAllFrontOfficeTabs(
          response.access_token,
          response.refresh_token,
          response.download_token,
        );
        return { ok: true };
      } else {
        throw new Error(response.statusText);
      }
    } else {
      throw new Error("Refresh token does not exist in chrome.storage.sync.");
    }
  } catch (error) {
    // console.info(error);
    return {
      ok: false,
      statusText: error,
    };
  }
}

async function updateTokensInAllFrontOfficeTabs(
  oauthToken,
  refreshToken,
  downloadToken,
) {
  // find all front office contexts
  const frontOfficeTabs = await chrome.tabs.query({
    url: "https://axis.thejoint.com/*",
  });
  if (frontOfficeTabs.length) {
    // wait for all open contexts to receive updated auth tokens
    await chrome.scripting.executeScript({
      target: { tabIds: frontOfficeTabs.map((tab) => tab.id) },
      func: (oauthToken, refreshToken, downloadToken) => {
        localStorage.setItem("oauth_token", oauthToken);
        localStorage.setItem("refresh_token", refreshToken);
        localStorage.setItem("download_token", downloadToken);
      },
      args: [oauthToken, refreshToken, downloadToken], // passes tokenData into the 'token' parameter above
    });
  }
  return true;
}
