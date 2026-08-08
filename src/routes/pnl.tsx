import { createFileRoute } from "@tanstack/react-router";
import { SectionView } from "@/components/SectionView";
import { loadSection } from "@/lib/section-loader";

export const Route = createFileRoute("/pnl")({
  head: () => ({
    meta: [
      { title: "P & L — LEPDO BOOKS" },
      { name: "description", content: "Profit and loss statement for LEPDO BOOKS with sales, purchase, gross profit and EBITDA." },
      { property: "og:title", content: "P & L — LEPDO BOOKS" },
      { property: "og:description", content: "Profit and loss statement for LEPDO BOOKS with sales, purchase, gross profit and EBITDA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: () => loadSection("pnl"),
  component: PnlPage,
});

function PnlPage() {
  const initialData = Route.useLoaderData();
  return <SectionView sectionKey="pnl" initialData={initialData} />;
}
