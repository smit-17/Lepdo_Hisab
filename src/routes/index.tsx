import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Shell } from "@/components/Shell";
import { getDashboard, lockSite } from "@/lib/gate.functions";
import { loadDashboard } from "@/lib/section-loader";
import type { AccountRow, DashboardData } from "@/lib/dashboard.server";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LEPDO BOOKS — Accounting Dashboard" },
      {
        name: "description",
        content:
          "Live LEPDO BOOKS dashboard: sales, purchase, expense, goods and bank or cash balances straight from Google Sheets.",
      },
      { property: "og:title", content: "LEPDO BOOKS — Accounting Dashboard" },
      {
        property: "og:description",
        content: "Live sales, purchase, expense and balance figures for LEPDO BOOKS.",
      },
    ],
  }),
  loader: () => loadDashboard(),
  component: Dashboard,
});

type Tone = "navy" | "plain" | "green" | "gold";

const toneClass: Record<Tone, string> = {
  navy: "bg-navy text-navy-foreground",
  plain: "bg-card text-foreground border border-border",
  green: "bg-success text-success-foreground",
  gold: "bg-gold text-gold-foreground",
};

function Stat({ label, value, tone }: { label: string; value: string; tone: Tone }) {
  return (
    <div className={`rounded-xl p-4 ${toneClass[tone]}`}>
      <p className="text-[0.68rem] font-semibold uppercase tracking-wide opacity-80">
        {label}
      </p>
      <p className="mt-2 text-xl font-bold break-words sm:text-2xl">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

function AccountList({
  title,
  total,
  rows,
}: {
  title: string;
  total: string;
  rows: AccountRow[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 bg-gold px-4 py-3 text-gold-foreground">
        <span className="truncate text-xs font-bold uppercase tracking-wide">{title}</span>
        <span className="shrink-0 text-base font-bold">{total}</span>
      </div>
      <ul className="divide-y divide-border">
        {rows.length === 0 && (
          <li className="px-4 py-3 text-sm text-muted-foreground">No accounts</li>
        )}
        {rows.map((row) => (
          <li key={row.name} className="flex items-center justify-between gap-3 px-4 py-2.5">
            <span className="min-w-0 text-sm font-medium break-words text-foreground">
              {row.name}
            </span>
            <span className="shrink-0 text-sm font-semibold text-muted-foreground">
              {row.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Dashboard() {
  const initialData = Route.useLoaderData() as DashboardData;
  const router = useRouter();
  const fetchDashboard = useServerFn(getDashboard);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const result = await fetchDashboard();
      if ("locked" in result) {
        await router.navigate({ to: "/unlock", replace: true });
        return initialData;
      }
      return result;
    },
    initialData,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });



  return (
    <Shell updatedAt={data.updatedAt} isFetching={isFetching} onRefresh={() => refetch()}>
      <div className="space-y-8">


        <Section title="Sales">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="All time sales" value={data.sales.allTime} tone="navy" />
            <Stat label="Monthly sales" value={data.sales.monthly} tone="plain" />
            <Stat label="Paid payment" value={data.sales.paid} tone="green" />
            <Stat label="Pending payment" value={data.sales.pending} tone="gold" />
          </div>
        </Section>

        <Section title="Purchase">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="All time purchase" value={data.purchase.allTime} tone="navy" />
            <Stat label="Monthly purchase" value={data.purchase.monthly} tone="plain" />
            <Stat label="Paid payment" value={data.purchase.paid} tone="green" />
            <Stat label="Pending payment" value={data.purchase.pending} tone="gold" />
          </div>
        </Section>

        <div className="grid gap-8 lg:grid-cols-2">
          <Section title="Expense">
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat label="All time expense" value={data.expense.allTime} tone="navy" />
              <Stat label="Monthly expense" value={data.expense.monthly} tone="plain" />
            </div>
          </Section>

          <Section title="Goods">
            <div className="grid gap-3 sm:grid-cols-2">
              <Stat label="Stocks in carats" value={data.goods.carats} tone="green" />
              <Stat label="Stocks in amount" value={data.goods.amount} tone="gold" />
            </div>
          </Section>
        </div>

        <Section title="Balance">
          <div className="grid gap-3 lg:grid-cols-3">
            <AccountList
              title="Bank balance"
              total={data.balance.bank}
              rows={data.bankAccounts}
            />
            <AccountList
              title="Cash balance"
              total={data.balance.cash}
              rows={data.cashAccounts}
            />
            <div className="flex flex-col justify-center rounded-xl bg-navy p-5 text-navy-foreground">
              <p className="text-xs font-bold uppercase tracking-wide text-gold">
                Total balance
              </p>
              <p className="mt-2 text-2xl font-black break-words">{data.balance.total}</p>
            </div>
          </div>
        </Section>
      </div>
    </Shell>

  );
}
