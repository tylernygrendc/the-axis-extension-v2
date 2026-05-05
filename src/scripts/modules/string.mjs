export function camelCase(string = "") {
  return string.split(/-|[A-Z]|_|\s/g).reduce((acc, cv, i) => {
    return i === 0
      ? (acc += cv)
      : (acc += `${cv.charAt(0).toUpperCase()}${cv.slice(1)}`);
  }, "");
}
export function capitalize(string = "", firstOnly = true) {
  return string
    .split(firstOnly ? /(\.\s+)|(?=^[A-Z])/gi : /(\s+)/g)
    .reduce((acc, cv) => {
      acc += cv.charAt(0).toUpperCase() + cv.slice(1);
      return acc;
    }, "");
}
export function kebabCase(string) {
  return string.split(/(?=[A-Z])|_|\s/g).reduce((acc, cv, i, initialArray) => {
    return i < initialArray.length - 1
      ? (acc += `${cv.toLowerCase()}-`)
      : (acc += cv.toLowerCase());
  }, "");
}
export function numberText(number) {
  const onesLookup = {
    0: "zero",
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
    7: "seven",
    8: "eight",
    9: "nine",
  };
  const tensLookup = {
    2: "twenty",
    3: "thirty",
    4: "forty",
    5: "fifty",
    6: "sixty",
    7: "seventy",
    8: "eighty",
    9: "ninety",
  };
  const teensLookup = {
    10: "ten",
    11: "eleven",
    12: "twelve",
    13: "thirteen",
    14: "fourteen",
    15: "fifteen",
    16: "sixteen",
    17: "seventeen",
    18: "eighteen",
    19: "nineteen",
  };

  number = Math.round(Number(number));

  if (number === 0) return "zero";
  if (number > 9999) return number;

  return number
    .toString()
    .split("")
    .reverse()
    .reduce((acc, cv, i, a) => {
      const val = Number(cv);
      // ONES
      if (i === 0) {
        acc = val === 0 ? "" : onesLookup[val];
      }
      // TENS
      if (i === 1) {
        if (val === 1) {
          acc = teensLookup[Number(cv + a[0])];
        } else if (val > 1) {
          acc = tensLookup[val] + (acc ? "-" + acc : "");
        }
      }
      // HUNDREDS
      if (i === 2 && val > 0) {
        acc = `${onesLookup[val]} hundred ${acc}`.trim();
      }
      // THOUSANDS
      if (i === 3 && val > 0) {
        acc = `${onesLookup[val]} thousand ${acc}`.trim();
      }

      return acc;
    }, "");
}
export function oneLine(string, preserveSpace = false) {
  return string.replace(/[\n\r\t\s]/g, preserveSpace ? " " : "");
}
export function splice(string = "", start = 0, deleteCount = 0, item = "") {
  return [...string].splice(start, deleteCount, item).reduce((acc, cv) => {
    return (acc += cv);
  }, "");
}
