function capitalize(string = "", firstOnly = true) {
  return string
    .split(firstOnly ? /(\.\s+)|(?=^[A-Z])/gi : /(\s+)/g)
    .reduce((acc, cv) => {
      acc += cv.charAt(0).toUpperCase() + cv.slice(1);
      return acc;
    }, "");
}
function kebabCase(string) {
  return string.split(/(?=[A-Z])|_|\s/g).reduce((acc, cv, i, initialArray) => {
    return i < initialArray.length - 1
      ? (acc += `${cv.toLowerCase()}-`)
      : (acc += cv.toLowerCase());
  }, "");
}
function numberText(number) {
  const onesLookup = {
    0: "zero",
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
    7: "seven",
    8: "eight",
    9: "nine",
  };
  const tensLookup = {
    2: "twenty",
    3: "thirty",
    4: "forty",
    5: "fifty",
    6: "sixty",
    7: "seventy",
    8: "eighty",
    9: "ninety",
  };
  const teensLookup = {
    10: "ten",
    11: "eleven",
    12: "twelve",
    13: "thirteen",
    14: "fourteen",
    15: "fifteen",
    16: "sixteen",
    17: "seventeen",
    18: "eighteen",
    19: "nineteen",
  };

  number = Math.round(Number(number));

  if (number === 0) return "zero";
  if (number > 9999) return number;

  return number
    .toString()
    .split("")
    .reverse()
    .reduce((acc, cv, i, a) => {
      const val = Number(cv);
      // ONES
      if (i === 0) {
        acc = val === 0 ? "" : onesLookup[val];
      }
      // TENS
      if (i === 1) {
        if (val === 1) {
          acc = teensLookup[Number(cv + a[0])];
        } else if (val > 1) {
          acc = tensLookup[val] + (acc ? "-" + acc : "");
        }
      }
      // HUNDREDS
      if (i === 2 && val > 0) {
        acc = `${onesLookup[val]} hundred ${acc}`.trim();
      }
      // THOUSANDS
      if (i === 3 && val > 0) {
        acc = `${onesLookup[val]} thousand ${acc}`.trim();
      }

      return acc;
    }, "");
}
function oneLine(string, preserveSpace = false) {
  return string.replace(/[\n\r\t\s]/g, preserveSpace ? " " : "");
}

const alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
function getRandomId(){
    let randomString = window.crypto.getRandomValues(new Uint32Array(1))[0].toString(16);
    for(var i = 0; i < 4; ++i) randomString = alphabet[Math.floor(Math.random() * 26)] + randomString;
    return randomString;
}

const coerce = {
    array: (array, fallback = []) => {
        if(is.array(array)) return array;
        else return fallback;
    },
    boolean: (boolean, fallback = false) => {
        if(is.boolean(boolean)) return boolean;
        else return fallback;
    },
    element: (element, fallback = Element) => {
        if(is.element(element)) return element;
        else return fallback;
    },
    function: (f, fallback = function(){}) => {
        if(is.function(f)) return f;
        else return fallback;
    },
    number: (number = 0, fallback = 0) => {
        if(is.number(number)) return number;
        else return fallback;
    },
    object: (object = {}, fallback = {}) => {
        if(is.object(object)) return object;
        else return fallback;
    },
    string: (string = "", fallback = "") => {
        if(is.string(string)) return string;
        else return fallback;
    }
};
const is = {
    array: (thing) => {
        if(Array.isArray(thing)) return true;
        else return false;
    },
    boolean: (thing) => {
        if(typeof thing === "boolean") return true;
        else return false;
    },
    element: (thing) => {
        if(thing instanceof Element) return true;
        else return false;
    },
    function: (thing) => {
        if(typeof thing === "function") return true;
        else return false;
    },
    null: (thing) => {
        if(thing === null) return true;
        else return false;
    },
    number: (thing) => {
        if(typeof thing === "number") return true;
        else return false;
    },
    object: (thing) => {
        if(typeof thing === "object" && !Array.isArray(thing) && thing != null) return true;
        else return false;
    },
    string: (thing) => {
        if(typeof thing === "string") return true;
        else return false;
    },
    undefined: (thing) => {
        if(thing === undefined) return true;
        else return false;
    }
};

class Listener {
    constructor(event = "", listener = ()=>{} , options = {capture: false, once: false}){
        this.e = event;
        this.f = listener;
        this.o = options;
    }
}

function el(attr = {}) {
    const el = document.createElement(attr.tagName ? attr.tagName : "div");
    if(!(attr.id)) el.id = getRandomId();
    for(const [key, val] of Object.entries(attr)) {
        switch(key){
            case "aria":
                for(const [k, v] of Object.entries(coerce.object(val))) el.setAttribute(`aria-${k}`, v);
                break;
            case "attributes":
                for(const [k, v] of Object.entries(coerce.object(val))) el.setAttribute(k, v);
                break;
            case "children":
                for(const child of coerce.array(val)) if(child instanceof Element) el.append(child);
                break;
            case "classList":
                for(const className of coerce.array(val)) el.classList.add(className); 
                break;
            case "dataset":
                for(const [k, v] of Object.entries(coerce.object(val))) el.dataset[k] = v;
                break;
            case "listeners":
                for(const listener of coerce.array(val)){
                    if(listener instanceof Listener) el.addEventListener(listener.e, listener.f, listener.o);
                }
            case "style":
                for(const [k, v] of Object.entries(coerce.object(val))) el.style[kebabCase(k)] = val;
                break;
            default:
                el[key] = val;
                break;
        }
    }
    return el;
}

const dayNames = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const monthNames = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

