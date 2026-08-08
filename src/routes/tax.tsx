import { createFileRoute } from "@tanstack/react-router";
import { SectionView } from "@/components/SectionView";
import { loadSection } from "@/lib/section-loader";

export const Route = createFileRoute("/tax")({
  head: () => ({
    meta: [
      { title: "Tax — LEPDO BOOKS" },
      { name: "description", content: "Tax payment entries and total tax for LEPDO BOOKS." },
      { property: "og:title", content: "Tax — LEPDO BOOKS" },
      { property: "og:description", content: "Tax payment entries and total tax for LEPDO BOOKS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: () => loadSection("tax"),
  component: TaxPage,
});

function TaxPage() {
  const initialData = Route.useLoaderData();
  return <SectionView sectionKey="tax" initialData={initialData} />;
}
