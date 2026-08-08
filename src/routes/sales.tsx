import { createFileRoute } from "@tanstack/react-router";
import { SectionView } from "@/components/SectionView";
import { loadSection } from "@/lib/section-loader";

export const Route = createFileRoute("/sales")({
  head: () => ({
    meta: [
      { title: "Sales — LEPDO BOOKS" },
      { name: "description", content: "Party wise sales with diamond carats, sales value, paid and pending amounts." },
      { property: "og:title", content: "Sales — LEPDO BOOKS" },
      { property: "og:description", content: "Party wise sales with diamond carats, sales value, paid and pending amounts." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: () => loadSection("sales"),
  component: SalesPage,
});

function SalesPage() {
  const initialData = Route.useLoaderData();
  return <SectionView sectionKey="sales" initialData={initialData} />;
}
