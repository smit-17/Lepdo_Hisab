import { useEffect, useState } from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import logo from "@/assets/lepdo-logo.png.asset.json";
import { lockSite } from "@/lib/gate.functions";
import { NAV_ITEMS } from "@/lib/sheet-format";

interface ShellProps {
  updatedAt: string;
  isFetching: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          activeOptions={{ exact: item.to === "/" }}
          className="rounded-md px-3 py-2 text-sm font-semibold text-navy-foreground/75 transition-colors hover:bg-navy-foreground/10"
          activeProps={{ className: "bg-gold text-gold-foreground" }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export function Shell({ updatedAt, isFetching, onRefresh, children }: ShellProps) {
  const router = useRouter();
  const lock = useServerFn(lockSite);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const updated = new Date(updatedAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  async function signOut() {
    await lock();
    await router.navigate({ to: "/unlock", replace: true });
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background lg:flex">
      {/* Desktop fixed sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-navy text-navy-foreground lg:sticky lg:top-0 lg:flex lg:h-screen">
        <Link to="/" className="flex items-center gap-3 px-4 py-4">
          <img src={logo.url} alt="LEPDO" className="h-9 w-auto rounded-md bg-card px-2 py-1" />
          <span className="text-sm font-black tracking-tight">LEPDO BOOKS</span>
        </Link>
        <div className="flex-1 overflow-y-auto border-t border-navy-foreground/15 px-3 py-3">
          <NavLinks />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 bg-navy text-navy-foreground">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                className="shrink-0 rounded-lg border border-navy-foreground/30 px-2.5 py-2 text-xs font-bold lg:hidden"
              >
                Menu
              </button>
              <img
                src={logo.url}
                alt="LEPDO"
                className="h-8 w-auto shrink-0 rounded-md bg-card px-2 py-1 lg:hidden"
              />
              <span className="hidden truncate text-sm font-bold lg:block">
                Last updated: {updated}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={onRefresh}
                disabled={isFetching}
                className="rounded-lg bg-gold px-3 py-2 text-xs font-bold text-gold-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isFetching ? "Refreshing…" : "Refresh"}
              </button>
              <button
                onClick={signOut}
                className="rounded-lg border border-navy-foreground/30 px-3 py-2 text-xs font-semibold transition-colors hover:bg-navy-foreground/10"
              >
                Lock
              </button>
            </div>
          </div>
        </header>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-foreground/50"
            />
            <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-navy text-navy-foreground">
              <div className="flex items-center justify-between gap-2 px-4 py-4">
                <span className="text-sm font-black tracking-tight">LEPDO BOOKS</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md border border-navy-foreground/30 px-2 py-1 text-xs font-bold"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto border-t border-navy-foreground/15 px-3 py-3">
                <NavLinks onNavigate={() => setMenuOpen(false)} />
              </div>
            </div>
          </div>
        )}

        <main className="mx-auto w-full max-w-6xl min-w-0 space-y-6 px-3 py-5 sm:px-6 sm:py-6">
          <p className="text-xs text-muted-foreground lg:hidden">Last updated: {updated}</p>
          {children}
        </main>
      </div>
    </div>
  );
}
