import { createFileRoute } from "@tanstack/react-router";
import { SectionView } from "@/components/SectionView";
import { loadSection } from "@/lib/section-loader";

export const Route = createFileRoute("/bills-sales")({
  head: () => ({
    meta: [
      { title: "Bills Sales — LEPDO BOOKS" },
      { name: "description", content: "Sales bill summary with GST breakdown and final bill amounts." },
      { property: "og:title", content: "Bills Sales — LEPDO BOOKS" },
      { property: "og:description", content: "Sales bill summary with GST breakdown and final bill amounts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: () => loadSection("bills-sales"),
  component: BillsSalesPage,
});

function BillsSalesPage() {
  const initialData = Route.useLoaderData();
  return <SectionView sectionKey="bills-sales" initialData={initialData} />;
}
