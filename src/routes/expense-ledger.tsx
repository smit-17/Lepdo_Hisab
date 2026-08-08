import { createFileRoute } from "@tanstack/react-router";
import { SectionView } from "@/components/SectionView";
import { loadSection } from "@/lib/section-loader";

export const Route = createFileRoute("/expense-ledger")({
  head: () => ({
    meta: [
      { title: "Expense Ledger — LEPDO BOOKS" },
      { name: "description", content: "Expense ledger by category: office, salary, courier, bank charges and more." },
      { property: "og:title", content: "Expense Ledger — LEPDO BOOKS" },
      { property: "og:description", content: "Expense ledger by category: office, salary, courier, bank charges and more." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: () => loadSection("expense-ledger"),
  component: ExpenseLedgerPage,
});

function ExpenseLedgerPage() {
  const initialData = Route.useLoaderData();
  return <SectionView sectionKey="expense-ledger" initialData={initialData} />;
}
