# Changelog - Pulsar N250 Owner Hub

## v1.3 - Google Sheet sync (Apps Script) replaces the Cloudflare Worker
**Date:** 05-11-2026

- Data now lives in a Google Sheet through an Apps Script web app (`apps-script/Code.gs`). The Sheet has a `State` tab (source of truth) plus readable `Summary`, `Logs` and `Done` tabs.
- Reading is open to anyone with the web app URL; writing needs the secret `TOKEN` (Script property). A device with no token is view-only and shows "View only" in the status line.
- First open asks for the web app URL and the edit token. Both are kept in that browser; tapping the status line changes them. Storage keys are new (`n250gas`, `n250tok`), so nothing from the Worker setup is reused.
- Merge, 30-second pull, push-on-change and offline fallback are unchanged. Requests use `text/plain` so the browser needs no CORS preflight.
- State is stored in 40,000-character chunks to stay under the 50,000-character cell limit.
- Removed `worker/worker.js`. The Cloudflare Worker and KV namespace can be deleted.

## v1.2 - Self-hosted sync (Netlify + Cloudflare Worker)
**Date:** 05-11-2026

- (Superseded by v1.3.) Sync no longer depends on claude.ai. `site/index.html` talks to a Cloudflare Worker (`worker/worker.js`) that stores one JSON state per sync key in a KV namespace bound as `N250`.
- First open on a device asks for the Worker URL and a sync key (8+ characters). Both are kept in that browser; tapping the status line under the title changes them.
- The page pulls every 30 seconds and when the tab becomes visible again, and pushes about 0.7 s after any change. If the Worker is unreachable the hub keeps working and saves on the device.
- The key is hashed (SHA-256) before it is used as the KV name. Writes are limited to 200 KB.
- Repo layout: `site/` is the Netlify publish folder (`netlify.toml`), `worker/` is deployed to Cloudflare by hand. `.gitignore` keeps `*.pdf` and `*.zip` out, so the owner's manual is never committed.
- Added `Push.ps1` / `Push_Launcher.bat` force-push helper for `github.com/jass666/bike`.

## v1.1 - Cross-device sync and manual completeness pass
**Date:** 05-11-2026

- Sync merges instead of overwriting: logs are unioned by id with delete markers, the odometer and sale date take the newest edit, "Done now" marks take the newest per item, the daily check-list takes the newest for the current day.
- New "What is done at each service" table (services 1 to 16) read from the service chart on manual pp. 46-53.
- Added tracker items: valve tappet clearance (every 20,000 km), fuel pump hoses (20,000 km), swing arm bearing grease (40,000 km).
- Engine oil now follows the manual: first change at the 1st service (about 750 km), then every 10,000 km.
- Specs: bore and stroke, compression ratio, dimensions, gross weight, 1,700 ml oil at overhaul, lighting, display, horn, ignition, lubrication.
- FAQ: roll-over sensor, headlamp and DRL behaviour, key / steering lock / fuel cap, ABS notes, Ride Connect features and permissions, cluster menu, lap timer, fuel gauge fault blinks, cleaning cloth.
- Warnings: high beam, position lamp and notifications list; low oil pressure and fault lamp stay on until the engine starts. Traction control wording fixed (it glows while active; it does not flash).
- Warranty: claim route and extra exclusions (coastal rust, silencer tint, crankcase oxidation, accident or misuse, unauthorised modifications).
- Known manual inconsistencies kept visible: battery location (rider seat on p. 28, pillion seat on p. 38), "centre stand" oil check although the main stand is an accessory, chain slack 20-30 mm vs 20-25 mm.
- Not added: main stand pivot lubrication row (cells unreadable), the E20 badge on the back cover (unexplained in the manual).

## v1.0 - Owner Hub
**Date:** not recorded

- Single-file hub built from the Pulsar N250 Owner's Manual (Doc. No. 71120287, Rev. 00, Aug 2026): odometer and service tracker, service schedule, ride and specs, daily checks, FAQ, warnings and warranty. Data saved in the browser only.
