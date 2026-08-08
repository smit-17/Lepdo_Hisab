import { createFileRoute } from "@tanstack/react-router";
import { SectionView } from "@/components/SectionView";
import { loadSection } from "@/lib/section-loader";

export const Route = createFileRoute("/bill-wise-sales")({
  head: () => ({
    meta: [
      { title: "Bill Wise Sales — LEPDO BOOKS" },
      { name: "description", content: "Bill wise sales register with dates, party names, weight and amounts." },
      { property: "og:title", content: "Bill Wise Sales — LEPDO BOOKS" },
      { property: "og:description", content: "Bill wise sales register with dates, party names, weight and amounts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: () => loadSection("bill-wise-sales"),
  component: BillWiseSalesPage,
});

function BillWiseSalesPage() {
  const initialData = Route.useLoaderData();
  return <SectionView sectionKey="bill-wise-sales" initialData={initialData} />;
}
