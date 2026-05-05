import { frontOfficeFetch } from "./axis-fetch";
import { oneLine } from "../_string.mjs";
// import { PDFParse } from "pdf-parse";
// ! PDFParse is imported at document level to avoid collisions
export class Patient {
  constructor(id = "") {
    this.id = id;
    this.visitList = [];
    this.diagnosisList = [];
    this.problemList = [];
    this.treatmentPlan = {};
  }
  get nextVisit() {
    const visit = new Date(this.previousVisit.date_entered);
    return new Date(
      Math.min(
        visit.setDate(
          visit.getDate() + Math.ceil((this.treatmentPlan.totalWeeks * 7) / this.treatmentPlan.totalVisits),
        ),
        this.treatmentPlan.end,
      ),
    );
  }
  get previousExam() {
    return this.visitList.find((visit) => visit.type != 1);
  }
  get previousVisit() {
    return this.visitList[0];
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
    const daysToBirthday = Math.ceil(Math.abs(new Date(dob).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
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
            this.visitList = json[1].contents.records;
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
                ["purchases", "documents", "tasks", "notes", "requests", "trackers"].forEach((field) => {
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
                    .split(/The patient presents with the following complaint\(s\):/g)[1]
                    .split(/\sof waking hours/g);
                  for (let i = 0; i < array.length - 1; ++i) {
                    const [name, severity, frequency] = array[i].split(/\srating\s|\sout of 10 and occurs\s/g);
                    this.problemList.push({
                      name: name,
                      severity: `${severity} out of 10`,
                      frequency: `${frequency} of waking hours`,
                    });
                  }
                  // get diagnoses from pdf soap
                  array = pdf.text.split(/Diagnosis codes:|Following the visit|Plan/g)[1].split(/([A-Z][0-9]{2})/g);
                  for (let i = 1; i < array.length; ++i) {
                    const str = array[i] + array[++i];
                    const [code, description] = str.split(/\s\-\s/g);
                    this.diagnosisList.push({
                      code: code,
                      description: description,
                    });
                  }
                  // get treatment plan from pdf soap
                  array = pdf.text
                    .split(/Chiropractic adjustments were performed on the following levels:/g)[1]
                    .split(
                      /Treatment plan:|Recommended re-evaluation date:|Treatment Items:VisitsPer WeekBy DC|Chiropractor:/g,
                    );
                  this.treatmentPlan.description = array[1];
                  this.treatmentPlan.end = new Date(array[2]);
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
                    }, []);
                  array = this.treatmentPlan.description.split(
                    /A treatment plan of [0-9]* x's for a total of\s|\sweeks was set on\s|\sby\s|, DC, for an estimated\s|\svisits\./g,
                  );
                  this.treatmentPlan.totalWeeks = array[0];
                  this.treatmentPlan.start = new Date(array[1]);
                  this.treatmentPlan.provider = array[2];
                  this.treatmentPlan.totalVisits = array[3];
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