function dateText(
  date = new Date(),
  abbreviated = false,
  leadingDay = true,
) {
  let day = dayNames[date.getDay()],
    month = monthNames[date.getMonth()],
    dd = date.getDate().toString(),
    year = date.getFullYear().toString();
  dd = dd.length < 2 ? `0${dd}` : dd; // format date
  if (abbreviated && leadingDay)
    return `${day.substring(0, 3)} ${month.substring(0, 3)} ${dd}, ${year}`;
  if (!abbreviated && leadingDay) return `${day} ${month} ${dd}, ${year}`;
  if (abbreviated && !leadingDay)
    return `${month.substring(0, 3)} ${dd}, ${year}`;
  if (!abbreviated && !leadingDay) return `${month} ${dd}, ${year}`;
}

function daysBetween(start = new Date(), end = new Date()) {
  return Math.ceil(
    Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
}

function daysIn(month = new Date(), year) {
  if (month instanceof Date) {
    month = month.getMonth();
    year = month.getFullYear();
  } else {
    month = typeof month === "number" ? month : new Date().getMonth();
    year = typeof year === "number" ? year : new Date().getFullYear();
  }
  return [
    31, // January
    !(year % 400) || (!(year % 4) && year % 100) ? 29 : 28, // February
    31, // March
    30, // April
    31, // May
    30, // June
    31, // July
    31, // August
    30, // September
    31, // October
    30, // November
    31, // December
  ][month];
}

const toMS = {
  h: (hrs) => {
    return hrs * 60 * 60000;
  },
  m: (min) => {
    return hrs * 60000;
  },
  s: (sec) => {
    return sec * 1000;
  },
  t: (hrs = 0, min = 0, sec = 0) => {
    return hrs * 60 * 60000 + hrs * 60000 + sec * 1000;
  },
};

const contentStorage = {
    set: async (obj = {}, location = "local", expires = toMS.h(10)) => {
        if(!(is.object(obj))) throw new Error(`Type of "object" is required.`);
        if(!(["sync","session","local"].includes(location))) throw new Error(`Invalid storage location (${location}). Must be one of "sync","session", or "local".`)
        chrome.runtime.sendMessage({
            type: "storage",
            method: "set",
            location: location,
            expires: new Date().getTime() + expires,
            body: obj
        }, (res) => {
            if(res.ok) return true;
            else throw new Error(res.statusText);
        });
    },
    get: async (query = [], location = "local", sameOrigin = null) => {
        keys = coerce.array(keys);
        chrome.runtime.sendMessage({
            type: "storage",
            method: "get",
            sameOrigin: sameOrigin ? sameOrigin : location === "sync" ? false : true,
            location: location,
            body: {
                query: query
            }
        }, (res) => {
            if(res.ok) return true;
            else throw new Error(res.statusText);
        });
    }
};

function frontOfficeFetch(resource = "", options = {}) {
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

// import { PDFParse } from "pdf-parse";
// ! PDFParse is imported at document level to avoid collisions
class Patient {
  constructor(id = "") {
    this.id = id;
    this.visits = [];
    this.problemList = [];
  }
  get previousExam() {
    return this.visits.find((visit) => visit.type != 1);
  }
  get previousVisit() {
    return this.visits[0];
  }
  get isMilitary() {
    return this.is_military;
  }
  get isMedicare() {
    return this.ismedicareeligible_c || Number(this.age_c) >= 65 ? true : false;
  }
  get isMinor() {
    return Number(this.age_c) <= 18 ? true : false;
  }
  get isNew() {
    return this.new_patient_flag_c;
  }
  get needsForms() {
    return this.needs_forms_c || this.abn_c ? true : false;
  }
  get hasBalance() {
    return Number(this.balance) ? true : false;
  }
  get hasBirthday() {
    const dob = new Date(this.birthdate).setFullYear(new Date().getFullYear());
    const daysToBirthday = Math.ceil(
      Math.abs(new Date(dob).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return daysToBirthday <= 7 ? true : false;
  }
  get hasHSA() {
    return this.hsa_or_fsa;
  }
  get hasSeeNotes() {
    return this.see_notes;
  }
  get hasTask() {
    // TODO: add setter (defaults to false)
    return false;
  }
  get hasDoNotCall() {
    return this.do_not_call;
  }
  get hasDoNotAdjust() {
    // TODO: add setter (defaults to false)
    return false;
  }
  getPatient() {
    new Promise((resolve, reject) => {
      // requests for axis bulk api
      const requests = [
        // patient details
        {
          type: "GET",
          dataType: json,
          timeout: 180000,
          contentType: "application/json",
          url: oneLine(
            `v11_24/Contacts/${this.id}
              ?erased_fields=true
              &view=record
              &fields=
                producttype_c%2C
                payment_due%2C
                id%2C
                birthdate%2C
                patientcode_c%2C
                lastvisitdate_c%2C
                ismedicareeligible_c%2C
                referred_by_c%2C
                send_forms_c%2C
                bundle_type%2C
                carecard_c
              &viewed=1`,
          ),
        },
        //
        // visit history
        {
          type: "GET",
          dataType: json,
          timeout: 180000,
          contentType: "application/json",
          url: oneLine(
            `v11_24/Contacts/${this.id}/link/contacts_tj_purchases_1
              ?erased_fields=true
              &view=subpanel-for-contacts-contacts_tj_purchases_1
              &fields=
                visit_type%2C
                purchaseactive%2C
                status%2C
                purchasetype%2C
                tax%2C
                monthlyamount_notax%2C
                overvisitcost_notax%2C
                my_favorite
              &max_num=${20}
              &order_by=date_entered%3Adesc`,
          ),
        },
      ];
      frontOfficeFetch(`https://axis.thejoint.com/rest/v11_24/bulk`, {
        method: "POST",
        body: { requests: requests },
      }).then((res) => {
        if (res.ok) {
          res.json().then((json) => {
            Object.assign(this, json[0].contents.records);
            this.visits = json[1].contents.records;
            resolve(this);
          });
        } else {
          reject(new Error(res.statusText));
        }
      });
    }).then(() => {
      // requests for axis bulk api
      const requests = [
        // purchase history
        {
          type: "GET",
          dataType: "json",
          timeout: 180000,
          contentType: "application/json",
          url: oneLine(
            `v11_24/Contacts/${this.id}/link/contacts_tj_purchases_1
              ?erased_fields=true
              &view=subpanel-for-contacts-contacts_tj_purchases_1
              &fields=
                purchaseactive%2C
                status%2C
                purchasetype%2C
                tax%2C
                monthlyamount_notax%2C
                overvisitcost_notax%2C
                my_favorite
              &max_num=5
              &order_by=date_entered%3Adesc`,
          ),
        },
        // documents
        {
          type: "GET",
          dataType: "json",
          timeout: 180000,
          contentType: "application/json",
          url: oneLine(
            `v11_24/Contacts/${this.id}/link/documents
              ?erased_fields=true
              &view=subpanel-for-contacts-documents
              &fields=
                date_entered%2C
                filename%2C
                related_doc_id%2C
                category_id%2C
                my_favorite
              &max_num=5
              &order_by=date_modified%3Adesc
              &filter%5B0%5D%5Bis_incorrect_c%5D=false`,
          ),
        },
        // tasks
        {
          type: "GET",
          dataType: "json",
          timeout: 180000,
          contentType: "application/json",
          url: oneLine(
            `v11_24/Contacts/${this.id}/link/all_tasks
              ?erased_fields=true
              &view=subpanel-for-contacts-all_tasks
              &fields=
                parent_name%2C
                description%2C
                parent_type%2C
                task_script_c%2C
                task_disclaimer%2C
                task_type_c%2C
                dri_subworkflow_id%2C
                my_favorite
              &max_num=5
              &order_by=status%3Adesc`,
          ),
        },
        // office notes
        {
          type: "GET",
          dataType: "json",
          timeout: 180000,
          contentType: "application/json",
          url: oneLine(
            `v11_24/Contacts/${this.id}/link/contacts_tj_officenotes_1
              ?erased_fields=true
              &view=subpanel-for-contacts-contacts_tj_officenotes_1
              &fields=
                date_entered%2C
                my_favorite
              &max_num=5
              &order_by=date_entered%3Adesc`,
          ),
        },
        // cancellations and freezes
        {
          type: "GET",
          dataType: "json",
          timeout: 180000,
          contentType: "application/json",
          url: oneLine(
            `v11_24/Contacts/${this.id}/link/contacts_tj_patientrequests_1
              ?erased_fields=true
              &view=subpanel-for-contacts-contacts_tj_patientrequests_1
              &fields=
                type%2C
                status%2C
                reason%2C
                date_entered%2C
                id%2C
                signpaperforms%2C
                my_favorite
              &max_num=5`,
          ),
        },
        // intake forms trackers
        {
          type: "GET",
          dataType: "json",
          timeout: 180000,
          contentType: "application/json",
          url: oneLine(
            `v11_24/Contacts/${this.id}/link/contacts_tj_intakeformstracker_1
              ?erased_fields=true
              &view=subpanel-for-contacts-contacts_tj_intakeformstracker_1
              &fields=my_favorite
              &max_num=5
              &order_by=date_modified%3Adesc`,
          ),
        },
      ];
      Promise.all([
        // get account data in bulk
        new Promise((resolve, reject) => {
          frontOfficeFetch("https://axis.thejoint.com/rest/v11_24/bulk", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: { requests: requests },
          }).then((res) => {
            if (res.ok) {
              res.json().then((json) => {
                [
                  "purchases",
                  "documents",
                  "tasks",
                  "notes",
                  "requests",
                  "trackers",
                ].forEach((field) => {
                  this[field] = json.contents.records; // an array of objects
                });
              });
              resolve(true);
            } else {
              reject(new Error(res.statusText));
            }
          });
        }),
        // get previous exam details
        new Promise((resolve, reject) => {
          frontOfficeFetch(
            oneLine(
              `https://axis.thejoint.com/rest/v11_24/GotenbergPdfManager/download
              ?module=TJ_Visits
              &record=${this.previousExam.id}
              &template_name=soap-note
              &download=true`,
            ),
          ).then((res) => {
            if (res.ok) {
              res.arrayBuffer().then((arrayBuffer) => {
                PDFParse(arrayBuffer).then((pdf) => {
                  let array = [];
                  pdf.text = pdf.text.trim().replaceAll(/[\r\n]/g, "");
                  // get problems from pdf soap
                  array = pdf.text
                    .split(
                      /The patient presents with the following complaint\(s\):/g,
                    )[1]
                    .split(/\sof waking hours/g);
                  for (let i = 0; i < array.length - 1; ++i) {
                    const [name, severity, frequency] = array[i].split(
                      /\srating\s|\sout of 10 and occurs\s/g,
                    );
                    this.problems.push({
                      name: name,
                      severity: `${severity} out of 10`,
                      frequency: `${frequency} of waking hours`,
                    });
                  }
                  // get diagnoses from pdf soap
                  array = pdf.text
                    .split(/Diagnosis codes:|Following the visit|Plan/g)[1]
                    .split(/([A-Z][0-9]{2})/g);
                  for (let i = 1; i < array.length; ++i) {
                    const str = array[i] + array[++i];
                    const [code, description] = str.split(/\s\-\s/g);
                    this.diagnoses.push({
                      code: code,
                      description: description,
                    });
                  }
                  // get treatment plan from pdf soap
                  array = pdf.text
                    .split(
                      /Chiropractic adjustments were performed on the following levels:/g,
                    )[1]
                    .split(
                      /Treatment plan:|Recommended re-evaluation date:|Treatment Items:VisitsPer WeekBy DC|Chiropractor:/g,
                    );
                  this.treatmentPlan.description = array[1];
                  this.treatmentPlan.end = array[2];
                  this.treatmentPlan.breakdown = array[3]
                    .split(/[0-9]/g)
                    .reduce((acc, cv, i) => {
                      if (/[0-9]/g.test(cv)) acc.push(cv);
                      return acc;
                    }, [])
                    .reduce((acc, cv, i, arr) => {
                      if (!(i % 2))
                        acc.push({
                          frequency: cv,
                          duration: arr[i + 1],
                        });
                    });
                  resolve(true);
                });
              });
            } else {
              reject(new Error(res.statusText));
            }
          });
        }),
      ]).then(() => {
        return this;
      });
    });
  }
}

class App {
  constructor() {
    this.log = [];
    this.name = null;
    this.isBackOffice = false;
    this.isFrontOffice = false;
    switch (window.location.hostname) {
      case "axis.thejoint.com":
        this.name = "axis-front-office";
        this.isFrontOffice = true;
        break;
      case "backoffice.thejoint.com":
        this.name = "axis-back-office";
        this.isBackOffice = true;
        break;
    }
  }
  set currentPatient(patient = new Patient()) {
    // store the current patient
    contentStorage.set({ currentPatient: patient }, "local");
    // TODO update the patient access log
    // ! update is not a method that exists on contentStorage
    // contentStorage.update({patientAccessLog: patient.id}, "sync");
  }
  get currentPatient() {
    return contentStorage.get(["currentPatient"], "local"); // promise
  }
  get resource() {
    return this.isFrontOffice
      ? kebabCase(window.location.hash.split("/")[0].slice(1))
      : window.location.pathname.split("/")[1];
  }
  connectAlert() {}
  connectDialog() {}
  async connectSheet() {
    switch (this.resource) {
      case "login":
        document
          .querySelector(
            this.isBackOffice ? "button[type=submit]" : "a[name=login_button]",
          )
          .addEventListener("click", async (e) => {
            e.preventDefault();
            // collect login details
            const username = document.querySelector(
              this.isBackOffice ? "input#user_name" : "input[name=username]",
            ).value;
            const password = document.querySelector(
              this.isBackOffice ? "input#password" : "input[name=password]",
            ).value;
            // get tokens from front office
            let res = await frontOfficeFetch(
              `https://axis.thejoint.com/rest/v11_24/oauth2/token?platform=base`,
              {
                method: "POST",
                headers: {
                  accept: "application/json, text/javascript, */*; q=0.01",
                  "cache-control": "no-cache",
                  "content-type": "application/json",
                  pragma: "no-cache",
                  "sec-fetch-mode": "cors",
                  "sec-fetch-site": "same-origin",
                  "x-requested-with": "XMLHttpRequest",
                },
                body: {
                  client_id: "sugar",
                  client_secret: "",
                  grant_type: "password",
                  username: username,
                  password: password,
                  platform: "base",
                },
              },
            );
            // store tokens
            if (res.ok) {
              res = await res.json();
              await contentStorage.set(
                {
                  oauthToken: res.access_token,
                },
                "sync",
                toMS.s(res.expires_in),
              );
              await contentStorage.set(
                {
                  refreshToken: res.refresh_token,
                },
                "sync",
                toMS.s(res.refresh_expires_in),
              );
              await contentStorage.set(
                {
                  downloadToken: res.download_token,
                },
                "sync",
              );
            }
            if (this.isBackOffice) {
              // resume normal login
              res = await fetch("https://backoffice.thejoint.com/login", {
                headers: {
                  accept:
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                  "accept-language": "en-US,en;q=0.9",
                  "content-type": "application/x-www-form-urlencoded",
                },
                referrer: "https://backoffice.thejoint.com/login",
                method: "POST",
                mode: "cors",
                credentials: "include",
                body: oneLine(
                  `_token=${document.querySelector("meta[name=csrf-token]").content}
                    &user_name=${username}
                    &password=${password}
                    &doctor_status=${document.querySelector("select#doctor_status").value.replace(/\s/gi, "+")}`,
                ),
              });
              // redirect if login successful
              if (res.ok)
                window.location.href =
                  "https://backoffice.thejoint.com/pending-notes";
              else throw new Error(res.statusText);
            } else if (this.isFrontOffice) {
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
              // redirect to home
              window.location.href = "https://axis.thejoint.com/#Home";
            }
          });
        break;
      case "cert-create":
        if (
          document.querySelector("#CompletedVisitData") &&
          false
        ) ; else {
          // * pending visit
          // modify save/complete buttons
          // document.querySelector(".saveCompleted").prepend(
          //   el({
          //     tagName: "a",
          //     classList: ["btn", "btn-outline-primary"],
          //     innerText: "Exit",
          //     attributes: {
          //       href: `https://backoffice.thejoint.com`,
          //     },
          //   }),
          // );
          // inject ui
          let ui = await (async () => {
            let res = await fetch(chrome.runtime.getURL("markup/visit.html"));
            if (res.ok) return await res.text();
            else throw new Error(res.statusText);
          })();
          document.body.append(
            el({
              tagName: "div",
              id: "praktiki-sheet",
              classList: ["bottom-sheet"],
              dataset: {
                state: "open",
              },
              innerHTML: ui,
            }),
          );
        }
        this.enableTabs();
        break;
      case "waiting-queue":
      case "pending-notes":
      case "completed-visits":
      case "patient-search":
      case "task-management":
        let ui = await (async () => {
          let res = await fetch(
            chrome.runtime.getURL("markup/side-sheet.html"),
          );
          if (res.ok) return await res.text();
          else throw new Error(res.statusText);
        })();
        document.body.append(
          el({
            tagName: "div",
            id: "praktiki-sheet",
            classList: ["side-sheet"],
            dataset: {
              state: "open",
            },
            innerHTML: ui,
          }),
        );
        this.enableSheetNav();
        this.enableTabs();
        this.enableDragContact();
        break;
      case "home":
        if (document.querySelector("form[name=login]") == null) {
          let ui = await (async () => {
            let res = await fetch(
              chrome.runtime.getURL("markup/side-sheet.html"),
            );
            if (res.ok) return await res.text();
            else throw new Error(res.statusText);
          })();
          document.body.append(
            el({
              tagName: "div",
              id: "praktiki-sheet",
              classList: ["side-sheet"],
              dataset: {
                state: "open",
              },
              innerHTML: ui,
            }),
          );
          this.enableSheetNav();
          this.enableTabs();
          this.enablePrint();
          this.enableDragContact();
        }
        break;
      case "contacts":
        if (document.querySelector("form[name=login]") == null) {
          let ui = await (async () => {
            let res = await fetch(
              chrome.runtime.getURL("markup/side-sheet.html"),
            );
            if (res.ok) return await res.text();
            else throw new Error(res.statusText);
          })();
          document.body.append(
            el({
              tagName: "div",
              id: "praktiki-sheet",
              classList: ["side-sheet"],
              dataset: {
                state: "open",
              },
              innerHTML: ui,
            }),
          );
          this.enableSheetNav();
          this.enablePrint();
          this.enableTabs();
          this.enableHideDocument();
        }
        break;
    }
    // enable sheet open/close
    const sheet = document.querySelector("#praktiki-sheet");
    if (sheet != null) {
      sheet.querySelector(".sheet-close").addEventListener("click", (e) => {
        if (e.target.parentElement.getAttribute("data-state") === "open") {
          e.target.parentElement.setAttribute("data-state", "closed");
        } else {
          e.target.parentElement.setAttribute("data-state", "open");
        }
      });
      new MutationObserver((mutationList) => {
        for (const m of mutationList) {
          if (m.type === "attributes" && m.attributeName === "data-state") {
            if (m.target.getAttribute("data-state") === "closed") {
              m.target.querySelector(".sheet-close md-icon").textContent =
                "keyboard_arrow_left";
            } else {
              m.target.querySelector(".sheet-close md-icon").textContent =
                "close";
            }
          }
        }
      }).observe(sheet, {
        attributes: true,
      });
    }
  }
  disconnect() {
    document
      .querySelectorAll("[id^=praktiki]")
      .forEach((element) => element.remove());
  }
  enableDragContact() {
    // make contact (tr) draggable
    document.querySelectorAll("table").forEach((table) => {
      const dragBehavior = (e = DragEvent) => {
        e.dataTransfer.clearData();
        // collect patient id
        let id = "",
          name = "";
        if (e.target.children[0].hasAttribute("data-patient_Id")) {
          id = e.target.children[0].getAttribute("data-patient_Id");
          name = e.target.children[0].children[0].innerText;
        } else if (e.target.children[0].children[0].hasAttribute("href")) {
          id = e.target.children[0].children[0]
            .getAttribute("href")
            .split("/")[1];
          name = e.target.children[0].children[0].innerText;
        }
        //
        e.dataTransfer.setData(
          "text",
          JSON.stringify({
            id: id,
            name: name,
          }),
        );
      };
      const enableDragFor = (node) => {
        node.setAttribute("draggable", "true");
        node.removeEventListener("dragstart", dragBehavior);
        node.addEventListener("dragstart", dragBehavior);
      };
      // enable drag initially
      table.querySelectorAll("tbody tr").forEach((row) => {
        enableDragFor(row);
      });
      // enable drag anytime table rows are added
      new MutationObserver((mutationList) => {
        for (const mutation of mutationList) {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              if (node instanceof HTMLTableRowElement) enableDragFor(node);
            });
          }
        }
      }).observe(table, { childList: true });
    });

    const dropZone = document.querySelector("#contact-summary");
    // cancel dragover to allow drop
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    // process drag and drop
    dropZone.addEventListener("drop", async (e) => {
      e.preventDefault();
      // empty dropzone
      e.target.innerHTML = "";
      // parse dragged data
      const data = JSON.parse(e.dataTransfer.getData("text"));
      // populate dropzone with dragged data (and related elements)
      e.target.append(
        el({
          classList: ["photo"],
        }),
        el({
          classList: ["summary"],
          children: [
            el({
              classList: ["name"],
              innerText: data.name,
            }),
          ],
        }),
        el({
          classList: ["flags"],
        }),
        el({
          classList: ["product"],
        }),
      );
      new Patient(data.id).getPatient().then((patient) => {
        // store the complete patient data temporarily
        chrome.storage.session.set({ currentPatient: patient });
        // update name to include preferred name
        document.querySelector("#contact-summary .summary .name").innerText =
          `${patient.first_name}${patient.preferred_name_c ? ` "${patient.preferred_name_c}" ` : " "}${patient.last_name}`;
        // populate remaining dropzone elements
        document.querySelector("#contact-summary .summary").append(
          el({
            classList: ["sex"],
            innerText: `${String(patient.sex_c).at(1).toUpperCase()}`,
          }),
          el({
            classList: ["dob"],
            innerText: `${dateText(patient.birthdate, true)} (age ${patient.age_c})`,
          }),
          el({
            classList: ["home"],
            innerText: `from ${patient.primary_address_city}, ${patient.primary_address_state}`,
          }),
          el({
            tagName: "a",
            classList: ["email"],
            href: `mailto:${patient.email[0].email_address}`,
            innerText: patient.email[0].email_address,
          }),
          el({
            tagName: "button",
            classList: ["phone"],
            innerText: patient.phone_mobile,
          }),
          el({
            classList: ["info"],
            innerText: patient.quick_patient_info,
          }),
        );
        // populate flags
        document.querySelector("#contact-drop-zone .flags").append(
          [
            "isMilitary",
            "isMedicare",
            "isMinor",
            "isNew",
            "needsForms",
            "hasBalance",
            "hasBirthday",
            "hasHSA",
            "hasSeeNotes",
            "hasDoNotCall",
            "hasDoNotAdjust",
          ].reduce((acc, cv) => {
            if (patient[cv])
              acc.push(
                el({
                  classList: [`${kebabCase(cv.replace(/is|has/, ""))}-flag`],
                  innerText: cv
                    .replaceAll(/(?=[A-Z])/g, " ")
                    .replace(/(is|has)\s/, ""),
                }),
              );
            return acc;
          }, []),
        );
        // populate product info
        document.querySelector("#contact .product").append(
          el({
            tagName: "li",
            classList: ["product"],
            innerText: `${patient.producttype_c}`,
          }),
          el({
            tagName: "li",
            classList: ["usage"],
            innerText: (() => {
              if (/plan/gi.test(patient.producttype_c)) {
                return `${numberText(patient.rpv_c)} visit${Number(patient.rpv_c) === 1 ? "" : "s"} to use before ${(() => {
                  const now = new Date();
                  // if recurring day is in the future
                  if (now.getDate() <= patient.recurringday) {
                    // and this month has a recurring day
                    if (daysIn(now) >= patient.recurringday) {
                      // return this month's recurring day
                      return dateText(now.setDate(patient.recurringday));
                    } else {
                      // return the last day in the month
                      return dateText(now.setDate(daysIn(now)));
                    }
                  } else {
                    // increment month
                    now.setMonth(now.getMonth() + 1);
                    // check that the new month has the recurring day
                    if (daysIn(now) >= patient.recurringday) {
                      // return the recurring day
                      return dateText(now.setDate(patient.recurringday));
                    } else {
                      // return the last day in the month
                      return dateText(now.setDate(daysIn(now)));
                    }
                  }
                })()}`;
              } else if (/pack/gi.test(patient.producttype_c)) {
                // return remaining visits on package
                return `${numberText(patient.rpv_c)} visit${Number(patient.rpv_c) === 1 ? "" : "s"} remaining.`;
              } else if (/walk/gi.test(patient.producttype_c)) {
                // return either days since cancellation or visits used in the last 90/365 days
                return (() => {
                  // get the last plan/package purchase
                  const lastProductPurchase = patient.purchases.find(
                    (purchase) => {
                      /plan|pack/gi.test(purchase.purchasetype);
                    },
                  );
                  // calculate days since cancellation (Infinity if never purchase)
                  const daysOffPlan =
                    lastProductPurchase === undefined
                      ? Infinity
                      : daysBetween(
                          new Date(lastProductPurchase.date_entered),
                          new Date(),
                        );
                  // determine if cancellation occurred in the last 90 days
                  const cancelledThisQuarter = daysOffPlan < 90 ? true : false;
                  // find visits from the last 90 days (or since cancellation, whichever is least)
                  const visitsLast90Days =
                    patient.visits.filter((visit) => {
                      daysBetween(new Date(visit.date_entered), new Date()) <=
                      cancelledThisQuarter
                        ? daysOffPlan
                        : 90;
                    }) ?? [];
                  // for recent cancellation
                  if (daysOffPlan < 30) {
                    // show days since cancellation
                    return oneLine(
                      `${lastProductPurchase.purchasetype === "Plan" ? "Canceled" : "Completed"} 
                        ${String(lastProductPurchase.producttype).toLowerCase()} 
                        ${daysOffPlan > 10 ? daysOffPlan : numberText(daysOffPlan)} ${daysOffPlan === 1 ? "day" : "days"} ago.`,
                    );
                    // for less recent cancellations
                  } else {
                    // show visits in the last 90 days
                    return oneLine(
                      `${numberText(visitsLast90Days.length)} 
                        ${visitsLast90Days.length === 1 ? "visit" : "visits"} 
                        ${cancelledThisQuarter ? "since cancellation" : "in the last 90 days"}.`,
                    );
                  }
                })();
              }
            })(),
          }),
        );
      });
    });
  }
  enableHideDocument() {
    const hideDocument = function () {
      document.querySelectorAll("[name^=Documents_]").forEach((tr) => {
        tr.querySelectorAll("a").forEach((a, i, array) => {
          if (i === array.length)
            a.addEventListener("click", (e) => {
              setTimeout(() => {
                // let the target get there first
                const target = document.querySelector("[name=is_incorrect_c]");
                target.parentElement.innerHTML = "";
                target.parentElement.append(
                  el({
                    tagName: "button",
                    classList: ["btn", "btn-primary"],
                    innerText: "Hide Document",
                    listeners: [
                      new Listener(
                        "click",
                        function (e) {
                          const id = e.target
                            .closest("tr")
                            .getAttribute("name")
                            .replace(/Documents_/g, "");
                          fetch(
                            oneLine(
                              `https://axis.thejoint.com/rest/v11_24/Documents/${id}
                                ?view=record
                                &allowBatching=true
                                &erased_fields=true
                                &viewed=1`,
                            ),
                            {
                              method: "PUT",
                              body: {
                                id: id,
                                is_incorrect_c: true,
                              },
                            },
                          ).then((res) => {
                            if (res.ok) ; else {
                              console.error(res.statusText);
                            }
                          });
                        },
                        { once: true },
                      ),
                    ],
                  }),
                );
              }, 0);
            });
        });
      });
    };
    // enable hide document immediately
    hideDocument();
    // and with table pagination
    document
      .querySelectorAll(
        "[data-subpanel-link=documents] button[data-action^=paginate]",
      )
      .forEach((button) => {
        button.addEventListener("click", () => {
          setTimeout(hideDocument, 0); // let the documents get there first
        });
      });
  }
  enableSheetNav() {
    // open any tool by clicking it's nav link
    document
      .querySelectorAll("#pi-primary-navigation > [href]")
      .forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          // href determines which tool should be shown
          let href = e.target.getAttribute("href") ?? "";
          // only # links prevent default behavior
          if (/^#/.test(href)) {
            // unstyle links
            e.target.parentElement
              .querySelectorAll("[href^='#']")
              .forEach((button) => button.removeAttribute("data-selected"));
            // style selected link
            e.target.setAttribute("data-selected", true);
            document
              .querySelectorAll("#praktiki-sheet.side-sheet > [id$=tool]")
              .forEach((tool) => {
                // update active tool
                if (`#${tool.id}` === href) {
                  // set tool state to active
                  tool.setAttribute("data-state", "active");
                } else {
                  tool.removeAttribute("data-state");
                }
              });
          } else {
            // all other links open normally
            window.open(href, e.target.getAttribute("target") ?? "_blank");
          }
        });
      });
  }
  enablePrint() {
    // store print button and print dialog
    const button = document.querySelector("#print-resource-button");
    const dialog = document.querySelector("#print-resource-dialog");
    // named callback functions that can be "disabled" (removed) later
    const matchOptionsToResource = (e) => {
        document
          .querySelectorAll("#pi-print-generate [class^=option]")
          .forEach((option) => {
            if (option.classList.contains(`option-${e.target.value}`)) {
              option.setAttribute("data-state", "active");
            } else {
              option.removeAttribute("data-state");
            }
          });
      },
      showPrintPreview = async (e) => {
        // show print preview on print button click
        e.preventDefault();
        // append progress indicator
        dialog
          .querySelector("iframe[slot=content]")
          .contentDocument.body.replaceWith(
            el({
              tagName: "body",
              childList: [
                el({
                  tagName: "md-circular-progress",
                  attributes: {
                    indeterminate: true,
                  },
                }),
              ],
            }),
          );
        // show the dialog
        await dialog.show();
        // get the resource name
        const resource = e.target.parentElement.querySelector("select").value;
        // get resource options
        const options = document
          .querySelectorAll(`#pi-print-generate .option-${resource} input`)
          .reduce((acc, cv) => {
            acc[cv.name] = cv.value;
            return acc;
          }, {});
        // generate resource and set dialog content
        dialog
          .querySelector("iframe[slot=content]")
          .contentDocument.body.replaceWith(
            el({
              tagName: "body",
              innerHTML: await this[`generate${capitalize(resource)}`](
                await this.currentPatient,
                options,
              ),
            }),
          );
      },
      saveResource = async (e) => {
        // create a name for the file
        const filename = ``;
        const statusIcon = e.target.querySelector("md-icon");
        // update status icon
        statusIcon.innerText = "arrow_upload_ready";
        // create a blob
        const pdfBlob = await html2pdf()
          .set({
            margin: 0.5,
            filename: filename,
            jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
          })
          .from(dialog.querySelector("iframe[slot=content]").contentDocument)
          .output("blob"); // returns Blob
        // update status icon
        statusIcon.innerText = "arrow_upload_progress";
        // send to axis
        let res = await frontOfficeFetch(
          "https://axis.thejoint.com/rest/v11_24/Documents/temp/file/filename",
          {
            method: "POST",
            body: new FormData().append("pdf", pdfBlob, filename),
          },
        );
        if (res.ok) {
          res = await fetch(
            `https://axis.thejoint.com/rest/v11_24/Contacts/${await this.currentPatient.id}/link/documents`,
            {
              method: "POST",
              body: {
                deleted: false,
                doc_type: "Sugar",
                revision: 1,
                is_template: false,
                clinicname_c: false,
                is_incorrect_c: false,
                assigned_user_id: "user-id",
                category_id: "Other",
                subcategory_id: "Other",
                filename: "filename.pdf",
                document_name: "filename.pdf",
                description: "File description...",
                filename_guid: "filename-guid",
              },
            },
          );
        }
      },
      printResource = () => {
        dialog
          .querySelector("iframe[slot=content]")
          .contentWindow.addEventListener("afterprint", async (e) => {
            await dialog.close();
            e.target.replaceWith(
              el({
                tagName: "iframe",
                attributes: {
                  slot: content,
                },
              }),
            );
          });
        dialog.querySelector("iframe[slot=content]").contentWindow.print();
      };

    // * steps to enable print
    // allow select to toggle resource options
    document
      .querySelector("#pi-print-generate .selector select")
      .addEventListener("change", matchOptionsToResource);
    // show selected resource in print preview
    button.addEventListener("click", showPrintPreview);
    // save when save button is clicked
    dialog
      .querySelector("[slot=actions] [value=save]")
      .addEventListener("click", saveResource);
    // print when print button is clicked
    dialog
      .querySelector("[slot=actions] [value=print]")
      .addEventListener("click", printResource);
    // indicate that printing is enabled
    button.querySelector("md-icon[slot=icon]").innerText = "print";
  }
  enableTabs() {
    document.querySelectorAll("md-tabs").forEach((tablist) => {
      tablist.addEventListener("change", (e) => {
        setTimeout(() => {
          e.target.childNodes.forEach((tab) => {
            if (tab.hasAttribute("active"))
              document.getElementById(
                tab.getAttribute("aria-controls"),
              ).hidden = false;
            else
              document.getElementById(
                tab.getAttribute("aria-controls"),
              ).hidden = true;
          });
        }, 0);
      });
    });
  }
  generateExcuse(
    patient = new Patient(),
    startDate = new Date(),
    modificationList = [],
    endDate = 0,
  ) {
    return "";
  }
  generateReview(patient = new Patient()) {
    return "";
  }
  generateSuperbill(
    patient = new Patient(),
    startDate = new Date(),
    endDate = new Date(),
  ) {
    return "";
  }
}

