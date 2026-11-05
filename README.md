# Pulsar N250 Owner Hub

A single-page owner hub for the Bajaj Pulsar N250 (SS), built from the Owner's Manual (Doc. No. 71120287, Rev. 00, Aug 2026). It tracks the odometer, service history and maintenance intervals, and keeps the manual's specs, daily checks, FAQ, warnings and warranty terms in one place on the phone.

## What it is

No build step. The whole app is one static file, `site/index.html`, with its data written as plain arrays near the bottom of the script. Cross-device sync uses a Google Sheet with a small Apps Script web app (`apps-script/Code.gs`), so the data sits in your own Google Drive.

## Layout

| Path | Purpose |
|---|---|
| `site/index.html` | The hub (HTML, CSS and JS in one file). Netlify publishes this folder. |
| `apps-script/Code.gs` | Sync endpoint, pasted into the Google Sheet's Apps Script editor. Not deployed by Netlify. |
| `netlify.toml` | Tells Netlify to publish `site/`. |
| `Push.ps1` / `Push_Launcher.bat` | Force-push helper for `github.com/jass666/bike`. |
| `.gitignore` | Keeps `*.pdf` and `*.zip` out of the repo (the manual is not committed). |

## Data in `site/index.html`

| Variable | Holds |
|---|---|
| `ITEMS` | Rolling maintenance items shown in the tracker (interval in km, note). The oil item is special-cased: first change at the 1st service, then every 10,000 km. |
| `win` | Service windows (1st: 500-750 km, then every 5,000 km) and the day limits (45 / 240 / 360 days, then 120 days from the last service). |
| `MX` | Per-service checklist for services 1 to 16 (manual pp. 46-53). |
| `SP` | Technical specifications. |
| `CK` | Daily safety checks. |
| `FAQ` | Question and answer entries. |

## Sync

State (odometer, sale date, logs, "Done now" marks, daily ticks) is saved in the browser first, then sent to the Google Sheet. Edits from two devices are merged: logs are unioned by id with delete markers, and scalar values take the newest edit.

Permissions: anyone with the web app URL can read the data; only a device that holds the edit token can write. Leave the token blank on a device to make it view-only.

The Sheet gets four tabs. `State` is the source of truth (JSON in column A). `Summary`, `Logs` and `Done` are readable copies rewritten on every save; editing them by hand does not feed back into the hub.

One-time setup:

1. Create a Google Sheet. Open Extensions > Apps Script, paste `apps-script/Code.gs`, and save.
2. Project Settings > Script properties > Add `TOKEN` with a secret of your choice.
3. Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone. Authorise when asked, then copy the web app URL (ends with `/exec`).
4. Netlify: connect this repo (publish folder comes from `netlify.toml`) or drag the `site` folder into Netlify Drop.
5. On each device, open the site, paste the web app URL and enter the token (blank = view-only). Tap the status line under the title to change them.

Notes:

- After editing `Code.gs`, use Deploy > Manage deployments > Edit > New version, or the live URL keeps running the old code.
- Share the Sheet itself as view-only (or not at all). The web app writes with your account, so nobody else needs edit access to the Sheet.
- If the status line says "Sync error", the token is wrong or the deployment is not set to "Anyone".
- Browser storage is per site, so data saved on an old address does not carry over to a new one.

## Deployment

1. Edit `site/index.html`.
2. Open it in a browser for a quick check.
3. Run `Push_Launcher.bat` (or `Push.ps1`). It force-pushes this folder to `main`, which overwrites the remote branch.
4. Netlify redeploys from the new commit.

## Maintenance notes

- Add confirmed manual facts only. If the manual contradicts itself, show both values rather than picking one.
- When the manual is revised, update `ITEMS`, `MX`, `SP` and `FAQ` and note the new document revision in `CHANGELOG.md`.
- The web app is public for reading by design. Do not put anything private in the hub data.
- `Push.ps1` is a force-push script. Use it only when this folder should overwrite the remote branch.

## Tech stack

| Layer | Technology |
|---|---|
| Markup, styling, behaviour | HTML5, CSS, vanilla JavaScript (single file) |
| Sync backend | Google Sheet + Apps Script web app |
| Hosting | Netlify (static) |
