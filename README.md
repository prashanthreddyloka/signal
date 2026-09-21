# Signal

A cooperative party game for 3–8 players. Each person joins a room from their own browser and compares abstract echoes to find the hidden Source.

**[Play Signal](https://signal-party-prash.prashanthreddyloka54.chatgpt.site)** · [GitHub repository](https://github.com/prashanthreddyloka/signal)

## Run locally

Use Node 24 (Node 22.13+ is supported by the app). Install with `npm run install:ci`, then `npm run build`. Apply the generated local database migration:

```
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_cool_sunspot.sql
```

Run `npm run dev` and open the printed URL (normally http://localhost:5173). Use three independent tabs for a minimum-size expedition. Each tab keeps its player credential in sessionStorage. Refreshing restores that player; closing the tab may discard its credential.

## Rules

The hidden map is 9 × 9. The Source is in its central 5 × 5 region. Six hazards reject moves and spend a shared charge; boundary moves are rejected for free. Starts are distinct safe cells at least four orthogonal steps from the Source, with a safe path to it.

Each round, lock one free one-cell compass move, hold, or a signal costing one charge. All choices resolve together when every active player is ready or after 30 seconds. The host can pause. The reserve starts at six charges per player. Echoes use five abstract proximity bands and two levels of nearby-hazard interference. The last three echoes are public; movement histories are private.

A strict majority must reach the Source within 24 rounds and before the reserve empties. Arrival wins take priority over simultaneous exhaustion. Hazards are charged before signals; scarce signals use rotating priority. A win scores 100 + 5 per unused charge + 2 per unused round. The host can return the crew to the lobby after a game. If the host is absent for a minute, another player can claim hosting. Rooms expire after 24 hours.

## Architecture

React/Vinext on Cloudflare Workers, with shared authoritative state in D1. Clients poll every 1.2 seconds; commands respond immediately. Revision-checked updates serialize concurrent room changes. The server never returns map coordinates, hazard cells, credentials, or other players’ pending action values. Room codes invite new players only while in the lobby. A random per-tab bearer credential authorizes an existing player.

Round timeout processing occurs on the next room request. If every client is offline, processing resumes when someone reconnects. No microphone permission is required; use a separate voice call for discussion. This first version uses visual signals, with text equivalents and reduced-motion support.

## Validation

```
node --test tests/game.test.mjs
node node_modules/typescript/bin/tsc --noEmit
node tests/multiplayer.mjs http://localhost:5173
```

The integration test creates an eight-player room and checks concurrent joins/actions, capacity, host controls, pause/resume, shared spending, stale actions, reconnects, and hidden information. Engine tests check board reachability, hazards, signal bands, timer limits, budget exhaustion, and win precedence.

Sites hosting provisions the DB binding declared in `.openai/hosting.json` and applies the generated Drizzle migration. Build output includes the Worker and its assets. The browser also exposes a read-only WebMCP room tool when supported.
