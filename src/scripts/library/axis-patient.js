import { frontOfficeBulkFetch, frontOfficeFetch } from "./axis-fetch";
/// a class representing a given patient
/// instantiate with `const patient = await Patient.fromId(<patientId>);`
export class Patient {
  constructor(axisPatientObject = {}) {
    Object.assign(this, axisPatientObject);
  }
  //* get any axis patient by patient id
  static async fromId(id = "") {
    // define the apis to be used
    // TODO, tune maxNum
    const requests = [
      frontOfficeAPI.getPatientById(id),
      frontOfficeAPI.getVisitsByPatientId(id),
      frontOfficeAPI.getPurchasesByPatientId(id),
      frontOfficeAPI.getDocumentsByPatientId(id),
      frontOfficeAPI.getTasksByPatientId(id),
      frontOfficeAPI.getNotesByPatientId(id),
      frontOfficeAPI.getRequestsByPatientId(id),
    ];
    // prepare requests array for bulk fetch
    // TODO expand usage of bulkRequest in axis-api.js
    const bulkRequests = requests.map((request) => request.bulkRequest);
    // store the output names in matching order
    // TODO put create this field in axis-api.js
    const outputName = requests.map((request) => request.outputName);
    // attempt bulk fetch
    let responseList = await frontOfficeBulkFetch(bulkRequests);
    // parse response
    if (responseList.ok) {
      responseList = await responseList.json();
    } else {
      // there was an error
    }
    // create an object to assemble patient records
    const axisPatientObject = {};
    // iterate over response records
    responseList.forEach((response, i) => {
      // most are added to Patient as a list
      if (i) {
        Object.assign(axisPatientObject, { [outputName[i]]: response.contents });
        // the first response content object is added directly to Patient
      } else {
        Object.assign(axisPatientObject, response.contents[0]);
      }
    });
    return new Patient(axisPatientObject);
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
    // TODO: fix, defaults to false
    return false;
  }
  get hasDoNotCall() {
    return this.do_not_call;
  }
  get hasDoNotAdjust() {
    // TODO: fix, defaults to false
    return false;
  }
  async examList() {
    // TODO fix, defaults to false
    return false;
  }
  async previousExam() {
    // TODO check if the exam has already been stored
    let exam = this.visitList.find((visit) => visit.visit_type != 1 && visit.status === "Completed");
    const api = frontOfficeAPI.getPDFVisitsByPatientId(
      this.id,
      new Date(exam.date_entered).setHours(0, 0, 0, 0),
      new Date(exam.date_entered).setHours(23, 59, 59, 999),
    );
    let response = await frontOfficeFetch(api.fetchRequest, api.fetchOptions);
    if (response.ok) response = parseSOAPNote(await response.text());
    return Object.assign(exam, response);
  }
  async previousVisit() {
    // TODO add after refining above, same as above except find() criteria
  }
}

function parseSOAPNote(text) {
  // filter for diagnosis codes
  // this could be limited to G, M, R, and S codes, probably
  /[A-Z]{1}[0-9]{2}\.[A-Z0-9]*/gi;
  // filter for CPT codes
  // this should match all codes that axis will output
  /[89]{2}[0-9]{3}/gi;
  // TODO create a cpt/icd lookup for all possible *chiropractic* codes
  // TODO write logic to default to M99.XX, M62.89, and/or other common codes based on known findings
}
