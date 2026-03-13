export function frontOfficeFetch(resource = "", options = {}) {
  return chrome.runtime
    .sendMessage({
      type: "fetch",
      resource: resource,
      options: options,
    })
    .then((res) => {
      if (!res) throw new Error("No response received from background script.");
      return {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        headers: new Headers(res.headers),
        url: res.url,
        json: async () => {
          const text = res.isBinary
            ? new TextDecoder().decode(new Uint8Array(res.body))
            : res.body;
          return JSON.parse(text);
        },
        text: async () => {
          res.isBinary
            ? new TextDecoder().decode(new Uint8Array(res.body))
            : res.body;
        },
        arrayBuffer: async () => {
          if (res.isBinary) return new Uint8Array(res.body).buffer;
          return new TextEncoder().encode(res.body).buffer;
        },
      };
    });
}

export function frontOfficeRefresh() {
  contentStorage.get("refreshToken", "sync").then((record) => {
    if (record.ok)
      frontOfficeFetch(
        `https://axis.thejoint.com/rest/v11_24/oauth2/token?platform=base`,
        {
          method: "POST",
          body: {
            grant_type: "refresh_token",
            refresh_token: record.results.refreshToken,
            refresh: true,
          },
        },
      ).then((res) => {
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
            localStorage.setItem(
              "prod:SugarCRM:AuthAccessToken",
              res.access_token,
            );
            localStorage.setItem(
              "prod:SugarCRM:AuthRefreshToken",
              res.refresh_token,
            );
            localStorage.setItem(
              "prod:SugarCRM:DownloadToken",
              res.download_token,
            );
          }
        } else {
          throw new Error(res.statusText);
        }
      });
    else console.error(result.statusText);
  });
}
