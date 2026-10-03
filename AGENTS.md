# Tarket project instructions

Tarket is a React 19 + TypeScript + Vite 8 + Tailwind CSS 4 app based on the user's Figma Make design.

## Development

- Run `pnpm dev` for the local preview at http://127.0.0.1:5175.
- Check whether this task already has a running dev-server session before starting another.
- This checkout is no longer inside the Figma Make sandbox; `$PORT` and the Figma preview scripts are not used.
- Run `pnpm test` for domain regression tests and `pnpm build` for TypeScript checks and the production build.
- Preserve pnpm-lock.yaml and the existing package manager.

## Structure and conventions

- `src/App.tsx`: screen transitions and user interactions.
- `src/components/Design.tsx`: original Figma-exported artwork. Reuse these graphics.
- `src/lib/tarot-data.ts`: original categories and historical Korean readings.
- `src/lib/cards.ts`: canonical 22-card catalog, image mapping and demo readings.
- `server/`: Gemini adapter, request handling, Redis cache/quota operations. `api/readings.ts` deploys the handler.
- `src/lib/tarot.ts`: pure validation and deterministic issuance functions.
- `src/index.css`: typography, styling and responsive layouts.
- Keep all UI copy in Korean except established brand labels and tarot card names.
- Preserve same-input/same-day reading consistency, real calendar validation, and the paper-fed ticket animation.
- Inputs are sent to the server for issuance; never persist/log raw name, birthday or IP. Only HMAC keys and generated readings may be cached for 48 hours. Do not send raw name/birthday to Gemini.
- Production was deployed at the user's request on 2026-10-04. https://tarket.vercel.app returns HTTP 200 and GET /api/readings reports mode gemini with the registered Gemini key, HMAC secret and free Upstash Redis configuration. Actual AI issuance and live Redis verification are still pending; never claim they are verified until tested. Keep public-facing copy free of the word 체험.
- The opening curtain must reveal an empty dark stage; mount the poster selection only after the opening animation finishes. Keep the entrance balanced on desktop as well as mobile.
- Run `pnpm test:server-build` after server changes; retain `rewriteRelativeImportExtensions` for Vercel ESM imports.
- Keep final flat pastel anime card artwork. User rejected classical paintings and glossy elaborate anime splash art. Originals and prompts live under `artwork/tarot`; deployed images live under `public/assets/tarot`.
- Keep the original spec's MVP exclusions (auth, payments, social sharing, saved images, archive, reports) unless the user changes scope.
- Check keyboard interactions and reduced-motion behavior when modifying motion or navigation.
