const { convertUTCOffsetToIANA } = require('./convertUTCOffsetToIANA');

test('converts UTC+2 to Etc/GMT-2', () => {
  expect(convertUTCOffsetToIANA('UTC+2')).toBe('Etc/GMT-2');
});

test('converts UTC-5 to Etc/GMT+5', () => {
  expect(convertUTCOffsetToIANA('UTC-5')).toBe('Etc/GMT+5');
});

test('returns timezone unchanged if not in UTC format', () => {
  expect(convertUTCOffsetToIANA('Europe/London')).toBe('Europe/London');
});
