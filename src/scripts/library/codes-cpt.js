// CPT codes commonly used by chiropractors at The Joint Chiropractic
const CPT_LOOKUP = Object.freeze({
  // Chiropractic Manipulative Treatment (CMT)
  98940: "Chiropractic manipulative treatment (CMT); spinal, 1-2 regions",
  98941: "Chiropractic manipulative treatment (CMT); spinal, 3-4 regions",
  98942: "Chiropractic manipulative treatment (CMT); spinal, 5 regions",
  98943: "Chiropractic manipulative treatment (CMT); extraspinal, 1 or more regions",
  // Evaluation and Management (New Patient)
  99202: "Office visit; new patient, straightforward complexity (15-29 mins)",
  99203: "Office visit; new patient, low complexity (30-44 mins)",
  99204: "Office visit; new patient, moderate complexity (45-59 mins)",
  // Evaluation and Management (Established Patient)
  99212: "Office visit; established patient, straightforward complexity (10-19 mins)",
  99213: "Office visit; established patient, low complexity (20-29 mins)",
  99214: "Office visit; established patient, moderate complexity (30-39 mins)",
});

export class CPT {
  constructor(code, description) {
    this.code = code;
    this.description = description;
  }

  static fromCode(code) {
    return new CPT(code, CPT_LOOKUP[code] || "Unknown Procedure Code");
  }

  toString() {
    return `${this.code} ${this.description}`;
  }
}
