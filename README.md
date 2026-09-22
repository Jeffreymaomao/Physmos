# Physmos

Uses pnpm 10.17.1 (pinned in `packageManager`). Dependency versions are tracked in
`pnpm-lock.yaml`. Only Electron dependency install scripts are enabled.

## Local Desmos v1.13

The calculator loads `app/vendor/desmos/v1.13/calculator.js`. The official bundle
includes its own CSS and fonts; do not load the old v1.7 stylesheet alongside it.
Downloaded vendor files remain ignored by Git, but are included in the app package.

```sh
pnpm install --frozen-lockfile
pnpm run download-desmos
pnpm start
pnpm run pack
pnpm run dist-mac
```

If the legacy icon generator's PhantomJS installer fails, existing icons can be
used without that optional install step:

```sh
pnpm install --frozen-lockfile --ignore-scripts
node node_modules/electron/install.js
```

`download-desmos` uses the public documentation's trial key for local prototyping.
Set `DESMOS_API_KEY` to use your own key. The download records the actual bundle
version and SHA-256 in the ignored `app/vendor/desmos/v1.13/manifest.json`. The official
v1.13 endpoint currently labels its bundle `v1.13-prerelease`.

Before upgrading, consult the [v1.13 API documentation](https://www.desmos.com/api/v1.13/docs)
and [change log](https://www.desmos.com/api/changelog).

## Verification

`pnpm test` launches Electron with a temporary user-data directory and disables
network access before reloading. It checks the runtime version, graph evaluation,
PNG screenshots, project save/restore, view shortcuts, file toolbar and history
window, and fails on renderer exceptions or console errors. Older browser-only
examples in `app/js/test/` are not Node test-runner suites.

To run the same checks against a packaged macOS app:

```sh
PHYSMOS_EXECUTABLE="$PWD/dist/mac-arm64/Physmos.app/Contents/MacOS/Physmos" pnpm test
```

For a local build using the already-installed Electron runtime, without choosing
a signing identity automatically:

```sh
CSC_IDENTITY_AUTO_DISCOVERY=false pnpm run dist-mac --config.electronDist=node_modules/electron/dist
```

This local build is not notarized for distribution.

## Preserved Physmos customizations

`scripts/patch-desmos.js` reapplies the documented v1.7 symbol extensions
(`hbar`, `partial`, `ell`, `varR`, `nabla`, `mathbbN`), Greek-letter autocompletion,
and `vec` autocompletion after each download. Each patch anchor must match exactly
once, so upstream changes fail the download rather than silently corrupt it.
These are editor/rendering extensions; they do not add new mathematical operators
to the Desmos evaluation engine. v1.13 already supports Shift+Enter in notes.
The file toolbar is owned by Physmos instead of depending on Desmos's internal DOM.

## Asset layout and UI

The app references `app/vendor/desmos/v1.13/` directly. There is no root bundle or
symlink to resolve during packaging. `download-desmos` generates the patched JS,
extracts the bundled CSS (including embedded fonts), and creates `icons.html`.
Only this version's JS, CSS and manifest are packaged; historical version backups
remain local references. The old standalone JS, icon CSS and font/image folders
are no longer used.

Open `app/vendor/desmos/v1.13/icons.html` to browse the bundled icons and codes.
Change the `className` in `app/js/icons.js` to choose an icon. Prefer names over numeric glyph codes because codes change by version.
The icon wrapper must carry `dcg-calculator-api-container-v1_13` for Desmos styles
to apply. These classes are internal to the pinned bundle, not a public API.

`app/css/theme.css` owns shared font, colors, radius, shadow, inputs and dialogs.
`index.css` handles the toolbar/screenshot layout; `history.css` handles project
rows. Native Desmos typography is no longer overridden by Physmos.

### Editing icons and quick macOS checks

`app/js/icons.js` maps delete/save/open to Desmos classes. To use custom artwork,
set that entry's `source` to `'svg'` and edit `app/icons/delete.svg`, `save.svg`, or
`open.svg`. Keep a `0 0 24 24` viewBox and transparent background. SVGs are used as
masks, so their silhouette inherits the button color, including hover states.

```sh
pnpm start          # Quick development preview
pnpm test           # Isolated Electron integration checks
pnpm run pack:local  # Local Apple Silicon .app; skips DMG and signing discovery
pnpm run test:pack   # Run checks against the packaged .app
open dist/mac-arm64/Physmos.app
```
