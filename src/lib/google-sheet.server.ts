const SPREADSHEET_ID = "16NEWBjF3UWiTNad_MHTpkhClw_hWNQt5fJpv7d_xgf8";
const CONNECTOR_GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";

type GoogleCell = { v?: unknown; f?: string | null } | null;
type GoogleQueryResponse = {
  status?: string;
  errors?: Array<{ detailed_message?: string; message?: string }>;
  table?: { rows?: Array<{ c?: GoogleCell[] }> };
};

function formatGoogleValue(cell: GoogleCell): string {
  if (!cell) return "";
  if (typeof cell.f === "string") return cell.f;
  if (cell.v == null) return "";
  return String(cell.v);
}

function parseGoogleQueryResponse(body: string): string[][] {
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start < 0 || end < start) throw new Error("Google Sheets returned an invalid response.");

  const payload = JSON.parse(body.slice(start, end + 1)) as GoogleQueryResponse;
  if (payload.status !== "ok") {
    const detail = payload.errors?.[0]?.detailed_message ?? payload.errors?.[0]?.message;
    throw new Error(detail || "Google Sheets could not return this tab.");
  }

  return (payload.table?.rows ?? []).map((row) => (row.c ?? []).map(formatGoogleValue));
}

async function fetchThroughConnector(tab: string, range: string, lovableKey: string, connectionKey: string) {
  const a1 = `'${tab.replace(/'/g, "''")}'!${range}`;
  const encodedRange = encodeURIComponent(a1).replace(/%3A/g, ":").replace(/%21/g, "!");
  const response = await fetch(
    `${CONNECTOR_GATEWAY}/spreadsheets/${SPREADSHEET_ID}/values/${encodedRange}?valueRenderOption=FORMATTED_VALUE`,
    {
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": connectionKey,
      },
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Google Sheets request failed [${response.status}]: ${body}`);
  }

  const payload = (await response.json()) as { values?: string[][] };
  return payload.values ?? [];
}

async function fetchPublicSheet(tab: string, range: string) {
  const params = new URLSearchParams({ tqx: "out:json", sheet: tab, range });
  const response = await fetch(
    `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?${params}`,
  );
  if (!response.ok) throw new Error(`Google Sheets request failed [${response.status}]`);
  return parseGoogleQueryResponse(await response.text());
}

export async function fetchGoogleSheetRange(tab: string, range: string): Promise<string[][]> {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const connectionKey = process.env["GOOGLE_SHEETS_API_KEY"];

  if (lovableKey && connectionKey) {
    return fetchThroughConnector(tab, range, lovableKey, connectionKey);
  }

  // The workbook is published for read-only access. This portable path keeps
  // local and external deployments working without exposing any credentials.
  return fetchPublicSheet(tab, range);
}