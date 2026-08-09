import { fetchGoogleSheetRange } from "./google-sheet.server";

const RANGE = "A5:R27";

export interface AccountRow {
  name: string;
  value: string;
}

export interface DashboardData {
  sales: { allTime: string; monthly: string; paid: string; pending: string };
  purchase: { allTime: string; monthly: string; paid: string; pending: string };
  expense: { allTime: string; monthly: string };
  goods: { carats: string; amount: string };
  balance: { bank: string; cash: string; total: string };
  bankAccounts: AccountRow[];
  cashAccounts: AccountRow[];
  updatedAt: string;
}

function clean(value: unknown): string {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text || text === "-") return "—";
  return text;
}

export async function fetchDashboard(): Promise<DashboardData> {
  const rows = await fetchGoogleSheetRange("Dashboard", RANGE);
  const at = (rowOffset: number, col: number) => clean(rows[rowOffset]?.[col]);

  const accounts = (nameCol: number, valueCol: number): AccountRow[] =>
    [19, 20, 21, 22]
      .map((r) => ({ name: clean(rows[r]?.[nameCol]), value: at(r, valueCol) }))
      .filter((a) => a.name !== "—");

  return {
    sales: {
      allTime: at(2, 1),
      monthly: at(2, 4),
      paid: at(2, 7),
      pending: at(2, 10),
    },
    purchase: {
      allTime: at(7, 1),
      monthly: at(7, 4),
      paid: at(7, 7),
      pending: at(7, 10),
    },
    expense: { allTime: at(12, 1), monthly: at(12, 4) },
    goods: { carats: at(12, 7), amount: at(12, 10) },
    balance: { bank: at(17, 3), cash: at(17, 7), total: at(17, 9) },
    bankAccounts: accounts(1, 3),
    cashAccounts: accounts(5, 7),
    updatedAt: new Date().toISOString(),
  };
}
