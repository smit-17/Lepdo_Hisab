import { createFileRoute } from "@tanstack/react-router";
import { SectionView } from "@/components/SectionView";
import { loadSection } from "@/lib/section-loader";

export const Route = createFileRoute("/cash-it-park")({
  head: () => ({
    meta: [
      { title: "Cash IT Park — LEPDO BOOKS" },
      { name: "description", content: "IT Park cash flow ledger with credit, debit and balance for LEPDO BOOKS." },
      { property: "og:title", content: "Cash IT Park — LEPDO BOOKS" },
      { property: "og:description", content: "IT Park cash flow ledger with credit, debit and balance for LEPDO BOOKS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: () => loadSection("cash-it-park"),
  component: CashItParkPage,
});

function CashItParkPage() {
  const initialData = Route.useLoaderData();
  return <SectionView sectionKey="cash-it-park" initialData={initialData} />;
}