class User {
  constructor() {
    this.authorizedClinics = [];
    this.clinic = {
      id: null,
      name: null,
      address: {
        street: null,
        city: null,
        state: null,
        zip: null,
      },
      phone: null,
      email: null,
      entity: null,
      company: null,
    };
    this.credential = null;
    this.currentApp = new App();
    this.email = null;
    this.id = null;
    this.isBetaUser = false;
    this.isPrimaryUser = null;
    this.name = null;
    this.prefix = null;
    this.role = null;
    this.settings = {};
    this.username = null;
  }
  get csrfToken() {
    try {
      if (this.currentApp.isBackOffice) {
        return document.querySelector("meta[name=csrf-token]").content;
      } else {
        throw new Error(`csrf-token cannot be accessed from front office.`);
      }
    } catch (error) {
      console.error(error);
      return "";
    }
  }
  get oauthToken() {
    try {
      if (this.currentApp.isFrontOffice) {
        return localStorage.getItem("prod:SugarCRM:AuthAccessToken");
      } else {
        throw new Error(`oauthToken cannot be accessed from back office.`);
      }
    } catch (error) {
      console.error(error);
      return "";
    }
  }
  getUser() {
    return new Promise((resolve, reject) => {
      // get current user from front office
      frontOfficeFetch("https://axis.thejoint.com/rest/v11_24/me").then(
        (res) => {
          if (res.ok)
            res.json().then((json) => {
              resolve(json);
            });
          else reject(new Error(res.statusText));
        },
      );
    })
      .then((json) => {
        // update user
        this.name = json.current_user.full_name;
        this.username = json.current_user.user_name;
        if (/dr./i.test(this.username)) {
          this.credential = "DC";
          this.prefix = "Dr.";
          this.role = "Doctor of Chiropractic";
        } else {
          this.role = "Wellness Coordinator";
        }
        this.id = json.current_user.id;
        this.email = json.current_user.email.email_address;
        this.clinic = {
          id: json.current_user.clinic_id,
          name: json.current_user.clinic_name,
        };
        this.isBetaUser = json.current_user.beta_features;

        // check if this is the primary user
        return contentStorage.get("primaryUser", "sync").then((record) => {
          if (record.results.primaryUser.username === this.username) {
            this.isPrimaryUser = true;
            this.settings = primaryUser.settings;
          } else if (record.results.primaryUser === null) {
            // sync storage has not been enabled
            // the user defaults to primary
            this.isPrimaryUser = true;
            // settings are not defined
          } else {
            // this is a guest user
            this.isPrimaryUser = false;
          }
          // allow chaining
          return this;
        });
      })
      .catch((error) => {
        console.error(error);
        return this;
      });
  }
  getClinic() {
    new Promise((resolve, reject) => {
      // reject if clinic id is unset
      if (!this.clinic.id)
        reject(
          new Error(
            `Clinic ${this.clinic.id} is invalid. Call method getUser() before getClinic().`,
          ),
        );
      // get current clinic from front office
      frontOfficeFetch(
        `https://axis.thejoint.com/rest/v11_24/TJ_Clinics/${this.clinic.id}?erased_fields=true&view=record`,
      ).then((res) => {
        if (res.ok)
          res.json().then((json) => {
            resolve(json);
          });
        else reject(new Error(res.statusText));
      });
    })
      .then((json) => {
        this.clinic.name = json.name;
        this.clinic.address.street = json.billing_address_street;
        this.clinic.address.city = json.billing_address_city;
        this.clinic.address.state = json.billing_address_state;
        this.clinic.address.zip = json.billing_address_postalcode;
        this.clinic.phone = json.phone1;
        this.clinic.email = json.email;
        this.clinic.company = json.pc;
        // ? business is misspelled occasionally
        this.clinic.entity = json.bussiness_entity
          ? json.bussiness_entity
          : json.business_entity;
        // allow chaining
        return this;
      })
      .catch((error) => {
        console.error(error);
        return this;
      });
  }
  getAuthorizedClinics() {
    new Promise((resolve, reject) => {
      // get all clinics that the user can access
      frontOfficeFetch(
        "https://axis.thejoint.com/rest/v11_24/Dashboards/enum/clinicslist",
      ).then((res) => {
        if (res.ok)
          res.json().then((json) => {
            resolve(json);
          });
        else reject(new Error(res.statusText));
      });
    })
      .then((json) => {
        const requests = [];
        for (const key of Object.keys(json)) {
          requests.push({
            type: "GET",
            dataType: "json",
            timeout: 180000,
            contentType: "application/json",
            url: `https://axis.thejoint.com/rest/v11_24/TJ_Clinics/${key}?erased_fields=true&view=record`,
          });
        }
        const authorizedClinic = (record = {}) => {
          return {
            name: record.name,
            address: {
              street: record.billing_address_street,
              city: record.billing_address_city,
              state: record.billing_address_state,
              zip: record.billing_address_postalcode,
            },
            phone: record.phone1,
            email: record.email,
            company: record.pc,
            entity: record.bussiness_entity
              ? record.bussiness_entity
              : record.business_entity,
          };
        };
        frontOfficeFetch("https://axis.thejoint.com/rest/v11_24/bulk", {
          body: { requests: requests },
        }).then((res) => {
          if (res.ok) {
            res.json().then((json) => {
              if (is.array(json.contents.records)) {
                for (const record of json.contents.records) {
                  this.authorizedClinics.push(authorizedClinic(record));
                }
                // allow chaining
                return this;
              } else {
                throw new Error(
                  `Records must be type of array. Received ${typeof json.contents.records}.`,
                );
              }
            });
          } else {
            throw new Error(res.statusText);
          }
        });
      })
      .catch((error) => {
        console.error(error);
        return this;
      });
  }
}

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

const user = new User();

// show the correct ui
user.currentApp.connectSheet();
// and make sure ui updates with navigation (for front office)
window.addEventListener("popstate", (e) => {
  user.currentApp.disconnect();
  user.currentApp.connectSheet();
});
