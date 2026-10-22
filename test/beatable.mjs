// Proves every level can be finished: depth-first search over hold/release inputs
// using the game's own physics (the ==SIM== block of index.html).
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const sim = html.split('// ==SIM START==')[1].split('// ==SIM END==')[0];
const { LEVELS, newState, setHold, step } = new Function(sim + '; return { LEVELS, newState, setHold, step };')();

const K = +(process.env.K || 4); // physics steps per decision (4 = 1/60 s)

function clone(s) { return { ...s, used: s.used.slice() }; }

function solve(L) {
  const seen = new Set();
  let best = 0, nodes = 0;
  const stack = [{ s: newState(), node: null }];
  while (stack.length) {
    const { s, node } = stack.pop();
    nodes++;
    if (nodes > 3e6) break;
    for (const hold of [true, false]) { // pushed in reverse: release is tried first
      const n = clone(s);
      setHold(n, hold);
      for (let i = 0; i < K && !n.dead && !n.won; i++) step(n, L);
      if (n.dead) continue;
      if (n.won) { const path = [hold]; for (let p = node; p; p = p.up) path.unshift(p.h); return { ok: true, nodes, path }; }
      best = Math.max(best, n.x);
      const key = `${Math.round(n.x * 100)}|${n.mode}|${Math.round(n.y * 20)}|${Math.round(n.vy * 2)}|${+n.hold}|${+n.buf}|${n.used.length}`;
      if (seen.has(key)) continue;
      seen.add(key);
      stack.push({ s: n, node: { h: hold, up: node } });
    }
  }
  return { ok: false, nodes, best };
}

let fail = 0;
for (const L of LEVELS) {
  const t = Date.now();
  const r = solve(L);
  if (r.ok) {
    const presses = r.path.filter((h, i) => h && !r.path[i - 1]).length;
    console.log(`PASS ${L.id.padEnd(9)} len=${L.len} objs=${L.objs.length} presses=${presses} nodes=${r.nodes} ${Date.now() - t}ms`);
  } else {
    fail++;
    console.log(`FAIL ${L.id.padEnd(9)} furthest x=${r.best.toFixed(2)} of ${L.len} nodes=${r.nodes}`);
  }
}
process.exit(fail ? 1 : 0);
