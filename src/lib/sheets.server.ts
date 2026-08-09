import { fetchGoogleSheetRange } from "./google-sheet.server";

export interface Block {
  label?: string;
  total?: string;
  headers: string[];
  rows: string[][];
}

export interface SummaryItem {
  label: string;
  value: string;
}

export interface SectionData {
  title: string;
  tab: string;
  summary: SummaryItem[];
  blocks: Block[];
  updatedAt: string;
}

type Grid = string[][];

function clean(value: unknown): string {
  const text = typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  if (!text || text === "-") return "";
  return text;
}

function at(grid: Grid, row: number, col: number): string {
  return clean(grid[row]?.[col]);
}

async function getGrid(tab: string, range: string): Promise<Grid> {
  return fetchGoogleSheetRange(tab, range);
}

interface BlockSpec {
  label?: string;
  total?: string;
  headerRows: number[];
  dataStart: number;
  from: number;
  to: number;
}

function buildBlock(grid: Grid, spec: BlockSpec): Block {
  const cols: number[] = [];
  for (let col = spec.from; col <= spec.to; col += 1) cols.push(col);

  const headers = cols.map((col) =>
    spec.headerRows
      .map((row) => at(grid, row, col))
      .filter(Boolean)
      .join(" ")
      .trim(),
  );

  // Rows that only repeat a label are noise; wide tables need at least two
  // filled cells to count as a real record.
  const minCells = cols.length >= 3 ? 2 : 1;
  const headerKey = headers.join("|").toLowerCase();

  const rows: string[][] = [];
  for (let row = spec.dataStart; row < grid.length; row += 1) {
    const cells = cols.map((col) => at(grid, row, col));
    const filled = cells.filter(Boolean).length;
    if (filled < minCells) continue;
    if (cells.join("|").toLowerCase() === headerKey) continue;
    rows.push(cells);
  }


  // Drop columns with no header and no data.
  const keep = cols.map(
    (_, i) => Boolean(headers[i]) || rows.some((r) => Boolean(r[i])),
  );

  return {
    ...(spec.label ? { label: spec.label } : {}),
    ...(spec.total ? { total: spec.total } : {}),
    headers: headers.filter((_, i) => keep[i]),
    rows: rows.map((r) => r.filter((_, i) => keep[i])),
  };
}

export const SECTIONS = {
  pnl: { title: "P & L", tab: "P & L " },
  drawings: { title: "Drawings", tab: "Drawings " },
  "bank-ledger": { title: "Bank Ledger", tab: "Bank Ledger" },
  "cash-it-park": { title: "Cash IT Park", tab: "Cash IT PARK" },
  "cash-mahidharpura": { title: "Cash Mahidharpura", tab: "Cash MAHIDHRPURA" },
  "expense-ledger": { title: "Expense Ledger", tab: "Expense Ledger" },
  uchhina: { title: "Uchhina", tab: "UCHHINA" },
  tax: { title: "Tax", tab: "TAX" },
  "bills-sales": { title: "Bills Sales", tab: "BILLS SALES" },
  sales: { title: "Sales", tab: "SALES" },
  "bill-wise-sales": { title: "Bill Wise Sales", tab: "Bill Wise S" },
  "bill-wise-purchase": { title: "Bill Wise Purchase", tab: "Bill Wise P" },
  purchase: { title: "Purchase", tab: "PURCHASE" },
} as const;

export type SectionKey = keyof typeof SECTIONS;

export function isSectionKey(value: string): value is SectionKey {
  return Object.prototype.hasOwnProperty.call(SECTIONS, value);
}

function ledgerBlocks(grid: Grid, starts: number[]): Block[] {
  // Each ledger block: title + total in row 0, headers in row 1, data from row 3.
  return starts.map((start) => {
    const label = at(grid, 0, start);
    const total = at(grid, 0, start + 3) || at(grid, 0, start + 4);
    return buildBlock(grid, {
      ...(label ? { label } : {}),
      ...(total ? { total } : {}),
      headerRows: [1],
      dataStart: 3,
      from: start,
      to: start + 4,
    });
  });
}


