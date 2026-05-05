import { frontOfficeAPI } from "./axis-api.js";
import { frontOfficeFetch } from "./axis-fetch.js";
import { contentStorage } from "./chrome-storage";

export class User {
  /// a class representing the current user
  /// instantiate with `const user = await User.get();`
  constructor(axisUserObject) {
    Object.assign(this, axisUserObject);
  }
  /// necessary for back office authentication
  /// send csrfToken with all non-login fetch requests
  get csrfToken() {
    return document.querySelector("meta[name=csrf-token]")?.content;
  }
  /// necessary for front office authentication
  /// send oauthToken with all non-login fetch requests
  get oauthToken() {
    return localStorage.getItem("prod:SugarCRM:AuthAccessToken");
  }
  //* get the current user
  static async get() {
    try {
      const api = frontOfficeAPI.getUser();
      // get user details from axis
      let response = await frontOfficeFetch(api.url);
      if (response.ok) response = await response.json();
      else throw new Error(response.statusText);
      // return a user instance
      return new User(response);
    } catch (error) {
      console.error(error);
      return {}; // return empty object if error
    }
  }
  //* get clinic from axis
  async clinic(id) {
    try {
      const api = frontOfficeAPI.getClinicById(id);
      // get clinic from axis
      let response = await frontOfficeFetch(api.url);
      if (response.ok) response = await response.json();
      else throw new Error(response.statusText);
      // return the clinic
      return response;
    } catch {
      console.error(error);
      return {}; // return empty object if error
    }
  }
  //* get all clinics a user can access
  async authorizedClinics() {
    try {
      const api = frontOfficeAPI.getAuthorizedClinics();
      // get all authorized clinics
      let response = await frontOfficeFetch(api.url);
      if (response.ok) response = await response.json();
      else throw new Error(response.statusText);
      // return resultant object
      return response;
    } catch {
      console.error(error);
      return {}; // return empty object if error
    }
  }
  //* determine if this is the primary extension user
  async isPrimary() {
    // get the primary user from chrome.storage
    const record = await contentStorage.get("primaryUser", "sync");
    // return true if primary user is current user
    return record?.results?.primaryUser?.username === this.username;
  }
}
