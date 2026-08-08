import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Shell } from "@/components/Shell";
import { getSection } from "@/lib/gate.functions";
import type { Block, SectionData } from "@/lib/sheets.server";
import {
  formatCell,
  formatCurrency,
  isCurrencyHeader,
  parseNumber,
  parseSheetDate,
} from "@/lib/sheet-format";

function NoData({ label }: { label?: string | undefined }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-4 py-10 text-center">
      <p className="text-sm font-semibold text-muted-foreground">
        No Data Available{label ? ` — ${label}` : ""}
      </p>
    </div>
  );
}

function BlockTable({ block }: { block: Block }) {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const dateCol = block.headers.findIndex((h) => /date/i.test(h));

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const now = new Date();
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    return block.rows.filter((row) => {
      if (needle && !row.some((cell) => cell.toLowerCase().includes(needle))) {
        return false;
      }
      if (dateCol < 0) return true;
      const date = parseSheetDate(row[dateCol] ?? "");
      if (!date) return period === "all" && !fromDate && !toDate;
      if (period === "month") {
        if (
          date.getMonth() !== now.getMonth() ||
          date.getFullYear() !== now.getFullYear()
        )
          return false;
      }
      if (period === "year" && date.getFullYear() !== now.getFullYear()) return false;
      if (fromDate && date < fromDate) return false;
      if (toDate && date > toDate) return false;
      return true;
    });
  }, [block.rows, query, period, from, to, dateCol]);

  const totals = useMemo(
    () =>
      block.headers.map((header, i) => {
        if (!isCurrencyHeader(header)) return null;
        let sum = 0;
        let found = false;
        for (const row of rows) {
          const num = parseNumber(row[i] ?? "");
          if (num !== null) {
            sum += num;
            found = true;
          }
        }
        return found ? sum : null;
      }),
    [block.headers, rows],
  );

  const hasTotals = totals.some((t) => t !== null);

  const totalCells = totals
    .map((total, i) => ({ label: block.headers[i] ?? "", total }))
    .filter((t) => t.total !== null);

  return (
    <div className="min-w-0 space-y-3">
      {block.label && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-navy px-3 py-2.5 text-navy-foreground sm:px-4">
          <span className="min-w-0 text-xs font-bold uppercase tracking-wide break-words">
            {block.label}
          </span>
          {block.total && <span className="text-sm font-bold text-gold">{block.total}</span>}
        </div>
      )}

      {block.rows.length === 0 ? (
        <NoData label={block.label} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full min-w-0 rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {dateCol >= 0 && (
              <>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full min-w-0 rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="all">All time</option>
                  <option value="month">This month</option>
                  <option value="year">This year</option>
                </select>
                <input
                  type="date"
                  aria-label="From date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full min-w-0 rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  type="date"
                  aria-label="To date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full min-w-0 rounded-lg border border-input bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </>
            )}
          </div>

          {/* Mobile: stacked cards */}
          <div className="space-y-3 md:hidden">
            {rows.length === 0 && <NoData label={block.label} />}
            {rows.map((row, r) => (
              <div key={r} className="rounded-xl border border-border bg-card p-3">
                <dl className="space-y-1.5">
                  {block.headers.map((header, c) => {
                    const value = formatCell(header, row[c] ?? "");
                    if (!value || value === "—") return null;
                    return (
                      <div
                        key={`${header}-${c}`}
                        className="grid grid-cols-[minmax(0,42%)_minmax(0,1fr)] gap-2"
                      >
                        <dt className="min-w-0 text-[0.68rem] font-bold uppercase tracking-wide break-words text-muted-foreground">
                          {header && header !== "—" ? header : `Col ${c + 1}`}
                        </dt>
                        <dd className="min-w-0 text-sm font-medium break-words text-foreground">
                          {value}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            ))}
            {hasTotals && rows.length > 0 && (
              <div className="rounded-xl bg-navy p-3 text-navy-foreground">
                <p className="text-[0.68rem] font-bold uppercase tracking-wide text-gold">
                  Total
                </p>
                <dl className="mt-2 space-y-1.5">
                  {totalCells.map(({ label, total }, i) => (
                    <div
                      key={`${label}-${i}`}
                      className="grid grid-cols-[minmax(0,42%)_minmax(0,1fr)] gap-2"
                    >
                      <dt className="min-w-0 text-[0.68rem] font-semibold uppercase break-words opacity-80">
                        {label && label !== "—" ? label : "Amount"}
                      </dt>
                      <dd className="min-w-0 text-sm font-bold break-words">
                        {formatCurrency(total as number)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          {/* Tablet & desktop: table */}
          <div className="hidden w-full max-w-full overflow-x-auto rounded-xl border border-border bg-card md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary">
                  {block.headers.map((header, i) => (
                    <th
                      key={`${header}-${i}`}
                      className="px-3 py-2.5 text-left text-[0.68rem] font-bold uppercase tracking-wide text-secondary-foreground"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={block.headers.length}
                      className="px-3 py-8 text-center text-sm text-muted-foreground"
                    >
                      No Data Available
                    </td>
                  </tr>
                )}
                {rows.map((row, r) => (
                  <tr key={r} className="hover:bg-secondary/50">
                    {row.map((cell, c) => (
                      <td key={c} className="px-3 py-2 align-top break-words text-foreground">
                        {formatCell(block.headers[c] ?? "", cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              {hasTotals && rows.length > 0 && (
                <tfoot>
                  <tr className="bg-navy text-navy-foreground">
                    {totals.map((total, i) => (
                      <td key={i} className="px-3 py-2.5 text-xs font-bold">
                        {i === 0 && total === null
                          ? "TOTAL"
                          : total === null
                            ? ""
                            : formatCurrency(total)}
                      </td>
                    ))}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </>
      )}
    </div>
  );
}


export function SectionView({
  sectionKey,
  initialData,
}: {
  sectionKey: string;
  initialData: SectionData;
}) {
  const fetchSection = useServerFn(getSection);
  const router = useRouter();
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["section", sectionKey],
    queryFn: async () => {
      const result = await fetchSection({ data: { key: sectionKey } });
      if ("locked" in result) {
        await router.navigate({ to: "/unlock", replace: true });
        return initialData;
      }
      return result;
    },
    initialData,
    refetchOnWindowFocus: false,
  });

  return (
    <Shell updatedAt={data.updatedAt} isFetching={isFetching} onRefresh={() => refetch()}>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
            {data.title}
          </h1>
          <p className="text-xs text-muted-foreground">Sheet tab: {data.tab.trim()}</p>
        </div>

        {data.summary.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {data.summary.map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-card p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-2 text-lg font-bold break-words text-foreground">
                  {formatCell(item.label, item.value)}
                </p>
              </div>
            ))}
          </div>
        )}

        {data.blocks.length === 0 && data.summary.length === 0 && <NoData />}

        {data.blocks.map((block, i) => (
          <BlockTable key={block.label ?? i} block={block} />
        ))}
      </div>
    </Shell>
  );
}
