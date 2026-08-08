const SPREADSHEET_ID = "16NEWBjF3UWiTNad_MHTpkhClw_hWNQt5fJpv7d_xgf8";
const RANGE = "Dashboard!A5:R27";
const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";

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
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["GOOGLE_SHEETS_API_KEY"];
  if (!lovableKey || !connectionKey) {
    throw new Error("Google Sheets connection is not configured.");
  }

  const res = await fetch(
    `${GATEWAY}/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?valueRenderOption=FORMATTED_VALUE`,
    {
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": connectionKey,
      },
    },
  );

  if (!res.ok) {
    const body = await res.text();
    console.error(`Google Sheets request failed [${res.status}]: ${body}`);
    throw new Error(`Google Sheets request failed [${res.status}]: ${body}`);
  }

  const json = (await res.json()) as { values?: string[][] };
  const rows = json.values ?? [];
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
