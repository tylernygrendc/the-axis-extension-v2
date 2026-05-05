export async function frontOfficeFetch(resource = "", options = {}) {
  try {
    let response = await chrome.runtime.sendMessage({
      type: "fetch",
      resource: resource,
      options: options,
    });
    if(response.ok) {
      return {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
        url: response.url,
        json: async () => {
          const text = response.isBinary ? new TextDecoder().decode(new Uint8Array(response.body)) : response.body;
          return JSON.parse(text);
        },
        text: async () => {
          response.isBinary ? new TextDecoder().decode(new Uint8Array(response.body)) : response.body;
        },
        arrayBuffer: async () => {
          if (response.isBinary) return new Uint8Array(response.body).buffer;
          return new TextEncoder().encode(response.body).buffer;
        },
      };
    } else {
      throw new Error("No response received from background script.");
    }
  } catch (error) {
    console.error(error);
    return {
      ok: false,
      statusText: error.message,
    };
  }
}

export function frontOfficeBulkFetch(requests = [], options = {}) {
  try {
    // modify options for bulk fetch
    options = Object.assign(options, { requests: requests, method: "POST" });
    // fetch normally via frontOfficeFetch
    return await frontOfficeFetch("https://axis.thejoint.com/rest/v11_24/bulk", options);
  } catch (error) {
    console.error(error);
  }
}

export function frontOfficeLogin(email, password) {

}

export function frontOfficeRefresh() {
  // get refresh token
  let record = await contentStorage.get("refreshToken", "sync");
  
  if (record.ok) {
    const api = frontOfficeAPI.refresh(record.results?.refreshToken);
    let response = await frontOfficeFetch(api.url, {
      method: api.method,
      body: api.body
    });
    response = await response.json();
  } else {

  }
  
  .then((res) => {
        if (res.ok) {
          // update tokens
          res.json().then((json) => {
            contentStorage
              .set(
                {
                  oauthToken: json.access_token,
                },
                "sync",
                toMS.s(json.expires_in),
              )
              .then((error) => {
                if (error) console.error(error);
              });
            contentStorage
              .set(
                {
                  refreshToken: json.refresh_token,
                },
                "sync",
                toMS.s(json.refresh_expires_in),
              )
              .then((error) => {
                if (error) console.error(error);
              });
            contentStorage
              .set(
                {
                  downloadToken: json.download_token,
                },
                "sync",
              )
              .then((error) => {
                if (error) console.error(error);
              });
          });
          // avoid conflict with open front office
          if (window.location.hostname === "axis.thejoint.com") {
            // store tokens locally
            localStorage.setItem("prod:SugarCRM:AuthAccessToken", res.access_token);
            localStorage.setItem("prod:SugarCRM:AuthRefreshToken", res.refresh_token);
            localStorage.setItem("prod:SugarCRM:DownloadToken", res.download_token);
          }
        } else {
          throw new Error(res.statusText);
        }
      });
    else console.error(result.statusText);
  });
}
