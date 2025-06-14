const { convertUTCOffsetToIANA, getGMTOffsetLabel } = require('./convertUTCOffsetToIANA');

test('converts UTC+2 to Etc/GMT-2', () => {
  expect(convertUTCOffsetToIANA('UTC+2')).toBe('Etc/GMT-2');
});

test('converts UTC-5 to Etc/GMT+5', () => {
  expect(convertUTCOffsetToIANA('UTC-5')).toBe('Etc/GMT+5');
});

test('returns timezone unchanged if not in UTC format', () => {
  expect(convertUTCOffsetToIANA('Europe/London')).toBe('Europe/London');
});

test('getGMTOffsetLabel returns GMT+5:30 for Asia/Kolkata', () => {
  expect(getGMTOffsetLabel('Asia/Kolkata')).toBe('GMT+5:30');
});

test('getGMTOffsetLabel begins with GMT for Europe/London', () => {
  expect(getGMTOffsetLabel('Europe/London')).toMatch(/^GMT[+-]/);
});
