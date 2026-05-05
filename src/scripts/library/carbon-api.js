import "dotenv/config";

const carbonAPI = {
  login: (username = "clinic2468@thejoint.com", password = "password123") => {
    return {
      category: "auth",
      return: {
        description: "login credentials (including userId)",
        type: "object",
      },
      usage: "",
      method: "POST",
      timeout: 180000,
      url: `https://carbon.biz/api/ClientUsers/AuthToken`,
      body: {
        username: `${username}`,
        password: `${password}`,
      },
      credentials: "include",
    };
  },
  getUser: (userId = 1234) => {
    return {
      category: "user",
      name: "get user",
      returnDescription: "an object representing the logged in user account and clinic location (including clientId)",
      usage: "",
      method: "GET",
      timeout: 180000,
      url: `https://carbon.biz/api/ClientUsers/${userId}`,
      credentials: "include",
    };
  },
  getTaskSummary: (clientId = 5678) => {
    return {
      category: "user",
      returnDescription: "an object listing carbon tasks by type",
      usage: "",
      method: "GET",
      timeout: 180000,
      url: `https://carbon.biz/api/ClientSummaries/ActionableCounts/${clientId}`,
      credentials: "omit",
    };
  },
  getAppointments: (clientId = 5678) => {
    return {
      category: "clinic",
      returnDescription: "an object listing carbon tasks by type",
      usage: "",
      method: "GET",
      timeout: 180000,
      url: `https://carbon.biz/api/Leads`,
      query: {
        clientId: `${clientId}`,
        appointmentStatus: 1,
      },
      credentials: "include",
    };
  },
  getClinicPhone: (clientId = 5678) => {
    return {
      category: "clinic",
      returnDescription: "a string representing the clinic virtual communications phone number",
      usage: "",
      method: "GET",
      timeout: 180000,
      url: `https://carbon.biz/legacy/api/sms/smsNumber`,
      query: {
        clientId: `${clientId}`,
      },
      credentials: "include",
    };
  },
  getContactsByPhone: (clientId = 5678, contactPhone = "+11234567890") => {
    return {
      category: "patient",
      returnDescription: "an array of contacts matching the phone number (resultant customerId matches AXIS patientId)",
      usage: "",
      method: "GET",
      timeout: 180000,
      url: `https://carbon.biz/legacy/api/contacts/byAnything`,
      query: {
        clientTypeId: 4,
        searchValue: `${contactPhone}`,
        clientId: `${clientId}`,
      },
      credentials: "include",
    };
  },
  getCommunicationHistory: (clientId = 5678, contactId = 246813579) => {
    return {
      category: "patient",
      name: "all calls",
      returnDescription: "an object containing arrays of calls and messages",
      usage: "",
      method: "GET",
      timeout: 180000,
      url: `https://carbon.biz/legacy/api/contacts/getcarbonactivity`,
      query: {
        contactId: `${contactId}`,
        clientId: `${clientId}`,
      },
      credentials: "include",
    };
  },
  getMessageHistory: (
    clientId = 5678,
    contactPhone = "+11234567890",
    startDate = "YYYY-MM-DD",
    endDate = "YYYY-MM-DD",
  ) => {
    return {
      category: "message",
      return: {
        description: "an array of messages between the client and a patient",
        type: "array",
      },
      usage: "",
      method: "GET",
      timeout: 180000,
      url: `https://carbon.biz/legacy/api/sms/ConversationsForOneNumber`,
      query: {
        start: `${startDate}`,
        end: `${endDate}`,
        to: `${contactPhone}`,
        clientId: `${clientId}`,
      },
      credentials: "include",
    };
  },
  sendTextMessage: (
    userId = 1234,
    clientId = 5678,
    clinicPhone = "+19876543210",
    contactPhone = "+11234567890",
    messageText = "Hello, world.",
  ) => {
    return {
      category: "message",
      returnDescription: "an object representing the sent message",
      usage: "",
      method: "POST",
      timeout: 180000,
      url: `https://carbon.biz/legacy/api/sms/sendMms`,
      body: {
        smsParameters: {
          from: `${clinicPhone}`,
          to: `${contactPhone}`,
          body: `${messageText}`,
          clientId: `${clientId}`,
          createdById: `${userId}`,
        },
      },
      query: {
        isImpoliteSend: false,
        isImpoliteSendConfirmed: false,
      },
      credentials: "include",
    };
  },
};
