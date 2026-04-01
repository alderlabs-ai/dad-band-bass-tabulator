# Repository Guidelines

## Project Structure & Module Organization
`App.tsx` boots the Expo app and wires global providers. Core application code lives under `src/`: `screens/` for route-level UI, `components/` for reusable UI pieces, `navigation/` for stack/tab setup, `store/` for AsyncStorage-backed state, `utils/` for chart/tab transformations, `types/` for shared models, `constants/` for design values, and `data/seed.ts` for starter content. Static assets such as icons and splash art live in `assets/`.

## Build, Test, and Development Commands
Use `npm install` to install dependencies. Run `npm start` for the Expo dev server, or `npm run android`, `npm run ios`, and `npm run web` for platform-specific launches. Use `npm run typecheck` to run strict TypeScript validation. Use `npm run export:web` to verify Expo can bundle the web build. For Linux-first validation, run `npm run verify:linux`; it combines type-checking and web export.

## Coding Style & Naming Conventions
This repo uses TypeScript with `strict` mode enabled in [`tsconfig.json`](/home/rob/BassTab/tsconfig.json). Follow the existing style: 2-space indentation, semicolons, single quotes, and functional React components. Name screens and components in PascalCase (`SongEditorScreen.tsx`, `PrimaryButton.tsx`), hooks/utilities in camelCase, and shared constants in descriptive lower camel or all-caps only when truly constant-like. Keep persisted song data section-based even when editor views flatten it for display.

## Testing Guidelines
There is no dedicated unit test suite yet. Until one is added, treat `npm run verify:linux` as the minimum pre-PR check. Changes touching `src/utils/songChart.ts`, `src/utils/tabLayout.ts`, or persistence in `src/store/BassTabProvider.tsx` should include manual validation in the editor, library, live view, and export flows. When adding tests later, place them beside the source file as `*.test.ts` or `*.test.tsx`.

## Commit & Pull Request Guidelines
Recent history uses short, imperative commit messages such as `fix bugs` and `clean up`. Keep commits focused and use concise subject lines that describe the user-visible change. Pull requests should include a brief summary, affected screens or modules, manual test steps, and screenshots for UI changes. Link any related issue or task, and call out changes to storage shape or navigation behavior explicitly.
