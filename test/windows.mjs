// For each press in a solver path: how many 1/60 s frames of timing slack does a human get?
// window = number of onset shifts in [-10,+10] frames after which the run can still continue 12 tiles.
import { readFileSync } from 'node:fs';
const html = readFileSync(process.argv[2] || new URL('../index.html', import.meta.url), 'utf8');
const sim = html.split('// ==SIM START==')[1].split('// ==SIM END==')[0];
const { LEVELS, newState, setHold, step } = new Function(sim + '; return { LEVELS, newState, setHold, step };')();
const K = 4;
const clone = s => ({ ...s, used: s.used.slice(), got: s.got.slice() });
function adv(s, hold, L) { const n = clone(s); setHold(n, hold); for (let i = 0; i < K && !n.dead && !n.won; i++) step(n, L); return n; }
function canReach(s0, L, target, budget = 2e5) {
  const seen = new Set(), st = [s0]; let nodes = 0;
  while (st.length && nodes++ < budget) {
    const s = st.pop();
    for (const h of [true, false]) {
      const n = adv(s, h, L); if (n.dead) continue;
      if (n.won || n.x >= target) return true;
      const k = `${Math.round(n.x*100)}|${n.mode}|${n.grav}|${Math.round(n.y*20)}|${Math.round(n.vy*2)}|${+n.hold}|${n.used.length}`;
      if (seen.has(k)) continue; seen.add(k); st.push(n);
    }
  }
  return false;
}
function solve(L) {
  const seen = new Set(); const st = [{ s: newState(), node: null }];
  while (st.length) {
    const { s, node } = st.pop();
    for (const h of [true, false]) {
      const n = adv(s, h, L); if (n.dead) continue;
      if (n.won) { const p = [h]; for (let q = node; q; q = q.up) p.unshift(q.h); return p; }
      const k = `${Math.round(n.x*100)}|${n.mode}|${n.grav}|${Math.round(n.y*20)}|${Math.round(n.vy*2)}|${+n.hold}|${+n.buf}|${n.used.length}`;
      if (seen.has(k)) continue; seen.add(k); st.push({ s: n, node: { h, up: node } });
    }
  }
}
const only = process.env.LV;
for (const L of LEVELS) {
  if (only && L.id !== only) continue;
  const path = solve(L); if (!path) { console.log(L.id, 'UNSOLVABLE'); continue; }
  const states = [newState()]; for (const h of path) states.push(adv(states.at(-1), h, L));
  const out = [];
  for (let i = 0; i < path.length; i++) {
    if (!path[i] || path[i - 1]) continue;
    const s = states[i]; if (s.mode !== 'cube') continue; // ship/ufo sections are continuous control
    let len = 0; while (path[i + len]) len++;
    let ok = 0, okList = [];
    for (let d = -10; d <= 10; d++) {
      const j = i + d; if (j < 0) continue;
      let n = states[j]; if (d > 0) { n = states[i]; for (let f = 0; f < d; f++) n = adv(n, false, L); }
      let dead = n.dead; for (let f = 0; f < len && !dead; f++) { n = adv(n, true, L); dead = n.dead; }
      if (!dead && canReach(n, L, s.x + 12)) { ok++; okList.push(d); }
    }
    const near = L.objs.filter(o => o.x > s.x - 1 && o.x < s.x + 6 && 'pob'.includes(o.t)).map(o => o.t + o.x).join(',');
    out.push({ x: s.x.toFixed(1), ok, okList: okList.join(' '), near });
  }
  const tight = out.filter(r => r.ok <= 3);
  console.log(`${L.id}: presses=${out.length} tight(<=3 frames)=${tight.length}`);
  for (const r of tight) console.log(`   x=${r.x} window=${r.ok}f [${r.okList}] near ${r.near}`);
}
