# Angular UI (`UI/`)

**Angular 19** application (`hw-presentation`) for the ELK demo: **HTTP interceptor** (retry + error mapping), **global `ErrorHandler`**, and small routes that exercise client-side and HTTP error paths against the mock API.

Generated with [Angular CLI](https://github.com/angular/angular-cli) **19.2.18**.

## Requirements

- **Node.js** (LTS; project targets modern Angular).
- Mock API on **http://localhost:3000** (see [`../services/README.md`](../services/README.md)) for HTTP demos to succeed.

## Development server

```bash
cd UI
npm install
npm start
```

Open [http://localhost:4200](http://localhost:4200) (or the URL printed by the CLI). The app reloads when you change sources.

API base URL is currently hardcoded in `src/app/services/products.service.ts` (`http://localhost:3000/...`).

## Demo routes

| Path | Intent |
|------|--------|
| `/products` | Product list; interceptor + random API failures. |
| `/details` | “Global” demo (`GlobalComponent`). |
| `/error-global` | Error boundary–style wrapper + bad payload flow. |
| `/client` | Client-side error demo. |

> The shell nav may include links to routes that are not defined; trim or add routes as needed.

## Production build and SSR

```bash
cd UI
npm run build
npm run serve:ssr:hw-presentation
```

Default SSR listen port is **4000** unless `PORT` is set (`src/server.ts`).

## Tests

```bash
cd UI
npm test
```

Uses **Karma** + **Jasmine**. Fix or update specs if they drift from `AppComponent` templates.

## Angular CLI reference

```bash
npx ng generate component component-name
npx ng generate --help
```

More: [Angular CLI documentation](https://angular.dev/tools/cli).

## See also

- [../README.md](../README.md) — ELK + API + Prometheus run order.
- [../services/README.md](../services/README.md) — API endpoints used by this UI.
