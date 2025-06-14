function convertUTCOffsetToIANA(offsetStr) {
  if (!offsetStr.startsWith("UTC")) return offsetStr;
  const sign = offsetStr[3];
  const timePart = offsetStr.slice(4);
  const hourPart = timePart.split(":")[0];
  const hours = parseInt(hourPart, 10);
  return sign === "+" ? `Etc/GMT-${hours}` : `Etc/GMT+${hours}`;
}

function getGMTOffsetLabel(zone) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      timeZoneName: 'shortOffset'
    }).formatToParts(new Date());
    const tzName = parts.find(p => p.type === 'timeZoneName');
    return tzName ? tzName.value : 'GMT';
  } catch (e) {
    return 'GMT';
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { convertUTCOffsetToIANA, getGMTOffsetLabel };
} else {
  window.convertUTCOffsetToIANA = convertUTCOffsetToIANA;
  window.getGMTOffsetLabel = getGMTOffsetLabel;
}
