# Campus OS Monorepo

Modular monorepo for Campus OS with shared packages, web (Next.js), mobile (Vite + Capacitor), and domain services.

## Quickstart

```bash
pnpm install --ignore-scripts
pnpm dev           # runs turbo dev across apps
pnpm --filter @campus-os/web dev     # web only
pnpm --filter @campus-os/mobile dev  # mobile only
pnpm --filter @campus-os/service-canteen dev  # canteen service
```

## Structure

- apps/web: Next.js app (App Router)
- apps/mobile: Vite + Capacitor React app
- services/*: Domain services (canteen scaffolded)
- packages/*: Shared types, utils, UI, API client, configs
- infra/*: IaC placeholders (docker, k8s, terraform, nginx)
- docs/*: ADRs, SRS, API docs
- .github/workflows: CI pipelines

## Notes

- Shared TS paths are configured in tsconfig.base.json.
- Turborepo orchestrates build/lint/test across packages.
- Add per-service infra under infra/ and API specs under docs/api.

## Next Steps

1) Flesh out domain modules under apps/web/app/modules and apps/mobile/src/modules.
2) Replace canteen service stub with real HTTP framework and persistence.
3) Add OpenAPI/GraphQL schemas per service and generate typed clients into packages/api-client.
4) Add pnpm-lock.yaml and tighten CI with --frozen-lockfile once dependencies are locked.