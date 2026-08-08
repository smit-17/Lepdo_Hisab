import { createFileRoute } from "@tanstack/react-router";
import { SectionView } from "@/components/SectionView";
import { loadSection } from "@/lib/section-loader";

export const Route = createFileRoute("/uchhina")({
  head: () => ({
    meta: [
      { title: "Uchhina — LEPDO BOOKS" },
      { name: "description", content: "Uchhina take and return ledger with totals for LEPDO BOOKS." },
      { property: "og:title", content: "Uchhina — LEPDO BOOKS" },
      { property: "og:description", content: "Uchhina take and return ledger with totals for LEPDO BOOKS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: () => loadSection("uchhina"),
  component: UchhinaPage,
});

function UchhinaPage() {
  const initialData = Route.useLoaderData();
  return <SectionView sectionKey="uchhina" initialData={initialData} />;
}
