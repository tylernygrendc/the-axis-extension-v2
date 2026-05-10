// ICD codes commonly used by chiropractors at The Joint Chiropractic
// TODO: add meralgia paresthetica and muscle contracture
const ICD_Map = Object.freeze({
  G: {
    44: {
      name: "Tension-type headache",
      201: { name: "unspecified, intractable", separator: ", " },
      209: { name: "unspecified, not intractable", separator: ", " },
      211: { name: "Episodic tension-type headache, intractable", replace: true },
      219: { name: "Episodic tension-type headache, not intractable", replace: true },
      221: { name: "Chronic tension-type headache, ", replace: true },
      86: { name: "Cervicogenic headache", replace: true },
    },
    54: {
      0: { name: "Brachial plexus disorders" },
      1: { name: "Lumbosacral plexus disorders" },
    },
    57: {
      1: {
        name: "Meralgia paresthetica",
        regions: { 0: "unspecified lower limb", 1: "right lower limb", 2: "left lower limb", 3: "bilateral lower limbs" },
        regionSeparator: ", ",
      },
    },
  },
  M: {
    24: {
      5: {
        name: "Contracture of joint",
        regionSeparator: ", ",
        0: { name: "unspecified site" },
        1: { regions: { 1: "right shoulder", 2: "left shoulder", 9: "unspecified shoulder" } },
        2: { regions: { 1: "right elbow", 2: "left elbow", 9: "unspecified elbow" } },
        3: { regions: { 1: "right wrist", 2: "left wrist", 9: "unspecified wrist" } },
        4: { regions: { 1: "right hand", 2: "left hand", 9: "unspecified hand" } },
        5: { regions: { 1: "right hip", 2: "left hip", 9: "unspecified hip" } },
        6: { regions: { 1: "right knee", 2: "left knee", 9: "unspecified knee" } },
        7: { regions: { 1: "right ankle/foot", 2: "left ankle/foot", 9: "unspecified ankle/foot" } },
        9: { name: "other specified joint" },
      },
    },
    25: {
      511: { name: "Pain in right shoulder" },
      512: { name: "Pain in left shoulder" },
      551: { name: "Pain in right hip" },
      552: { name: "Pain in left hip" },
    },
    47: {
      name: "Spondylosis",
      regionSeparator: ", ",
      2: { name: "with radiculopathy", separator: " " },
      81: { name: "without myelopathy or radiculopathy", separator: " " },
      regions: {
        2: "cervical region",
        3: "cervicothoracic region",
        4: "thoracic region",
        5: "thoracolumbar region",
        6: "lumbar region",
        7: "lumbosacral region",
      },
    },
    50: {
      regionSeparator: ", ",
      1: {
        name: "Cervical disc disorder with radiculopathy",
        regions: {
          0: "unspecified cervical region",
          1: "high cervical region",
          2: "mid-cervical region",
          3: "cervicothoracic region",
        },
      },
      2: {
        name: "Other cervical disc displacement",
        regions: {
          0: "unspecified cervical region",
          1: "high cervical region",
          2: "mid-cervical region",
          3: "cervicothoracic region",
        },
      },
    },
    51: {
      regionSeparator: ", ",
      1: {
        name: "Intervertebral disc disorders with radiculopathy",
        regions: { 4: "thoracic region", 5: "thoracolumbar region", 6: "lumbar region", 7: "lumbosacral region" },
      },
      2: {
        name: "Other intervertebral disc displacement",
        regions: { 4: "thoracic region", 5: "thoracolumbar region", 6: "lumbar region", 7: "lumbosacral region" },
      },
    },
    54: {
      12: { name: "Radiculopathy, cervical region" },
      13: { name: "Radiculopathy, cervicothoracic region" },
      16: { name: "Radiculopathy, lumbar region" },
      17: { name: "Radiculopathy, lumbosacral region" },
      2: { name: "Cervicalgia" },
      31: { name: "Sciatica, right side" },
      32: { name: "Sciatica, left side" },
      41: { name: "Lumbago with sciatica, right side" },
      42: { name: "Lumbago with sciatica, left side" },
      50: { name: "Low back pain, unspecified" },
      6: { name: "Pain in thoracic spine" },
    },
    62: {
      4: {
        name: "Contracture of muscle",
        regionSeparator: ", ",
        0: { name: "unspecified site" },
        1: { regions: { 1: "right shoulder", 2: "left shoulder", 9: "unspecified shoulder" } },
        2: { regions: { 1: "right upper arm", 2: "left upper arm", 9: "unspecified upper arm" } },
        3: { regions: { 1: "right forearm", 2: "left forearm", 9: "unspecified forearm" } },
        4: { regions: { 1: "right hand", 2: "left hand", 9: "unspecified hand" } },
        5: { regions: { 1: "right thigh", 2: "left thigh", 9: "unspecified thigh" } },
        6: { regions: { 1: "right lower leg", 2: "left lower leg", 9: "unspecified lower leg" } },
        7: { regions: { 1: "right ankle/foot", 2: "left ankle/foot", 9: "unspecified ankle/foot" } },
        8: { name: "other site" },
        9: { name: "multiple sites" },
      },
      830: { name: "Muscle spasm of back" },
      89: { name: "Other specified disorders of muscle" },
    },
    70: {
      regionSeparator: ", ",
      5: { name: "Other bursitis of", regions: { 1: "right knee", 2: "left knee" }, regionSeparator: " " },
      6: { name: "Trochanteric bursitis", regions: { 1: "right hip", 2: "left hip" }, regionSeparator: ", " },
      7: { name: "Other bursitis of hip", regions: { 1: "right hip", 2: "left hip" }, regionSeparator: ", " },
    },
    75: {
      101: { name: "Unspecified rotator cuff tear or rupture of right shoulder, not specified as traumatic" },
      102: { name: "Unspecified rotator cuff tear or rupture of left shoulder, not specified as traumatic" },
      41: { name: "Impingement syndrome of right shoulder" },
      42: { name: "Impingement syndrome of left shoulder" },
    },
    77: {
      regionSeparator: ", ",
      0: { name: "Medial epicondylitis", regions: { 1: "right elbow", 2: "left elbow" }, regionSeparator: ", " },
      1: { name: "Lateral epicondylitis", regions: { 1: "right elbow", 2: "left elbow" }, regionSeparator: ", " },
    },
    79: {
      601: { name: "Pain in right arm" },
      602: { name: "Pain in left arm" },
      641: { name: "Pain in right thigh" },
      642: { name: "Pain in left thigh" },
      644: { name: "Pain in right foot" },
      645: { name: "Pain in left foot" },
      661: { name: "Pain in right lower leg" },
      662: { name: "Pain in left lower leg" },
    },
    99: {
      regionSeparator: " ",
      0: { name: "Segmental and somatic dysfunction of" },
      1: { name: "Subluxation complex (vertebral) of" },
      regions: {
        0: "head region",
        1: "cervical region",
        2: "thoracic region",
        3: "lumbar region",
        4: "sacral region",
        5: "pelvic region",
        6: "lower extremity",
        7: "upper extremity",
        8: "rib cage",
      },
    },
  },
  R: {
    "07": { 89: { name: "Other chest pain" } },
    20: { 1: { name: "Hypoesthesia of skin" }, 2: { name: "Paresthesia of skin" }, 3: { name: "Hyperesthesia" } },
    29: { 3: { name: "Abnormal posture" } },
    51: { 9: { name: "Headache, unspecified" } },
    68: { 84: { name: "Jaw pain" } },
  },
  S: {
    13: { 4: { name: "Sprain of ligaments of cervical spine" } },
    23: { 3: { name: "Sprain of ligaments of thoracic spine" } },
    33: { 5: { name: "Sprain of ligaments of lumbar spine" } },
    63: { 50: { name: "Unspecified sprain of", regions: { 1: "right wrist", 2: "left wrist" }, regionSeparator: " " } },
    93: {
      40: {
        name: "Sprain of unspecified ligament of",
        regions: { 1: "right ankle", 2: "left ankle" },
        regionSeparator: " ",
      },
    },
    16: { 1: { name: "Strain of muscle, fascia, and tendon of neck" } },
    29: { "012": { name: "Strain of muscle and tendon of back wall of thorax" } },
    39: { "012": { name: "Strain of muscle, fascia, and tendon of lower back" } },
    46: {
      81: {
        name: "Strain of other muscles, fascia, and tendons of",
        regions: { 1: "right shoulder/upper arm", 2: "left shoulder/upper arm" },
        regionSeparator: " ",
      },
    },
    56: {
      91: {
        name: "Strain of unspecified muscles/fascia/tendons at forearm level",
        regions: { 1: "right arm", 2: "left arm" },
        regionSeparator: ", ",
      },
    },
    76: {
      "01": {
        name: "Strain of muscle, fascia, and tendon of",
        regions: { 1: "right hip", 2: "left hip" },
        regionSeparator: " ",
      },
      81: {
        name: "Strain of other specified muscles, fascia and tendons at thigh level",
        regions: { 1: "right thigh", 2: "left thigh" },
        regionSeparator: ", ",
        skipEncounter: true,
      },
    },
    86: {
      11: {
        name: "Strain of posterior muscle group/tendon",
        regions: { 1: "right calf", 2: "left calf" },
        regionSeparator: ", ",
      },
    },
  },
  common: {
    encounters: { A: "initial encounter", D: "subsequent encounter", S: "sequela" },
  },
});

