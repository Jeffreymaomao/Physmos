# Repository Guidelines

## Project Structure & Module Organization

`main.js` is the Electron main-process entry point. Renderer code lives under `app/`: `index.html` is the primary page, `preload.js` exposes the bridge, `menuTemplate.js` defines menus, and features are grouped in `app/js/index/*.plugin.js`. Styles and assets are under `app/css/`. Source icons live in `icon/`; generated artifacts belong in `build/` and `dist/`.

## Build, Test, and Development Commands

- `npm ci` installs the exact dependency versions from `package-lock.json`.
- `npm start` launches the app with module reloading during development.
- `npm run pack` creates an unpacked application for local inspection.
- `npm run dist` builds distributable packages for the current platform.
- `npm run dist-mac` / `npm run dist-win` target macOS or Windows explicitly.
- `npm run icon` regenerates platform icons from `icon/icon.png`.

There is no configured `npm test` or lint script. Do not report automated checks unless the corresponding tooling was run.

## Coding Style & Naming Conventions

Use JavaScript with four-space indentation, semicolons, and single quotes. Use `camelCase` for variables/functions, `PascalCase` for classes, and kebab-case for CSS classes. Keep privileged APIs in `main.js` or `app/preload.js`; renderer modules use the preload bridge. Name extensions `feature.plugin.js`. New code should satisfy `npx eslint main.js app/**/*.js` (exclude vendor files).

## Desmos API References

Physmos uses a locally downloaded Desmos API bundle for development and packaging. Before changing calculator options, methods, state handling, or integration behavior, consult the official [Desmos API v1.13 documentation](https://www.desmos.com/api/v1.13/docs). Documentation for another release follows `https://www.desmos.com/api/v{version}/docs`; replace `{version}` with the required version, such as `v1.12`. Review the official [Desmos API Change Log](https://www.desmos.com/api/changelog) before every upgrade for new features, deprecations, behavior changes, and security fixes. Keep downloaded API JavaScript, CSS, fonts, images, and `app/vendor/desmos/` out of Git; they are local packaging inputs.

## Testing Guidelines

Test examples are under `app/js/test/`, but no runner is configured. Run `npm start` and verify window creation, menu shortcuts, file operations, and console output. New tests should use `*.test.js` in `app/js/test/` and include an `npm test` script.

## Commit & Pull Request Guidelines

History uses short, imperative subjects such as `Update main.js`. Keep commits focused with subjects under 72 characters. Pull requests should explain changes, list verification, link issues, and include screenshots for UI changes. Call out packaging, IPC, preload, or platform-specific effects.

## Security & Configuration

Never commit keys, certificates, logs, generated packages, or user data. Treat changes to `webPreferences`, IPC channels, filesystem access, and the preload bridge as security-sensitive; expose only the minimum API required by the renderer.