function build(key: SectionKey, grid: Grid): { summary: SummaryItem[]; blocks: Block[] } {
  switch (key) {
    case "pnl": {
      const summary: SummaryItem[] = [];
      for (let row = 1; row < grid.length; row += 1) {
        const label = at(grid, row, 1);
        const value = at(grid, row, 3);
        if (label && value) summary.push({ label, value });
      }
      return { summary, blocks: [] };
    }
    case "drawings":
      return {
        summary: [
          { label: `${at(grid, 0, 1) || "Ledger 1"} — Upad & Salary`, value: at(grid, 1, 3) },
          { label: `${at(grid, 0, 1) || "Ledger 1"} — Investment`, value: at(grid, 1, 6) },
          { label: `${at(grid, 0, 8) || "Ledger 2"} — Upad & Salary`, value: at(grid, 1, 10) },
          { label: `${at(grid, 0, 8) || "Ledger 2"} — Investment`, value: at(grid, 1, 13) },
        ].filter((s) => Boolean(s.value)),
        blocks: [
          buildBlock(grid, {
            label: `${at(grid, 0, 1)} — Upad & Salary`,
            headerRows: [2],
            dataStart: 3,
            from: 1,
            to: 3,
          }),
          buildBlock(grid, {
            label: `${at(grid, 0, 1)} — Investment`,
            headerRows: [2],
            dataStart: 3,
            from: 4,
            to: 6,
          }),
          buildBlock(grid, {
            label: `${at(grid, 0, 8)} — Upad & Salary`,
            headerRows: [2],
            dataStart: 3,
            from: 8,
            to: 10,
          }),
          buildBlock(grid, {
            label: `${at(grid, 0, 8)} — Investment`,
            headerRows: [2],
            dataStart: 3,
            from: 11,
            to: 13,
          }),
        ],
      };
    case "bank-ledger":
      return { summary: [], blocks: ledgerBlocks(grid, [1, 7, 13, 19]) };
    case "cash-it-park":
    case "cash-mahidharpura":
      return { summary: [], blocks: ledgerBlocks(grid, [1]) };
    case "expense-ledger":
      return {
        summary: [],
        blocks: [buildBlock(grid, { headerRows: [0], dataStart: 1, from: 1, to: 13 })],
      };
    case "uchhina":
      return {
        summary: [
          { label: at(grid, 3, 0) || "Uchhina Take", value: at(grid, 3, 2) },
          { label: at(grid, 3, 3) || "Uchhina Return", value: at(grid, 3, 5) },
        ].filter((s) => Boolean(s.value)),
        blocks: [
          buildBlock(grid, {
            label: `${at(grid, 5, 0)} — ${at(grid, 6, 0) || "Take"}`.trim(),
            headerRows: [7],
            dataStart: 8,
            from: 0,
            to: 2,
          }),
          buildBlock(grid, {
            label: `${at(grid, 5, 0)} — ${at(grid, 6, 3) || "Return"}`.trim(),
            headerRows: [7],
            dataStart: 8,
            from: 3,
            to: 5,
          }),
        ],
      };
    case "tax":
      return {
        summary: [{ label: "Total Tax", value: at(grid, 0, 2) }].filter((s) =>
          Boolean(s.value),
        ),
        blocks: [buildBlock(grid, { headerRows: [2], dataStart: 3, from: 0, to: 2 })],
      };
    case "bills-sales":
      return {
        summary: [
          { label: "CR Score", value: at(grid, 2, 12) },
          { label: "Total Bill Amount", value: at(grid, 2, 7) },
        ].filter((s) => Boolean(s.value)),
        blocks: [buildBlock(grid, { headerRows: [4, 5], dataStart: 6, from: 0, to: 12 })],
      };
    case "sales":
    case "purchase": {
      const label = key === "sales" ? "Sales" : "Purchase";
      return {
        summary: [
          { label: "Diamond / CT", value: at(grid, 0, 3) },
          { label: `Total ${label}`, value: at(grid, 0, 4) },
          { label: "Paid", value: at(grid, 0, 5) },
          { label: "Pending", value: at(grid, 0, 6) },
        ].filter((s) => Boolean(s.value)),
        blocks: [
          buildBlock(grid, {
            headerRows: [1],
            dataStart: 2,
            from: 1,
            to: 6,
          }),
        ],
      };
    }
    case "bill-wise-sales":
      return {
        summary: [
          { label: "Diamond Weight", value: at(grid, 0, 5) },
          { label: "Total Amount", value: at(grid, 0, 6) },
        ].filter((s) => Boolean(s.value)),
        blocks: [buildBlock(grid, { headerRows: [1], dataStart: 2, from: 1, to: 6 })],
      };
    case "bill-wise-purchase":
      return {
        summary: [
          { label: "Diamond Weight", value: at(grid, 0, 3) },
          { label: "Total Amount", value: at(grid, 0, 4) },
        ].filter((s) => Boolean(s.value)),
        blocks: [buildBlock(grid, { headerRows: [1], dataStart: 2, from: 0, to: 4 })],
      };
  }
}

export async function fetchSection(key: SectionKey): Promise<SectionData> {
  const section = SECTIONS[key];
  const grid = await getGrid(section.tab, "A1:X400");
  const { summary, blocks } = build(key, grid);
  return {
    title: section.title,
    tab: section.tab,
    summary,
    blocks: blocks.filter((b) => b.headers.length > 0 || b.rows.length > 0),
    updatedAt: new Date().toISOString(),
  };
}
