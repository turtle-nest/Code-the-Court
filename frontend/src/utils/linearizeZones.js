// src/utils/linearizeZones.js

export function linearizeZones(text, zones) {
  if (!text || !zones) return [{ zone: 'full', fragment: text }];
  const ordered = [];
  for (const zoneName in zones) {
    for (const frag of zones[zoneName] || []) {
      ordered.push({ zone: zoneName, start: frag.start, end: frag.end });
    }
  }
  ordered.sort((a, b) => a.start - b.start);
  return ordered.map(z => ({
    zone: z.zone,
    fragment: text.substring(z.start, z.end)
  }));
}