export class ICD {
  constructor(code, description) {
    this.code = code;
    this.description = description;
  }
  static fromCode(code) {
    const match = code.match(/^([A-Z])([0-9]{2})(?:\.([0-9A-Z]+))?$/i);
    if (!match) return null;

    const [_, chapter, category, sub] = match;
    const chapMap = ICD_Map[chapter];
    if (!chapMap) return null;

    const catMap = chapMap[category];
    if (!catMap) return null;

    let description = catMap.name || "";
    let current = catMap;
    let skipEncounter = false;
    let regionSeparator = catMap.regionSeparator || " ";

    if (sub) {
      let subCode = sub.replace(/X+/, "");
      let encounterChar = "";

      if (/[ADS]$/i.test(subCode)) {
        encounterChar = subCode.slice(-1).toUpperCase();
        subCode = subCode.slice(0, -1);
      }

      // 1. Traverse specific sub-mappings
      while (subCode.length > 0) {
        let matched = false;
        for (let len = subCode.length; len > 0; len--) {
          const testSub = subCode.substring(0, len);
          if (current[testSub]) {
            const subMatch = current[testSub];
            if (subMatch.name) {
              const separator = subMatch.separator ?? (description ? " " : "");
              if (subMatch.replace) {
                description = subMatch.name;
              } else {
                description += separator + subMatch.name;
              }
            }
            if (subMatch.regionSeparator !== undefined) regionSeparator = subMatch.regionSeparator;
            if (subMatch.skipEncounter) skipEncounter = true;
            current = subMatch;
            subCode = subCode.substring(len);
            matched = true;
            break;
          }
        }
        if (!matched) break;
      }

      // 2. Handle regions/sites
      const detailMap = current.regions || current.sites || catMap.regions || catMap.sites;
      if (detailMap && subCode.length > 0) {
        const key = subCode[0];
        const name = detailMap[key];
        if (name) {
          description += regionSeparator + name;
          subCode = subCode.substring(1);
        }
      }

      if (encounterChar && !skipEncounter && ICD_Map.common.encounters[encounterChar]) {
        description += ", " + ICD_Map.common.encounters[encounterChar];
      }
    }

    return new ICD(code, description);
  }
}
