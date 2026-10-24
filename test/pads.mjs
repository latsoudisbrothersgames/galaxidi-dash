// Each pad: does it carry you over safely with NO tap (as in Geometry Dash), and from which tap offsets?
import { readFileSync } from 'node:fs';
const html = readFileSync(process.argv[2] || new URL("../index.html", import.meta.url), 'utf8');
const sim = html.split('// ==SIM START==')[1].split('// ==SIM END==')[0];
const { LEVELS, newState, setHold, step } = new Function(sim + '; return { LEVELS, newState, setHold, step };')();
for (const L of LEVELS) for (const p of L.objs.filter(o => o.t === 'p')) {
  const run = tapAt => { const s = { ...newState(), x: p.x - 4, used: [], got: [] }; let apex = 0, f = 0;
    while (!s.dead && s.x < p.x + 12) { if (tapAt != null) setHold(s, f >= tapAt && f < tapAt + 6); for (let i = 0; i < 4 && !s.dead; i++) step(s, L); apex = Math.max(apex, s.y); f++; }
    return { dead: s.dead, apex, x: s.x }; };
  const r = run(null); const okTaps = [];
  for (let t = 0; t < 30; t++) if (!run(t).dead) okTaps.push(t);
  console.log(`${L.id.padEnd(9)} pad@${p.x}: no-tap ${r.dead ? 'DIES at x=' + r.x.toFixed(1) : 'OK'} apex=${r.apex.toFixed(2)}  survivable tap frames(0..29, pad reached ~f26): ${okTaps.length}`);
}
