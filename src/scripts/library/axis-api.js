// methods applied to all front office and back office api methods
const RequestExtensions = {
  get fetchRequest() {
    const params = new URLSearchParams();
    if (this.query) {
      for (const [key, value] of Object.entries(this.query)) {
        params.append(key, Array.isArray(value) ? value.join(",") : value);
      }
    }
    const queryStr = params.toString();
    return `${this.url}${queryStr ? "?" + queryStr : ""}`;
  },
  get fetchOptions() {
    const options = {
      method: this.method,
      timeout: this.timeout || 180000,
      credentials: this.credentials || "include",
    };
    if (this.method === "POST" && this.body && typeof this.body === "object") {
      options.body = new URLSearchParams(this.body).toString();
    }
    return options;
  },
  get bulkRequest() {
    return {
      ...this.fetchOptions,
      url: `${this.fetchRequest.split(/(?=v11)/gi)[1] || this.fetchRequest}`,
    };
  },
  withQuery(newQuery) {
    this.query = { ...(this.query || {}), ...newQuery };
    return this;
  },
  withBody(newBody) {
    this.body = { ...(this.body || {}), ...newBody };
    return this;
  },
  withFilter(field, value, operator, index) {
    // operator options:
    // - in: matches if in value array
    // - dateRange: matches if witin date range
    // - starts: matches if starts with value
    // created with .withFilter('last_name', 'Sm', 'starts')
    if (index === undefined) {
      // find all existing filter indices
      const indices = Object.keys(this.query || {})
        .map((key) => key.match(/^filter\[(\d+)\]/))
        .filter((match) => match)
        .map((match) => parseInt(match[1]));

      // use the next index, or 0 if none exist
      // this prevents collision/overwriting filters
      index = indices.length > 0 ? Math.max(...indices) + 1 : 0;
    }

    let key = `filter[${index}][${field}]`;
    if (operator) {
      const op = operator.startsWith("$") ? operator : `$${operator}`;
      key += `[${op}]`;
    }
    return this.withQuery({ [key]: value });
  },
};

function decorateRequest(req) {
  if (!req || typeof req !== "object") return req;
  return Object.defineProperties(
    req,
    Object.getOwnPropertyDescriptors(RequestExtensions),
  );
}

