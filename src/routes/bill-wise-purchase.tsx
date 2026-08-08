import { createFileRoute } from "@tanstack/react-router";
import { SectionView } from "@/components/SectionView";
import { loadSection } from "@/lib/section-loader";

export const Route = createFileRoute("/bill-wise-purchase")({
  head: () => ({
    meta: [
      { title: "Bill Wise Purchase — LEPDO BOOKS" },
      { name: "description", content: "Bill wise purchase register with dates, details, weight and amounts." },
      { property: "og:title", content: "Bill Wise Purchase — LEPDO BOOKS" },
      { property: "og:description", content: "Bill wise purchase register with dates, details, weight and amounts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: () => loadSection("bill-wise-purchase"),
  component: BillWisePurchasePage,
});

function BillWisePurchasePage() {
  const initialData = Route.useLoaderData();
  return <SectionView sectionKey="bill-wise-purchase" initialData={initialData} />;
}
