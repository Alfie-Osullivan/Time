const fs = require('fs');
const iso3166Path = '/usr/share/zoneinfo/iso3166.tab';
const zonePath = '/usr/share/zoneinfo/zone1970.tab';

const isoData = fs.readFileSync(iso3166Path, 'utf8')
  .split('\n')
  .filter(l => l && !l.startsWith('#'))
  .map(l => {
    const [code, ...rest] = l.split(/\s+/);
    return { code, name: rest.join(' ') };
  });

const zoneLines = fs.readFileSync(zonePath, 'utf8')
  .split('\n')
  .filter(l => l && !l.startsWith('#'));

const codeToTz = {};
for (const line of zoneLines) {
  const [codes, , tz] = line.split(/\s+/);
  if (!codes || !tz) continue;
  for (const c of codes.split(',')) {
    if (!codeToTz[c]) codeToTz[c] = tz;
  }
}

const countries = isoData.map(({ code, name }) => {
  const tz = codeToTz[code] || 'Etc/UTC';
  return {
    cca2: code,
    name: { common: name },
    flags: { png: `https://flagcdn.com/w320/${code.toLowerCase()}.png` },
    timezones: [tz]
  };
});

fs.writeFileSync('countries.json', JSON.stringify(countries, null, 2));
