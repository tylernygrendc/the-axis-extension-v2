import { kebabCase, numberText, oneLine } from "../_string.mjs";
import { el, Listener } from "../_element.mjs";
import { contentStorage } from "./chrome-storage";
import { toMS, dateText, daysIn, daysBetween } from "../_date.mjs";
import { Patient } from "./axis-patient";
import { frontOfficeFetch } from "./axis-fetch";
export class App {
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
        const defaultToPending = true; // ! for development only
        if (
          document.querySelector("#CompletedVisitData") &&
          !defaultToPending
        ) {
          // * completed visit
        } else {
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
      case "tasks":
      case "tj_clinics":
      case "tj_custom_reports":
      default:
        // do nothing
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
      new MutationObserver((mutationList, observer) => {
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
                            if (res.ok) {
                              // TODO: give user option to undo
                            } else {
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
    // allow select to toggle options
    document
      .querySelector("#pi-print-generate .selector select")
      .addEventListener("change", (e) => {
        // update the selected option
        document
          .querySelectorAll("#pi-print-generate [class^=option]")
          .forEach((option) => {
            if (option.classList.contains(`option-${e.target.value}`)) {
              option.setAttribute("data-state", "active");
            } else {
              option.removeAttribute("data-state");
            }
          });
      });
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
}
