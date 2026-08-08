import { createFileRoute } from "@tanstack/react-router";
import { SectionView } from "@/components/SectionView";
import { loadSection } from "@/lib/section-loader";

export const Route = createFileRoute("/purchase")({
  head: () => ({
    meta: [
      { title: "Purchase — LEPDO BOOKS" },
      { name: "description", content: "Party wise purchase with diamond carats, purchase value, paid and pending amounts." },
      { property: "og:title", content: "Purchase — LEPDO BOOKS" },
      { property: "og:description", content: "Party wise purchase with diamond carats, purchase value, paid and pending amounts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: () => loadSection("purchase"),
  component: PurchasePage,
});

function PurchasePage() {
  const initialData = Route.useLoaderData();
  return <SectionView sectionKey="purchase" initialData={initialData} />;
}
