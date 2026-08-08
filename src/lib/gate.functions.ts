import { createServerFn } from "@tanstack/react-start";
import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { fetchDashboard, type DashboardData } from "./dashboard.server";
import { fetchSection, isSectionKey, type SectionData } from "./sheets.server";


type GateSession = { unlocked?: boolean };
export type Locked = { locked: true };

function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "lepdo-gate",
    maxAge: 60 * 60 * 24 * 7,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

function passwordMatches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export const unlockSite = createServerFn({ method: "POST" })
  .inputValidator((data: { password: string }) => data)
  .handler(async ({ data }) => {
    const expected = process.env["SITE_PASSWORD"];
    if (!expected) throw new Error("SITE_PASSWORD is not set");
    if (typeof data.password !== "string" || data.password.length > 200) {
      return { ok: false as const };
    }
    if (!passwordMatches(data.password, expected)) return { ok: false as const };
    const session = await useSession<GateSession>(sessionConfig());
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const lockSite = createServerFn({ method: "POST" }).handler(async () => {
  const session = await useSession<GateSession>(sessionConfig());
  await session.clear();
  return { ok: true as const };
});

export const getDashboard = createServerFn({ method: "GET" }).handler(
  async (): Promise<DashboardData | Locked> => {
    const session = await useSession<GateSession>(sessionConfig());
    if (!session.data.unlocked) return { locked: true as const };
    return fetchDashboard();
  },
);

export const getSection = createServerFn({ method: "GET" })
  .inputValidator((data: { key: string }) => data)
  .handler(async ({ data }): Promise<SectionData | Locked> => {
    const session = await useSession<GateSession>(sessionConfig());
    if (!session.data.unlocked) return { locked: true as const };
    if (!isSectionKey(data.key)) throw new Error("Unknown section");
    return fetchSection(data.key);
  });

