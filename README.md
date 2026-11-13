# NTPC Simhadri Plant Hub

One installable web app (PWA) with an opening screen to choose between:

| Module | Folder | What it does |
|---|---|---|
| **Plant Guide** (v1.6) | `guide/` | Plant & township locations, road routes, turn-by-turn guidance, KML land boundaries with live NTPC-land alerts |
| **Area Owner Finder** | `owner/` | 360 custodial assets on satellite map, Area Owner contacts (tap-to-call / email), GPS "Where am I?", Firebase live admin sync |

Each module has a **‹ Home** button (top-left) to return to the selection screen.
The opening screen marks the module you used last.

## Folder layout

```
index.html              ← opening (selection) screen
manifest.webmanifest    ← one app: "Plant Hub" (long-press icon shows shortcuts to each module)
service-worker.js       ← one offline cache for everything
icons/  favicon.ico  404.html  .nojekyll
guide/index.html        guide/data/locations.json   guide/data/land.json
owner/index.html        owner/app.js
```

## Publish on GitHub Pages

1. Upload **everything in this folder** to the repository root (keep `guide/`, `owner/`, `icons/` folders).
2. Settings → Pages → Branch `main`, folder `/ (root)` → Save.
3. Open `https://<username>.github.io/<repo>/` → Add to Home screen.

If you reuse the existing `Simhadri-Plant-Guide` repo, delete the old root `index.html`, `data/` and
`manifest.webmanifest` first, then upload this folder's contents.

## What changed vs. the two original apps

- Plant Guide GitHub auto-publish now writes to `guide/data/locations.json` and `guide/data/land.json`
  (token setup unchanged: Admin → section 4).
- Area Owner Finder: Firebase config and admin password unchanged (in `owner/index.html`).
- The two separate service workers/manifests are replaced by a single root one.
  After changing any app code, bump `CACHE` in `service-worker.js` (e.g. `plant-hub-v2`).
- Data, map logic and admin features of both apps are untouched.
