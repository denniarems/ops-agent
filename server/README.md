# ZapGap Server

## Setup

1. Install dependencies:
```bash
bun install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env` (for reference)
   - Copy `.dev.vars` and add your actual Clerk secret key
   - Update `wrangler.jsonc` vars section for non-sensitive variables

3. Start development server:
```bash
bun run dev
```

## Deployment

```bash
bun run build
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```

Pass the `CloudflareBindings` as generics when instantiation `Hono`:

```ts
// src/index.ts
const app = new Hono<{ Bindings: CloudflareBindings }>()
```
