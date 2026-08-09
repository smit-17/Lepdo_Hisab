import { createServerFn } from "@tanstack/react-start";
import type { DashboardData } from "./dashboard.server";
import type { SectionData } from "./sheets.server";

export type Locked = { locked: true };

export const unlockSite = createServerFn({ method: "POST" })
  .validator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const { unlockWithPassword } = await import("./gate.server");
    const ok = await unlockWithPassword(data.password);
    return { ok };
  });

export const lockSite = createServerFn({ method: "POST" }).handler(async () => {
  const { clearGateSession } = await import("./gate.server");
  await clearGateSession();
  return { ok: true as const };
});

export const getDashboard = createServerFn({ method: "GET" }).handler(
  async (): Promise<DashboardData | Locked> => {
    const { getUnlockedDashboard } = await import("./gate.server");
    const dashboard = await getUnlockedDashboard();
    return dashboard ?? { locked: true as const };
  },
);

export const getSection = createServerFn({ method: "GET" })
  .validator((data: { key: string }) => data)
  .handler(async ({ data }): Promise<SectionData | Locked> => {
    const { getUnlockedSection } = await import("./gate.server");
    const section = await getUnlockedSection(data.key);
    return section ?? { locked: true as const };
  });

