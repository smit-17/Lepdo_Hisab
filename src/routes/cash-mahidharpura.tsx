import { createFileRoute } from "@tanstack/react-router";
import { SectionView } from "@/components/SectionView";
import { loadSection } from "@/lib/section-loader";

export const Route = createFileRoute("/cash-mahidharpura")({
  head: () => ({
    meta: [
      { title: "Cash Mahidharpura — LEPDO BOOKS" },
      { name: "description", content: "Mahidharpura cash flow ledger with credit, debit and balance for LEPDO BOOKS." },
      { property: "og:title", content: "Cash Mahidharpura — LEPDO BOOKS" },
      { property: "og:description", content: "Mahidharpura cash flow ledger with credit, debit and balance for LEPDO BOOKS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: () => loadSection("cash-mahidharpura"),
  component: CashMahidharpuraPage,
});

function CashMahidharpuraPage() {
  const initialData = Route.useLoaderData();
  return <SectionView sectionKey="cash-mahidharpura" initialData={initialData} />;
}
