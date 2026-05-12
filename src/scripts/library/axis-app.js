import {
  backOfficeLogin,
  frontOfficeLogin,
  frontOfficeRefresh,
} from "./axis-fetch";
export class App {
  constructor() {
    this.isFrontOffice = /axis/gi.test(window.location.hostname) ? true : false;
    this.isBackOffice = !this.isFrontOffice;
  }
  async resource() {
    if (this.isBackOffice) {
      return window.location.pathname.split("/")[1];
    } else if (this.isFrontOffice) {
      const authRefresh = await frontOfficeRefresh();
      const resource = window.location.hash.split("/")[0].slice(1);
      if (authRefresh.ok) return resource;
      else return "login";
    }
  }
  async injectUI() {
    const resource = await this.resource();
    if (resource === "login") {
      listenForLogin();
    } else {
      // inject UI
      if (this.isBackOffice) {
      } else if (this.isFrontOffice) {
        // rerender is not needed with page transition in front office
      }
    }
  }
}

function listenForLogin() {
  document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    // only back office supplies a csrf token at login
    if (formData?._token) {
      await backOfficeLogin(
        formData._token,
        formData.user_name,
        formData.password,
        formData.doctor_status,
      );
    } else if (formData?.username) {
      // front office credenials are slightly different
      await frontOfficeLogin(formData.username, formData.password);
    }
  });
}
