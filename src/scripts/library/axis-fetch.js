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
        try { return typeof this.body === "object" ? this.body : JSON.parse(this.body); } 
        catch { return {}; }
      },
      async text() {
        return String(this.body);
      },
    }
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
  try {
    // modify options for bulk fetch
    options = Object.assign(options, { body: { requests: requests }, method: "POST" });
    // fetch normally via frontOfficeFetch
    return await frontOfficeFetch("https://axis.thejoint.com/rest/v11_24/bulk", {
      method: "POST",
      credentials: "include",
      body: { requests: requests }
    });
  } catch (error) {
    console.error(error);
  }
}

// login to front office from anywhere via app-background.js
export async function frontOfficeLogin(email, password) {
  const api = frontOfficeAPI.login(email, password);
  let response = await frontOfficeFetch(api.fetchRequest, api.fetchOptions);
  if(response.ok) {
    response = await response.json();
    // update auth tokens in chrome.storage
    await contentStorage.set({
      access_token: response.access_token,
      download_token: response.download_token
    }, "sync", toMS.s(response.expires_in));
    await contentStorage.set({
      refresh_token: response.refresh_token,
    }, "sync", toMS.s(response.refresh_expires_in));
    // avoid conflict with open front office tabs
    await updateTokensInAllFrontOfficeTabs(response.access_token, response.refresh_token, response.download_token);
  } else {
    // there was a login error
  }
}

export function frontOfficeRefresh() {
  // get refresh token
  let record = await contentStorage.get("refreshToken", "sync");
  // attempt refresh
  if (record.ok) {
    const api = frontOfficeAPI.refresh(record.results?.refreshToken);
    // TODO switch to api.fetchRequest
    let response = await frontOfficeFetch(api.url, {
      method: api.method,
      body: api.body
    });
    if(response.ok) {
      response = await response.json();
      // update auth tokens in chrome.storage
      await contentStorage.set({
        access_token: response.access_token,
        download_token: response.download_token
      }, "sync", toMS.s(response.expires_in));
      await contentStorage.set({
        refresh_token: response.refresh_token,
      }, "sync", toMS.s(response.refresh_expires_in));
      // avoid conflict with open front office tabs
      await updateTokensInAllFrontOfficeTabs(response.access_token, response.refresh_token, response.download_token);
    } else {
      // there was a login error
    }
  } else {
    // new login is necessary
  }
}

async function updateTokensInAllFrontOfficeTabs(oauthToken, refreshToken, downloadToken) {
  // find all front office contexts
  const frontOfficeTabs = await chrome.tabs.query({ url: "https://axis.thejoint.com/*" });
  if (frontOfficeTabs.length) {
    // wait for all open contexts to receive updated auth tokens
    await chrome.scripting.executeScript({
      target: { tabIds: frontOfficeTabs.map(tab => tab.id) },
      func: (oauthToken, refreshToken, downloadToken) => {
        localStorage.setItem("oauth_token", oauthToken);
        localStorage.setItem("refresh_token", refreshToken);
        localStorage.setItem("download_token", downloadToken);
      },
      args: [oauthToken, refreshToken, downloadToken] // Passes tokenData into the 'token' parameter above
    });
  }
  return true;
}
