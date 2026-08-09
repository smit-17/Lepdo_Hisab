// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Keep TanStack Start's standard server entry. A custom entry that imports
  // @tanstack/react-start/server-entry can resolve back to itself in production.
  // Lovable builds still force their managed Cloudflare target. External builds
  // (including Vercel) use Vercel's server adapter instead of the Cloudflare
  // default, so the generated server is executable by the hosting platform.
  nitro: { preset: "vercel" },
});
