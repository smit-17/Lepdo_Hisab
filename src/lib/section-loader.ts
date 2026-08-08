import { redirect } from "@tanstack/react-router";
import { getDashboard, getSection } from "./gate.functions";
import type { DashboardData } from "./dashboard.server";
import type { SectionData } from "./sheets.server";

/**
 * Server functions return a `locked` marker instead of throwing a redirect so
 * imperative call sites (query refetches) never receive a raw Response.
 * Loaders are router-aware, so the redirect is thrown here.
 */
export async function loadDashboard(): Promise<DashboardData> {
  const result = await getDashboard();
  if ("locked" in result) throw redirect({ to: "/unlock" });
  return result;
}

export async function loadSection(key: string): Promise<SectionData> {
  const result = await getSection({ data: { key } });
  if ("locked" in result) throw redirect({ to: "/unlock" });
  return result;
}
