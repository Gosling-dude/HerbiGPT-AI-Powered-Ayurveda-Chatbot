// Production entry point.
//
// Some hosting dashboards (e.g. a Render service created for the legacy code)
// are configured with Start Command `node server.js` and Build Command
// `npm install` (no TypeScript build step). This shim makes those settings work
// without any dashboard changes:
//   - If a compiled build exists (./dist/index.js), run it directly (fast path).
//   - Otherwise, run the TypeScript source via `tsx` (no build step required).
//
// `tsx` is a runtime dependency so it is present even with `npm install`
// under NODE_ENV=production.
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const compiled = join(here, 'dist', 'index.js');

if (existsSync(compiled)) {
  // Run the precompiled app in this process.
  await import('./dist/index.js');
} else {
  // No build present — run the TypeScript entry through tsx.
  const child = spawn(
    process.execPath,
    ['--import', 'tsx', join(here, 'src', 'index.ts')],
    { stdio: 'inherit' }
  );
  child.on('exit', (code) => process.exit(code ?? 0));
  child.on('error', (err) => {
    console.error('Failed to start server via tsx:', err);
    process.exit(1);
  });
}
