import { createFileRoute } from "@tanstack/react-router";
import { SectionView } from "@/components/SectionView";
import { loadSection } from "@/lib/section-loader";

export const Route = createFileRoute("/bank-ledger")({
  head: () => ({
    meta: [
      { title: "Bank Ledger — LEPDO BOOKS" },
      { name: "description", content: "Bank ledgers with credit, debit and running balance for every LEPDO bank account." },
      { property: "og:title", content: "Bank Ledger — LEPDO BOOKS" },
      { property: "og:description", content: "Bank ledgers with credit, debit and running balance for every LEPDO bank account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: () => loadSection("bank-ledger"),
  component: BankLedgerPage,
});

function BankLedgerPage() {
  const initialData = Route.useLoaderData();
  return <SectionView sectionKey="bank-ledger" initialData={initialData} />;
}
