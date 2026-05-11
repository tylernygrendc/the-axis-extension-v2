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
    const requests = {
      patient: frontOfficeAPI.getPatientById(id), // TODO: limit fields maybe
      visitList: frontOfficeAPI
        .getVisitsByPatientId(id)
        .withQuery({ max_num: 5 })
        .withFilter(
          "date_entered",
          [
            new Date(
              new Date().setMonth(new Date().getMonth - 3),
            ).toISOString(),
            new Date().toISOString(),
          ],
          "dateBetween",
        )
        .withFilter("status", "Completed"),
      examList: frontOfficeAPI
        .getVisitsByPatientId(id)
        .withQuery({ max_num: 5 })
        .withFilter("visit_type", [2, 3], "in")
        .withFilter("status", "Completed"),
      purchaseList: frontOfficeAPI
        .getPurchasesByPatientId(id)
        .withQuery({ max_num: 5 }),
      documentList: frontOfficeAPI
        .getDocumentsByPatientId(id)
        .withQuery({ max_num: 5 }),
      taskList: frontOfficeAPI
        .getTasksByPatientId(id)
        .withQuery({ max_num: 5 }),
      noteList: frontOfficeAPI
        .getNotesByPatientId(id)
        .withQuery({ max_num: 5 }),
      requestList: frontOfficeAPI
        .getRequestsByPatientId(id)
        .withQuery({ max_num: 5 }),
    };
    // prepare requests array for bulk fetch
    const bulkRequests = Object.values(requests).map(
      (request) => request.bulkRequest,
    );
    // store bulk request keys
    const bulkRequestKeys = Object.keys(requests);
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
        Object.assign(axisPatientObject, {
          [bulkRequestKeys[i]]: response.contents,
        });
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
    return this.taskList.some((task) => task.status != "Completed");
  }
  get hasDoNotCall() {
    return this.do_not_call;
  }
  get hasDoNotAdjust() {
    return this.visitList[0].has_do_not_adjust;
  }
  async previousExam() {
    const previousExam = this.visitList.find((visit) => visit.visit_type === 3);
    if (previousExam) {
      return Object.assign(previousExam, parseSOAP(SOAPText(previousExam)));
    } else {
      // exam could not be found
    }
  }
  async previousVisit() {
    const previousVisit = this.visitList[0];
    if (previousVisit) {
      return Object.assign(previousVisit, parseSOAP(SOAPText(previousVisit)));
    } else {
      // visit could not be found
    }
  }
}

async function parseSOAP(visit) {
  const text = await SOAPText(visit);
  if (text) {
    return {
      diagnosisList: parseDiagnosisFromText(text),
      procedureList: parseProceduresFromText(text),
      problemList: parseProblemsFromText(text),
    };
  } else {
    //! there is no text or an error occured
  }
}

async function SOAPText(visit) {
  const api = frontOfficeAPI.getPDFVisitsByPatientId(
    visit.id,
    new Date(exam.date_entered).setHours(0, 0, 0, 0),
    new Date(exam.date_entered).setHours(23, 59, 59, 999),
  );
  let response = await frontOfficeFetch(api.fetchRequest, api.fetchOptions);
  if (response.ok) {
    return await response.text();
  } else {
    return "";
  }
}

// get extra note/treatment that isn't part of the main object
function parseDiagnosisFromText(text) {
  // filter for diagnosis codes
  const diagnosisList = [];
  for (const code of text.match(/[GMRS]{1}[0-9]{2}\.[A-Z0-9]*/gi)) {
    diagnosisList.push(ICD.fromCode(code));
  }
  return diagnosisList;
}

function parseProceduresFromText(text) {
  // filter for procedure codes
  const procedureList = [];
  for (const code of text.match(/[789]{2}[0-9]{3}/g)) {
    procedureList.push(CPT.fromCode(code));
  }
  return procedureList;
}

function parseProblemsFromText(text) {
  const problemList = [];
  // TODO test this regex, maybe add severity lookup
  for (const problem of text.match(
    /(?![:\.][\n\f\t\s])[a-z\s]*(?=\srating\s))/gi,
  )) {
    problemList.push(problem);
  }
  return problemList;
}
