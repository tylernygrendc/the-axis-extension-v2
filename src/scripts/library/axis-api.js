// every front office API
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
      get fetchRequest() {
        return `${this.url}${this.hasOwn(query) ? "?" += new URLSearchParams(this.query) : ""}`;
      },
      get fetchOptions() {
        const options = {
          method: this.method,
          timeout: this.timeout || 180000,
          credentials: this.credentials || "include"
        }
        if(this.method === "POST" && typeof this.body === 'object' ) {
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
    }
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
      returnDescription: "an object listing the key/name pairs of the clinic(s) a user is authorized for",
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
      returnDescription: "an array representing seen and/or waiting patients up to max_num",
      usage: "",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/TJ_ClinicUsers/custom/TJ_Visits/patient_info`,
      query: {
        view: "list",
        erased_fields_: false,
        "filter%5B1%5D%5Bdate_entered%5D%5B%24dateRange%5D": "today",
        "filter%5B2%5D%5Btj_clinics_tj_visits_1tj_clinics_ida%5D": `${clinicId}`,
        max_num: 300,
      },
      queryOptions: {
        "filter%5B0%5D%5Bstatus%5D": ["Waiting Queue", "Pending Notes", "Completed"],
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
        "filter%5Bphone_mobile%5D": `${patientPhone}`,
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
        order_by: ["date_entered%3Adesc"],
      },
      queryOptions: {
        view: ["subpanel-for-contacts-contacts_tj_visits_1", "record", "preview", "list"],
        "filter%5B0%5D%5Bstatus%5D": ["Completed", "Cancelled", "Waiting Queue", "Pending"],
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
        order_by: ["date_entered%3Adesc"],
      },
      queryOptions: {
        view: ["subpanel-for-contacts-contacts_tj_purchases_1", "record", "preview", "list"],
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
        "filter%5B0%5D%5Bis_incorrect_c%5D": true,
      },
      queryOptions: {
        view: ["subpanel-for-contacts-contacts_tj_purchases_1", "record", "preview", "list"],
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
        order_by: ["status%3Adesc"],
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
      returnDescription: "an array of staff notes (not medical records) up to max_num",
      usage: "access patient account details",
      method: "GET",
      timeout: 180000,
      url: `https://axis.thejoint.com/rest/v11_24/Contacts/${patientId}/link/contacts_tj_officenotes_1`,
      credentials: "include",
      query: {
        erased_fields: true,
        max_num: 5,
        order_by: ["date_entered%3Adesc"],
      },
      queryOptions: {
        view: ["subpanel-for-contacts-contacts_tj_officenotes_1", "record", "preview", "list"],
        fields: [], // string, can be any key(s) on the object
      },
    };
  },
  getRequestsByPatientId: (patientId) => {
    return {
      category: "patient",
      returnDescription: "an array of patient requests (for account actions) up to max_num",
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
        view: ["subpanel-for-contacts-contacts_tj_officenotes_1", "record", "preview", "list"],
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
        order_by: ["date_modified%3Adesc"],
      },
      queryOptions: {
        view: ["subpanel-for-contacts-contacts_tj_officenotes_1", "record", "preview", "list"],
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
      returnDescription: "an object representing single staff note (not medical record)",
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
      returnDescription: "treatment notes from the selected range in a pdf format",
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
      returnDescription: "an array containing the patient object and file object",
      usage: "link a file upload to a patient's record or update its metadata (ie is_incorrect_c: true)",
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

const backOfficeAPI = {
  login: (username, password, csrfToken, inClinic) => {
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
        doctor_status: inClinic ? "In Clinic" : "Out of Clinic",
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
  addComplaint: (patientId, visitId, complaintName, painScale, frequency, progress, status) => {
    return {
      category: "patient",
      returnDescription: null,
      usage: "create a listed complaint",
      method: "POST",
      timeout: 180000,
      url: `https://backoffice.thejoint.com/create-complaints`,
      body: {
        "data%5B0%5D%5BvisitId%5D": `${visitId}`,
        "data%5B0%5D%5BcomplaintName%5D": `${complaintName}`, // string
        "data%5B0%5D%5Bstatus%5D": `${status}`, // "Active"
        "data%5B0%5D%5BpatientId%5D": `${patientId}`,
        "data%5B0%5D%5Bsame_better_worse%5D": `${progress}`, // "same", "better", "worse"
        "data%5B0%5D%5Bdescription%5D": `${painScale}`, // pain scale 0 - 10
        "data%5B0%5D%5Bfrequency%5D": `${frequency}`, // ">75%", "50-75%", "25-50%", "<25%"
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
        "data%5BcomplaintId%5B": `${complaintId}`,
        "data%5Breason_closed%5D": `${reason}`, // "care", "naturally", "other_care", "added_in_error", "other"
        "data%5Bother_reason%5D": `${reasonText}`,
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
        "data%5B0%5D%5BpatientId%5D": `${patientId}`,
        "data%5BtreatmentItems%5D%5B0%5D%5Bduration%5D": `${weeksInPlan}`,
        "data%5BtreatmentItems%5D%5B0%5D%5Bfrequency%5D": `${visitsPerWeek}`,
        "data%5BtreatmentItems%5D%5B0%5D%5Bsort%5D": 0,
        "data%5Bsessions%5D": `${visitsPerWeek * weeksInPlan}`,
        "data%5BweeksLength%5D": `${weeksInPlan}`,
        "data%5B0%5D%5BvisitId%5D": `${visitId}`,
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
        "data%5B0%5D%5BvisitId%5D": `${visitId}`,
        "data%5B0%5D%5BregularCode%5D": "Other",
        "data%5B0%5D%5BotherCode%5D": `${code}`,
        "data%5B0%5D%5BotherDesc%5D": `${description}`,
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
        "data%5B0%5D%5BvisitId%5D": `${visitId}`,
        "&data%5Bnotes%5D": `${noteText}`,
      },
      credentials: "include",
    };
  },
  getAppendedNotes: (visitId, maxNum = 20, offset = 0) => {
    return {
      category: "patient",
      returnDescription: "an array of appended notes up to maxNum, starting from a given offset",
      usage: "get all appended notes",
      method: "POST",
      timeout: 180000,
      url: `https://backoffice.thejoint.com/load-soap-notes`,
      body: {
        "data%5B0%5D%5BvisitId%5D": `${visitId}`,
        "data%5Boffset%5D": `${maxNum}`,
        "data%5BmaxNum%5D": `${offset}`,
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
        "data%5Bnecknupperbackex%5D": neckStretches,
        "data%5Bnecknupperbackstretches%5D": neckExercises,
        "data%5Bposturalex%5D": posturalExercises,
        "data%5Bcoremuscleex%5D": coreExercises,
        "data%5Blumbarex%5D": backExercises,
        "data%5Blumbarstretches%5D": backStretches,
        "data%5Bhipstretches%5D": hipStretches,
        "data%5Bpatient_id%5D": `${patientId}`,
      },
      credentials: "include",
    };
  },
};
