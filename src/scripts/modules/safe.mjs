import DOMPurify from "dompurify";

const sanitizePolicy = window.trustedTypes?.createPolicy("dompurifyPolicy", {
  createHTML: (input) => {
    return DOMPurify.sanitize(input, { RETURN_TRUSTED_TYPE: true });
  },
});

export function safeHTML(unsafeString) {
  if (sanitizePolicy) {
    return sanitizePolicy.createHTML(unsafeString); // TrustedHTML object
    // ? "represents a string that a developer can insert into an injection sink that will render it as HTML"
  } else {
    return DOMPurify.sanitize(unsafeString); // string
  }
}
