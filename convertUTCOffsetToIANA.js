function convertUTCOffsetToIANA(offsetStr) {
  if (!offsetStr.startsWith("UTC")) return offsetStr;
  const sign = offsetStr[3];
  const timePart = offsetStr.slice(4);
  const hourPart = timePart.split(":")[0];
  const hours = parseInt(hourPart, 10);
  return sign === "+" ? `Etc/GMT-${hours}` : `Etc/GMT+${hours}`;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { convertUTCOffsetToIANA };
} else {
  window.convertUTCOffsetToIANA = convertUTCOffsetToIANA;
}