// every front office api
const frontOfficeAPI = {
  login: (username = "", password = "") => {
    return {
      category: "auth",
      returnDescription: "an object containing authorization tokens",
      usage: "sign in an authorized axis user",
      method: "POST",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/oauth2/token`,
      body: {
        grant_type: "password",
        username: `${username}`,
        password: `${password}`,
        client_id: "sugar",
        platform: "base",
        client_secret: "",
        current_language: "en_us",
        client_info: { current_language: "en_us" },
      },
      credentials: "include",
      query: {
        platform: "base",
      },
    };
  },
  refresh: (refreshToken) => {
    return {
      category: "auth",
      returnDescription: "an object containing authorization tokens",
      usage: "continue/extend a user's session",
      method: "POST",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/oauth2/token`,
      body: {
        grant_type: "refresh_token",
        client_id: "sugar",
        client_secret: "",
        refresh_token: `${refreshToken}`,
        platform: "base",
        refresh: true,
      },
      credentials: "include",
      query: {
        platform: "base",
      },
    };
  },
  logout: (refreshToken) => {
    return {
      category: "auth",
      returnDescription: null,
      usage: "end a user's session",
      method: "POST",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/oauth2/token`,
      body: {
        grant_type: "refresh_token",
        client_id: "sugar",
        client_secret: "",
        refresh_token: `${refreshToken}`,
        platform: "base",
        refresh: true,
      },
      credentials: "include",
      query: {
        platform: "base",
      },
    };
  },
  getUser: () => {
    return {
      category: "user",
      return: "an object representing the current user",
      usage: "",
      method: "POST",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/me`,
    };
  },
  getAuthorizedClinics: () => {
    return {
      category: "user",
      returnDescription:
        "an object listing the key/name pairs of the clinic(s) a user is authorized for",
      usage: "prompt the user to select their current clinic",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/Dashboards/enum/clinicslist`,
      credentials: "include",
    };
  },
  changeClinic: (userId, clinicId) => {
    return {
      category: "user",
      returnDescription: "an object stating action status",
      usage: "change the user's current signed-in clinic",
      method: "POST",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/changeClinic`,
      body: {
        userID: `${userId}`,
        clinicID: `${clinicId}`,
      },
      credentials: "include",
    };
  },
  getClinicById: (id) => {
    return {
      category: "user",
      returnDescription: "an object matching the specified clinic",
      usage: "get a clinic's details",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/TJ_Clinics/${id}`,
      credentials: "include",
      queryOptions: {
        view: ["record", "preview", "list"],
      },
    };
  },
  getInClinicUsers: () => {
    return {
      category: "clinic",
      name: "all in-clinic users",
      returnDescription: "an array listing all in-clinic users",
      usage: "get a list of doctors that are currently in the user's clinic",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/TJ_ClinicUsers/custom/in-clinic-users`,
      credentials: "include",
    };
  },
  getAllAxisUsers: (clinicId) => {
    return {
      category: "user",
      name: "users",
      returnDescription: "an array representing all axis users",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/Reports/${clinicId}/filter`,
      credentials: "include",
      query: {
        use_saved_filters: false,
      },
    };
  },
  getQueue: (clinicId) => {
    return {
      category: "user",
      returnDescription:
        "an array representing seen and/or waiting patients up to max_num",
      usage: "",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/TJ_ClinicUsers/custom/TJ_Visits/patient_info`,
      query: {
        view: "list",
        erased_fields_: false,
        "filter[1][date_entered][$dateRange]": "today",
        "filter[2][tj_clinics_tj_visits_1tj_clinics_ida]": `${clinicId}`,
        max_num: 300,
      },
      queryOptions: {
        "filter[0][status]": ["Waiting Queue", "Pending Notes", "Completed"],
      },
      credentials: "include",
    };
  },
  getPatientById: (patientId) => {
    return {
      category: "patient",
      returnDescription: "an object representing a single patient",
      usage: "lookup a patient record based id",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/Contacts/${patientId}`,
      credentials: "include",
    };
  },
  getPatientByPhone: (patientPhone) => {
    return {
      category: "patient",
      returnDescription: "an array of all matching patients",
      usage: "lookup a patient record based on name, birthdate, or phone",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/Contacts/search_patient`,
      credentials: "include",
      query: {
        "filter[phone_mobile]": `${patientPhone}`,
      },
    };
  },
  getVisitsByPatientId: (patientId) => {
    return {
      category: "patient",
      returnDescription: "an array of visits up to max_num",
      usage: "access patient account details",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/Contacts/${patientId}/link/contacts_tj_visits_1`,
      credentials: "include",
      query: {
        erased_fields: true,
        max_num: 5,
        order_by: ["date_entered:desc"],
      },
      queryOptions: {
        view: [
          "subpanel-for-contacts-contacts_tj_visits_1",
          "record",
          "preview",
          "list",
        ],
        "filter[0][status]": [
          "Completed",
          "Cancelled",
          "Waiting Queue",
          "Pending",
        ],
        fields: [], // string, can be any key(s) on the object
      },
    };
  },
  getPurchasesByPatientId: (patientId) => {
    return {
      category: "patient",
      returnDescription: "an array of purchases up to max_num",
      usage: "access patient account details",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/Contacts/${patientId}/link/contacts_tj_purchases_1`,
      credentials: "include",
      query: {
        erased_fields: true,
        max_num: 5,
        order_by: ["date_entered:desc"],
      },
      queryOptions: {
        view: [
          "subpanel-for-contacts-contacts_tj_purchases_1",
          "record",
          "preview",
          "list",
        ],
        fields: [], // string, can be any key(s) on the object
      },
    };
  },
  getDocumentsByPatientId: (patientId) => {
    return {
      category: "patient",
      returnDescription: "an array of documents up to max_num",
      usage: "access patient account details",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/Contacts/${patientId}/link/documents`,
      credentials: "include",
      query: {
        erased_fields: true,
        max_num: 5,
        "filter[0][is_incorrect_c]": true,
      },
      queryOptions: {
        view: [
          "subpanel-for-contacts-contacts_tj_purchases_1",
          "record",
          "preview",
          "list",
        ],
        fields: [], // string, can be any key(s) on the object
      },
    };
  },
  getTasksByPatientId: (patientId) => {
    return {
      category: "patient",
      returnDescription: "an array of tasks up to max_num",
      usage: "access patient account details",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/Contacts/${patientId}/link/all_tasks`,
      credentials: "include",
      query: {
        erased_fields: true,
        max_num: 5,
        order_by: ["status:desc"],
      },
      queryOptions: {
        view: ["subpanel-for-contacts-all_tasks"],
        fields: [], // string, can be any key(s) on the object
      },
    };
  },
  getNotesByPatientId: (patientId) => {
    return {
      category: "patient",
      returnDescription:
        "an array of staff notes (not medical records) up to max_num",
      usage: "access patient account details",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/Contacts/${patientId}/link/contacts_tj_officenotes_1`,
      credentials: "include",
      query: {
        erased_fields: true,
        max_num: 5,
        order_by: ["date_entered:desc"],
      },
      queryOptions: {
        view: [
          "subpanel-for-contacts-contacts_tj_officenotes_1",
          "record",
          "preview",
          "list",
        ],
        fields: [], // string, can be any key(s) on the object
      },
    };
  },
  getRequestsByPatientId: (patientId) => {
    return {
      category: "patient",
      returnDescription:
        "an array of patient requests (for account actions) up to max_num",
      usage: "access patient account details",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/Contacts/${patientId}/link/contacts_tj_patientrequests_1`,
      credentials: "include",
      query: {
        erased_fields: true,
        max_num: 5,
      },
      queryOptions: {
        view: [
          "subpanel-for-contacts-contacts_tj_officenotes_1",
          "record",
          "preview",
          "list",
        ],
        fields: [], // string, can be any key(s) on the object
      },
    };
  },
  getFormsByPatientId: (patientId) => {
    return {
      category: "patient",
      returnDescription: "an array of patient forms up to max_num",
      usage: "access patient account details",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/Contacts/${patientId}/link/contacts_tj_intakeformstracker_1`,
      credentials: "include",
      query: {
        erased_fields: true,
        max_num: 5,
        order_by: ["date_modified:desc"],
      },
      queryOptions: {
        view: [
          "subpanel-for-contacts-contacts_tj_officenotes_1",
          "record",
          "preview",
          "list",
        ],
        fields: [], // string, can be any key(s) on the object
      },
    };
  },
  getVisitById: (visitId) => {
    return {
      category: "patient",
      return: {
        description: "an object representing a single visit",
        type: "object",
      },
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/TJ_Visits/${visitId}`,
      credentials: "include",
      query: {
        erased_fields: true,
        viewed: 1, // this probably isn't necessary
      },
      queryOptions: {
        view: ["record", "preview", "list"],
        fields: [], // string, can be any key(s) on the object
      },
    };
  },
  getPurchaseById: (purchaseId) => {
    return {
      category: "patient",
      name: "purchase",
      returnDescription: "an object representing a single purchase",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/TJ_Purchases/${purchaseId}`,
      credentials: "include",
      query: {
        erased_fields: true,
        viewed: 1, // this probably isn't necessary
      },
      queryOptions: {
        view: ["record", "preview", "list"],
        fields: [], // string, can be any key(s) on the object
      },
    };
  },
  getDocumentById: (documentId) => {
    return {
      category: "patient",
      name: "document",
      returnDescription: "an object representing a single document",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/Documents/${documentId}`,
      credentials: "include",
      query: {
        erased_fields: true,
        viewed: 1, // this probably isn't necessary
      },
      queryOptions: {
        view: ["record", "preview", "list"],
        fields: [], // string, can be any key(s) on the object
      },
    };
  },
  getTaskById: (taskId) => {
    return {
      category: "patient",
      name: "task",
      returnDescription: "single task",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/Tasks/${taskId}`,
      credentials: "include",
      query: {
        erased_fields: true,
        viewed: 1, // this probably isn't necessary
      },
      queryOptions: {
        view: ["record", "preview", "list"],
        fields: [], // string, can be any key(s) on the object
      },
    };
  },
  getNoteById: (noteId) => {
    return {
      category: "patient",
      name: "note",
      returnDescription:
        "an object representing single staff note (not medical record)",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/Notes/${noteId}`,
      credentials: "include",
      query: {
        erased_fields: true,
        viewed: 1, // this probably isn't necessary
      },
      queryOptions: {
        view: ["record", "preview", "list"],
        fields: [], // string, can be any key(s) on the object
      },
    };
  },
  getRequestById: (requestId) => {
    return {
      category: "patient",
      name: "request",
      returnDescription: "an object representing a single request",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/TJ_PatientRequests/${requestId}`,
      credentials: "include",
      query: {
        erased_fields: true,
        viewed: 1, // this probably isn't necessary
      },
      queryOptions: {
        view: ["record", "preview", "list"],
        fields: [], // string, can be any key(s) on the object
      },
    };
  },
  getFormById: (formId) => {
    return {
      category: "patient",
      name: "form",
      returnDescription: "an object representing a single form",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/TJ_IntakeFormsTracker/${formId}`,
      credentials: "include",
      query: {
        erased_fields: true,
        viewed: 1, // this probably isn't necessary
      },
      queryOptions: {
        view: ["record", "preview", "list"],
        fields: [], // string, can be any key(s) on the object
      },
    };
  },
  getPDFVisitsByPatientId: (patientId, startDate, endDate) => {
    return {
      category: "patient",
      returnDescription:
        "treatment notes from the selected range in a pdf format",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/GotenbergPdfManager/download`,
      credentials: "include",
      query: {
        module: "Contacts",
        record: `${patientId}`,
        template_name: "soap-notes",
        date_entered_from: `${startDate}`,
        date_entered_to: `${endDate}`,
      },
    };
  },
  uploadFile: (formData) => {
    return {
      category: "patient",
      name: "file upload",
      returnDescription: "an object representing the file (including guid)",
      usage: "upload a pdf document to axis",
      method: "POST",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/Documents/temp/file/filename`,
      body: formData,
      credentials: "include",
      query: {
        platform: "base",
      },
    };
  },
  addUploadedFileToPatientRecord: (
    userId,
    patientId,
    fileGUID,
    fileName,
    documentName,
    category,
    subcategory,
    description,
    omit,
  ) => {
    return {
      category: "patient",
      returnDescription:
        "an array containing the patient object and file object",
      usage:
        "link a file upload to a patient's record or update its metadata (ie is_incorrect_c: true)",
      method: "POST",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/Contacts/${patientId}/link/documents`,
      body: {
        deleted: false,
        doc_type: "Sugar",
        revision: "1",
        is_template: false,
        clinicname_c: false,
        is_incorrect_c: `${omit}`,
        patient_id_c: `${patientId}`,
        assigned_user_id: `${userId}`,
        category_id: `${category}`,
        subcategory_id: `${subcategory}`,
        filename: `${fileName}`,
        document_name: `${documentName}`,
        description: `${description}`,
        filename_guid: `${fileGUID}`,
      },
      credentials: "include",
    };
  },
};

// every back office api
const backOfficeAPI = {
  login: (csrfToken, username, password, status) => {
    return {
      category: "auth",
      returnDescription: null,
      usage: "sign in an authorized axis user",
      method: "POST",
      timeout: 180000,
      url: `https://backoffice.thejoint.com/login`,
      body: {
        _token: `${csrfToken}`,
        user_name: `${username}`,
        password: `${password}`,
        doctor_status: `${status}`,
      },
      credentials: "include",
    };
  },
  changeClinic: (clinicId) => {
    return {
      category: "auth",
      returnDescription: null,
      usage: "change the user's current signed-in clinic",
      method: "POST",
      timeout: 180000,
      url: `https://backoffice.thejoint.com/switch-clinic`,
      body: {
        clinic_id: `${clinicId}`,
      },
      credentials: "include",
    };
  },
  addComplaint: (
    patientId,
    visitId,
    complaintName,
    painScale,
    frequency,
    progress,
    status,
  ) => {
    return {
      category: "patient",
      returnDescription: null,
      usage: "create a listed complaint",
      method: "POST",
      timeout: 180000,
      url: `https://backoffice.thejoint.com/create-complaints`,
      body: {
        "data[0][visitId]": `${visitId}`,
        "data[0][complaintName]": `${complaintName}`, // string
        "data[0][status]": `${status}`, // "Active"
        "data[0][patientId]": `${patientId}`,
        "data[0][same_better_worse]": `${progress}`, // "same", "better", "worse"
        "data[0][description]": `${painScale}`, // pain scale 0 - 10
        "data[0][frequency]": `${frequency}`, // ">75%", "50-75%", "25-50%", "<25%"
        visit_id: `${visitId}`,
        patient_id: `${patientId}`,
      },
      credentials: "include",
    };
  },
  deleteComplaint: (complaintId, reason, reasonText) => {
    return {
      category: "patient",
      returnDescription: null,
      usage: "delete a listed complaint",
      method: "POST",
      timeout: 180000,
      url: `https://backoffice.thejoint.com/delete-complaint`,
      body: {
        "data[complaintId[": `${complaintId}`,
        "data[reason_closed]": `${reason}`, // "care", "naturally", "other_care", "added_in_error", "other"
        "data[other_reason]": `${reasonText}`,
      },
      credentials: "include",
    };
  },
  addTreatmentPlan: (patientId, visitId, visitsPerWeek, weeksInPlan) => {
    return {
      category: "patient",
      returnDescription: null,
      usage: "create a treatment plan",
      method: "POST",
      timeout: 180000,
      url: `https://backoffice.thejoint.com/create-treatment`,
      body: {
        "data[0][patientId]": `${patientId}`,
        "data[treatmentItems][0][duration]": `${weeksInPlan}`,
        "data[treatmentItems][0][frequency]": `${visitsPerWeek}`,
        "data[treatmentItems][0][sort]": 0,
        "data[sessions]": `${visitsPerWeek * weeksInPlan}`,
        "data[weeksLength]": `${weeksInPlan}`,
        "data[0][visitId]": `${visitId}`,
        patient_id: `${patientId}`,
      },
      credentials: "include",
    };
  },
  addDiagnosis: (visitId, code, description) => {
    return {
      category: "patient",
      name: "create diagnosis",
      returnDescription: "",
      usage: "create a listed diagnosis",
      method: "POST",
      timeout: 180000,
      url: `https://backoffice.thejoint.com/create-diagnostic`,
      body: {
        "data[0][visitId]": `${visitId}`,
        "data[0][regularCode]": "Other",
        "data[0][otherCode]": `${code}`,
        "data[0][otherDesc]": `${description}`,
      },
      credentials: "include",
    };
  },
  deleteDiagnosis: (diagnosisId) => {
    return {
      category: "patient",
      name: "delete diagnosis",
      returnDescription: null,
      usage: "delete a listed diagnosis",
      method: "GET",
      timeout: 180000,
      url: `https://backoffice.thejoint.com/create-diagnostic/${diagnosisId}`,
      credentials: "include",
    };
  },
  appendNote: (visitId, noteText) => {
    return {
      category: "patient",
      returnDescription: null,
      usage: "append a visit note",
      method: "POST",
      timeout: 180000,
      url: `https://backoffice.thejoint.com/add-soap-note`,
      body: {
        "data[0][visitId]": `${visitId}`,
        "&data[notes]": `${noteText}`,
      },
      credentials: "include",
    };
  },
  getAppendedNotes: (visitId, maxNum = 20, offset = 0) => {
    return {
      category: "patient",
      returnDescription:
        "an array of appended notes up to maxNum, starting from a given offset",
      usage: "get all appended notes",
      method: "POST",
      timeout: 180000,
      url: `https://backoffice.thejoint.com/load-soap-notes`,
      body: {
        "data[0][visitId]": `${visitId}`,
        "data[offset]": `${maxNum}`,
        "data[maxNum]": `${offset}`,
      },
      credentials: "include",
    };
  },
  getShortcuts: () => {
    return {
      category: "user",
      name: "all shortcuts",
      returnDescription: "an array of all snippets (including id)",
      usage: "get user shortcut (text snippet)",
      method: "GET",
      timeout: 180000,
      url: `https://backoffice.thejoint.com/shortcuts`,
      credentials: "include",
    };
  },
  updateShortcut: (shortcutId, keyCombo, snippetText) => {
    return {
      category: "user",
      name: "modify shortcut",
      returnDescription: null,
      usage: "set user shortcut (text snippet)",
      method: "POST",
      timeout: 180000,
      url: `https://backoffice.thejoint.com/shortcuts`,
      body: {
        id: 328, // id matches result of GET https://backoffice.thejoint.com/shortcuts
        key_combination: `${keyCombo}`, // "Alt+a"
        normalized_keys: `${keyCombo}`, // "Alt+a"
        value: `${snippetText}`, // string
      },
      credentials: "include",
    };
  },
  emailInstructions: (
    patientId,
    neckStretches = false,
    backStretches = false,
    hipStretches = false,
    neckExercises = false,
    backExercises = false,
    posturalExercises = false,
    coreExercises = false,
  ) => {
    return {
      category: "patient",
      name: "email instructions",
      returnDescription: null,
      usage: "send home instructions to patient",
      method: "POST",
      timeout: 180000,
      url: `https://backoffice.thejoint.com/send-home-instruction`,
      body: {
        "data[necknupperbackex]": neckStretches,
        "data[necknupperbackstretches]": neckExercises,
        "data[posturalex]": posturalExercises,
        "data[coremuscleex]": coreExercises,
        "data[lumbarex]": backExercises,
        "data[lumbarstretches]": backStretches,
        "data[hipstretches]": hipStretches,
        "data[patient_id]": `${patientId}`,
      },
      credentials: "include",
    };
  },
};

[frontOfficeAPI, backOfficeAPI].forEach((api) => {
  for (const key in api) {
    if (typeof api[key] === "function") {
      const original = api[key];
      api[key] = (...args) => decorateRequest(original(...args));
    }
  }
});
