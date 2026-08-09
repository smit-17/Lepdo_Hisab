import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import logo from "@/assets/logo.png";
import { unlockSite } from "@/lib/gate.functions";

export const Route = createFileRoute("/unlock")({
  head: () => ({
    meta: [
      { title: "Sign in — LEPDO BOOKS" },
      { name: "description", content: "Enter the access password to open the LEPDO BOOKS dashboard." },
      { property: "og:title", content: "Sign in — LEPDO BOOKS" },
      { property: "og:description", content: "Password protected LEPDO BOOKS accounting dashboard." },
    ],
  }),
  component: Unlock,
});

function Unlock() {
  const router = useRouter();
  const unlock = useServerFn(unlockSite);
  const [error, setError] = useState(false);
  const [configurationError, setConfigurationError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = String(new FormData(e.currentTarget).get("password") ?? "");
    setBusy(true);
    setError(false);
    setConfigurationError(false);
    try {
      const { ok } = await unlock({ data: { password } });
      if (ok) {
        await router.navigate({ to: "/" });
        return;
      }
      setError(true);
    } catch {
      setConfigurationError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl sm:p-8">
        <img src={logo} alt="LEPDO" className="mx-auto h-10 w-auto" />
        <h1 className="mt-6 text-center text-lg font-bold tracking-tight text-foreground">
          LEPDO BOOKS
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          Enter your access password
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            aria-label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            maxLength={200}
            placeholder="Password"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-gold focus:ring-2 focus:ring-ring/40"
          />
          {error && (
            <p className="text-sm font-medium text-destructive">Incorrect password</p>
          )}
          {configurationError && (
            <p className="text-sm font-medium text-destructive">
              Server access is not configured. Add SITE_PASSWORD and SESSION_SECRET to the
              deployment environment, then restart or redeploy.
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-navy px-4 py-2.5 text-sm font-semibold text-navy-foreground transition-colors hover:bg-navy/90 disabled:opacity-60"
          >
            {busy ? "Checking…" : "Unlock dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}
