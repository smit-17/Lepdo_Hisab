import { createHash, timingSafeEqual } from "node:crypto";
import { getRequest, useSession } from "@tanstack/react-start/server";

import { fetchDashboard, type DashboardData } from "./dashboard.server";
import { fetchSection, isSectionKey, type SectionData } from "./sheets.server";

type GateSession = { unlocked?: boolean };

function getSessionConfig() {
  const raw = process.env["SESSION_SECRET"];
  if (!raw) throw new Error("SESSION_SECRET is not set");
  const request = getRequest();
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const secure = forwardedProtocol
    ? forwardedProtocol === "https"
    : new URL(request.url).protocol === "https:";

  // The session encryption requires a 32+ character key. Derive a stable
  // 64-char hex key from whatever value is configured, so short secrets work.
  const password = createHash("sha256").update(raw, "utf8").digest("hex");

  return {
    password,
    name: "lepdo-gate",
    maxAge: 60 * 60 * 24 * 7,
    cookie: {
      httpOnly: true,
      secure,
      sameSite: "lax" as const,
      path: "/",
    },
  };
}

function passwordMatches(input: string, expected: string): boolean {
  const inputDigest = createHash("sha256").update(input, "utf8").digest();
  const expectedDigest = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(inputDigest, expectedDigest);
}

export async function unlockWithPassword(password: string) {
  const expected = process.env["SITE_PASSWORD"];
  if (!expected) throw new Error("SITE_PASSWORD is not set");
  if (typeof password !== "string" || password.length > 200) return false;
  if (!passwordMatches(password, expected)) return false;

  const session = await useSession<GateSession>(getSessionConfig());
  await session.update({ unlocked: true });
  return true;
}

export async function clearGateSession() {
  const session = await useSession<GateSession>(getSessionConfig());
  await session.clear();
}

export async function getUnlockedDashboard(): Promise<DashboardData | null> {
  if (!process.env["SESSION_SECRET"]) return null;
  const session = await useSession<GateSession>(getSessionConfig());
  if (!session.data.unlocked) return null;
  return fetchDashboard();
}

export async function getUnlockedSection(key: string): Promise<SectionData | null> {
  if (!process.env["SESSION_SECRET"]) return null;
  const session = await useSession<GateSession>(getSessionConfig());
  if (!session.data.unlocked) return null;
  if (!isSectionKey(key)) throw new Error("Unknown section");
  return fetchSection(key);
}