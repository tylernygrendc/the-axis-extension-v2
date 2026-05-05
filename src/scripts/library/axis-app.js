import { capitalize, kebabCase, numberText, oneLine } from "../src/scripts/_string.mjs";
import { Listener, el, template } from "../src/scripts/_element.mjs";
import { safeHTML } from "../src/scripts/_safe.mjs";
import { contentStorage } from "./chrome-storage";
import { toMS, dateText, daysIn, daysBetween, formatDate } from "../src/scripts/_date.mjs";
import { User } from "./axis-user";
import { Patient } from "./axis-patient";
import { frontOfficeFetch } from "../src/scripts/library/axis-fetch";
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
  get currentUser() {
    return contentStorage.get(["currentUser"], "local"); // promise
  }
  get primaryUser() {
    return contentStorage.get(["primaryUser"], "sync"); // promise
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
        // listen for login form submission
        document
          .querySelector(this.isBackOffice ? "button[type=submit]" : "a[name=login_button]")
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
            let res = await frontOfficeFetch(`https://axis.thejoint.com/rest/v11_24/oauth2/token?platform=base`, {
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
            });
            // process front office response
            if (res.ok) {
              res = await res.json();
              // store tokens
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
              // store current user
              await contentStorage.set({
                currentUser: await new User().getUser(),
              });
            }
            // resume normal login
            if (this.isBackOffice) {
              res = await fetch("https://backoffice.thejoint.com/login", {
                headers: {
                  accept:
                    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
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
              if (res.ok) window.location.href = "https://backoffice.thejoint.com/pending-notes";
              else throw new Error(res.statusText);
            } else if (this.isFrontOffice) {
              // store tokens locally
              localStorage.setItem("prod:SugarCRM:AuthAccessToken", res.access_token);
              localStorage.setItem("prod:SugarCRM:AuthRefreshToken", res.refresh_token);
              localStorage.setItem("prod:SugarCRM:DownloadToken", res.download_token);
              // redirect to home
              window.location.href = "https://axis.thejoint.com/#Home";
            }
          });
        break;
      case "cert-create":
        const defaultToPending = true; // ! for development only
        if (document.querySelector("#CompletedVisitData") && !defaultToPending) {
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
              innerHTML: safeHTML(ui),
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
          let res = await fetch(chrome.runtime.getURL("markup/side-sheet.html"));
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
            innerHTML: safeHTML(ui),
          }),
        );
        this.enableSheetNav();
        this.enableTabs();
        this.enableDragContact();
        break;
      case "home":
        if (document.querySelector("form[name=login]") == null) {
          let ui = await (async () => {
            let res = await fetch(chrome.runtime.getURL("markup/side-sheet.html"));
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
              innerHTML: safeHTML(ui),
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
            let res = await fetch(chrome.runtime.getURL("markup/side-sheet.html"));
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
              innerHTML: safeHTML(ui),
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
      new MutationObserver((mutationList) => {
        for (const m of mutationList) {
          if (m.type === "attributes" && m.attributeName === "data-state") {
            if (m.target.getAttribute("data-state") === "closed") {
              m.target.querySelector(".sheet-close md-icon").textContent = "keyboard_arrow_left";
            } else {
              m.target.querySelector(".sheet-close md-icon").textContent = "close";
            }
          }
        }
      }).observe(sheet, {
        attributes: true,
      });
    }
  }
  disconnect() {
    document.querySelectorAll("[id^=praktiki]").forEach((element) => element.remove());
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
          id = e.target.children[0].children[0].getAttribute("href").split("/")[1];
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
                  innerText: cv.replaceAll(/(?=[A-Z])/g, " ").replace(/(is|has)\s/, ""),
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
                  const lastProductPurchase = patient.purchases.find((purchase) => {
                    /plan|pack/gi.test(purchase.purchasetype);
                  });
                  // calculate days since cancellation (Infinity if never purchase)
                  const daysOffPlan =
                    lastProductPurchase === undefined
                      ? Infinity
                      : daysBetween(new Date(lastProductPurchase.date_entered), new Date());
                  // determine if cancellation occurred in the last 90 days
                  const cancelledThisQuarter = daysOffPlan < 90 ? true : false;
                  // find visits from the last 90 days (or since cancellation, whichever is least)
                  const visitsLast90Days =
                    patient.visitList.filter((visit) => {
                      daysBetween(new Date(visit.date_entered), new Date()) <= cancelledThisQuarter ? daysOffPlan : 90;
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
    document.querySelectorAll("[data-subpanel-link=documents] button[data-action^=paginate]").forEach((button) => {
      button.addEventListener("click", () => {
        setTimeout(hideDocument, 0); // let the documents get there first
      });
    });
  }
  enableSheetNav() {
    // open any tool by clicking it's nav link
    document.querySelectorAll("#pi-primary-navigation > [href]").forEach((link) => {
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
          document.querySelectorAll("#praktiki-sheet.side-sheet > [id$=tool]").forEach((tool) => {
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
        document.querySelectorAll("#pi-print-generate [class^=option]").forEach((option) => {
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
        dialog.querySelector("iframe[slot=content]").contentDocument.body.replaceWith(
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
        const options = document.querySelectorAll(`#pi-print-generate .option-${resource} input`).reduce((acc, cv) => {
          acc[cv.name] = cv.value;
          return acc;
        }, {});
        // generate resource and set dialog content
        dialog.querySelector("iframe[slot=content]").contentDocument.body.replaceWith(
          el({
            tagName: "body",
          }).append(await this[`generate${capitalize(resource)}`](await this.currentPatient, options)),
        );
      },
      showBlankPreview = async () => {
        e.preventDefault();
        // append progress indicator
        dialog.querySelector("iframe[slot=content]").contentDocument.body.replaceWith(
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
        dialog.querySelector("iframe[slot=content]").contentDocument.body.replaceWith(
          el({
            tagName: "body",
          }).append(await this.generateBlank()),
        );
      },
      saveResource = async (e) => {
        // create a name for the file
        const filename = ``;
        const statusIcon = e.target.querySelector("md-icon");
        // update status icon
        statusIcon.innerText = "pending";
        try {
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
          statusIcon.innerText = "arrow_upload_ready";
          // send to axis
          let res = await frontOfficeFetch("https://axis.thejoint.com/rest/v11_24/Documents/temp/file/filename", {
            method: "POST",
            body: new FormData().append("pdf", pdfBlob, filename),
          });
          if (res.ok) {
            statusIcon.innerText = "arrow_upload_progress";
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
            if (res.ok) {
              statusIcon.innerText = "check_circle";
            } else {
              throw new Error(res.statusText);
            }
          } else {
            throw new Error(res.statusText);
          }
        } catch (error) {
          statusIcon.innerText = "error";
          console.error(error);
        }
      },
      printResource = () => {
        dialog.querySelector("iframe[slot=content]").contentWindow.addEventListener("afterprint", async (e) => {
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
    document.querySelector("#pi-print-generate .selector select").addEventListener("change", matchOptionsToResource);
    // show selected resource in print preview
    button.addEventListener("click", showPrintPreview);
    // alternatively, open a blank print preview
    document.querySelector("#print-blank-button").addEventListener("click", showBlankPreview);
    // save when save button is clicked
    dialog.querySelector("[slot=actions] [value=save]").addEventListener("click", saveResource);
    // print when print button is clicked
    dialog.querySelector("[slot=actions] [value=print]").addEventListener("click", printResource);
    // indicate that printing is enabled
    button.querySelector("md-icon[slot=icon]").innerText = "print";
  }
  enableTabs() {
    document.querySelectorAll("md-tabs").forEach((tablist) => {
      tablist.addEventListener("change", (e) => {
        setTimeout(() => {
          e.target.childNodes.forEach((tab) => {
            if (tab.hasAttribute("active")) document.getElementById(tab.getAttribute("aria-controls")).hidden = false;
            else document.getElementById(tab.getAttribute("aria-controls")).hidden = true;
          });
        }, 0);
      });
    });
  }
  async generateBlank(patient = new Patient()) {
    let res = await fetch(chrome.runtime.getURL("markup/print-blank.html"));
    if (res.ok) return template(await res.text());
    else throw new Error(res.statusText);
  }
  async generateExcuse(patient = new Patient(), options = {}) {
    try {
      let res = await fetch(chrome.runtime.getURL("markup/print-excuse.html"));
      if (res.ok) {
        const excuse = template(await res.text());
        // get user and clinic details
        const user = await (await this.currentUser).getClinic();
        // get the excused visit
        let excusedVisit = patient.visitList.find(visit => visit.id === options.visitId);        
        // * fill the excuse template
        // clinic details
        excuse.querySelector("#excuse-clinic-details").append(
          el({
            tagName: "li",
            innerText: `The Joint Chiropractic - ${user.clinic.name}`,
          }),
          el({
            tagName: "li",
            innerText: `${user.clinic.address.street}\n${user.clinic.address.city}, ${user.clinic.address.state}`,
          }),
          el({
            tagName: "li",
            innerText: `${user.clinic.email}`,
          }),
          el({
            tagName: "li",
            innerText: `${user.clinic.phone}`,
          }),
        );
        // - introduction
        excuseBody.append(
          el({
            tagName: "p",
            innerText: `Regarding ${/male/i.test(patient.sex_c) ? "Mr." : "Ms."} ${patient.name} (DOB: ${formatDate(patient.birthdate)})`,
          }),
          el({
            tagName: "p",
            innerText: "To whom it may concern,",
          }),
          el({
            tagName: "p",
            innerText: oneLine(`
              Please excuse ${patient.name}'s absence on ${dateText(new Date(excusedVisit.date_entered), false, true)}. They were seen at my office for ${options.is_exam ? "evaluation and management" : "management"} of a musculoskeletal condition. ${(() => {
                if (options.is_exam) {
                  if (options.modificationList.length) {
                    return oneLine(
                      `As part of this patient's plan of care, I have recommended the following activity ${options.modificationList.length == 1 ? "modification" : "modifications"}:`,
                    );
                  } else {
                    return oneLine(
                      `It is my opinion that no activity modifications are necessary for ${/male/i.test(patient.sex_c) ? "Mr." : "Ms."} ${patient.last_name} at this time. Daily activities and exercises may be continued at the current rate, within reason. This patient has been advised to return for their next visit on ${dateText(patient.nextVisit, true)}.`,
                    );
                  }
                } else {
                  if (options.modificationList.length) {
                    return oneLine(
                      `This visit on ${dateText(new Date(options.excuseDate), false, true)} is one of ${numberText(patient.previousExam.totalVisits)} visits first prescribed on ${dateText(patient.previousExam.start, true)}. After careful consideration of this patient's condition, I have determined that the following activity ${options.modificationList.length == 1 ? "modification is" : "modifications are"} necessary:`,
                    );
                  } else {
                    return oneLine(
                      `This visit on ${dateText(new Date(options.excuseDate), false, true)} is one of ${numberText(patient.previousExam.totalVisits)} visits first prescribed on ${dateText(patient.previousExam.start, true)}. ${
                        options.resumeActivity <= 1
                          ? `It is my opinion that, at this time, no activity modifications are necessary for ${/male/i.test(patient.sex_c) ? "Mr." : "Ms."} ${patient.last_name}. Daily activities and exercises may be performed normally, without modification, within reason. This patient has been advised to return for their next visit on ${dateText(patient.nextVisit, true)}.`
                          : `The previously recommended activity modifications should be continued for a period of at least ${numberText(options.resumeActivity)} days, pending reassessment of their condition. This patient has been advised to return for their next visit on ${dateText(patient.nextVisit, true)}.`
                      }`,
                    );
                  }
                }
              })()}`),
          }),
        );
        // activity modifications list (if applicable)
        if (options.modificationList.length) {
          excuseBody.append(
            el({
              tagName: "ul",
              childList: options.modificationList.reduce((acc, cv) => {
                acc.push(
                  el({
                    tagName: "li",
                    innerText: capitalize(cv.replace(/[\-_\+%&]/g, " "), true),
                  }),
                );
                return acc;
              }, []),
            }),
            el({
              tagName: "p",
              innerText: `These modifications should be continued for a period of at least ${numberText(options.resumeActivity)} days, pending reassessment of their condition. This patient has been advised to return for their next visit on ${dateText(patient.nextVisit, true)}.`,
            }),
          );
        }
        // closing
        excuseBody.append(
          el({
            tagName: "p",
            innerHTML: `Thank you for your attention and cooperation in this matter. Please contact my office by calling ${user.clinic.phone} if you have any questions or concerns.`,
          }),
        );
        // signature
        excuseBody.append(
          el({
            tagName: "p",
            innerText: `${user.signoff ? user.signoff : "Best,"}`,
          }),
          el({
            tagName: "p",
            innerText: (() => {
              if (user.id == patient.) {
                return 
              }
            })(),
          }),
        );
        // return excuse html
        return excuse;
      } else {
        throw new Error(res.statusText);
      }
    } catch (error) {
      console.error(error);
      return el();
    }
  }
  async generateReview(patient = new Patient(), options = {}) {
    try {
      let res = await fetch(chrome.runtime.getURL("markup/print-review.html"));
      if (res.ok) {
        // convert markup to document
        const review = template(await res.text());
        // get user and clinic details
        const user = await (await this.currentUser).getClinic();
        // * fill the review template
        // title
        review.querySelector("#print-resource-title").innerText = "Wellness Review";
        // topline
        if (user.clinic.company) {
          review.querySelector("#print-resource-topline").innerText = user.clinic.entity
            ? `This clinic is owned and operated by ${user.clinic.company} and managed by ${user.clinic.entity}`
            : `This clinic is owned and operated by ${user.clinic.company}`;
        } else {
          review.querySelector("#print-resource-topline").remove();
        }
        // treatment
        review.querySelector("#review-treatment-plan").innerText = patient.treatmentPlan?.description
          ? `${patient.treatmentPlan.description}. This wellness review is intended to better understand your progress towards your goals and identify all opportunities to better serve you.`
          : "On _____/_____/_____, we developed a treatment plan of _____ visits per __________ to address your initial complaint(s) and/or goals to improve your health and wellness. This wellness review is intended to better understand your progress towards your goals and identify all opportunities to better serve you.";
        // problem list
        review.querySelector("#review-problem-list").append(
          ...patient.problemList.reduce((acc, cv) => {
            acc.push(
              el({
                tagName: "li",
                innerText: capitalize(cv.toLowerCase(), true),
              }),
            );
            return acc;
          }, []),
        );
        // frequency
        review
          .querySelector(
            `#review-treatment-frequency input[value=${Math.round(
              patient.visitList.filter((visit) => {
                new Date(visit.date_entered).getTime() > new Date(patient.previousExam.date_entered).getTime();
              }).length / daysBetween(new Date(patient.previousExam.date_entered), new Date(patient.treatmentPlan.end)),
            )}]`,
          )
          ?.setAttribute("checked", true);
        // return the modified review body
        return review;
      } else {
        throw new Error(res.statusText);
      }
    } catch (error) {
      console.error(error);
      return el();
    }
  }
  async generateSuperbill(patient = new Patient(), options = {}) {
    return "";
  }
}
