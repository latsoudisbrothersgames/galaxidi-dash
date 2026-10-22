# Galaxidi Dash

Rhythm-runner browser game for the Latsoudis family: a cube that jumps over spikes in time to music, with Aegean, lighthouse and storm themes.

**Play:** https://latsoudis-games.pages.dev/dash/ (in the family eShop; the GitHub Pages link redirects there)

Players pick themselves with the eShop's «Ποιος παίζει;» accounts and compete on the shared leaderboard (Κατατάξεις). Points = % of the level × 1 (Λιμάνι), × 2 (Φάρος), × 3 (Μπουρίνι); practice runs do not count.

- 3 levels: Λιμάνι (easy), Φάρος (medium, with a ship section), Μπουρίνι (hard)
- Jump pads, yellow jump rings, ship mode, practice mode with checkpoints
- Pick your cube's colour and face; best % is saved in the browser
- Controls: Space / ↑ / click / tap to jump (hold to keep jumping). Esc pauses, Z sets a checkpoint in practice.

One self-contained `index.html`; music and sounds are generated live with Web Audio.

## Test

`node test/beatable.mjs` runs a solver against the game's own physics and fails if any level cannot be finished.
`K=12 node test/beatable.mjs` re-checks with input timing coarsened to 1/20 s.
