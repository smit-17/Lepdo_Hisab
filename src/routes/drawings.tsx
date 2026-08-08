import { createFileRoute } from "@tanstack/react-router";
import { SectionView } from "@/components/SectionView";
import { loadSection } from "@/lib/section-loader";

export const Route = createFileRoute("/drawings")({
  head: () => ({
    meta: [
      { title: "Drawings — LEPDO BOOKS" },
      { name: "description", content: "Partner drawings ledgers: upad, salary and investment entries for LEPDO BOOKS." },
      { property: "og:title", content: "Drawings — LEPDO BOOKS" },
      { property: "og:description", content: "Partner drawings ledgers: upad, salary and investment entries for LEPDO BOOKS." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  loader: () => loadSection("drawings"),
  component: DrawingsPage,
});

function DrawingsPage() {
  const initialData = Route.useLoaderData();
  return <SectionView sectionKey="drawings" initialData={initialData} />;
}
