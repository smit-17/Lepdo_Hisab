export interface NavItem {
  to: string;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard" },
  { to: "/pnl", label: "P & L" },
  { to: "/drawings", label: "Drawings" },
  { to: "/bank-ledger", label: "Bank Ledger" },
  { to: "/cash-it-park", label: "Cash IT Park" },
  { to: "/cash-mahidharpura", label: "Cash Mahidharpura" },
  { to: "/expense-ledger", label: "Expense Ledger" },
  { to: "/uchhina", label: "Uchhina" },
  { to: "/tax", label: "Tax" },
  { to: "/bills-sales", label: "Bills Sales" },
  { to: "/sales", label: "Sales" },
  { to: "/bill-wise-sales", label: "Bill Wise Sales" },
  { to: "/bill-wise-purchase", label: "Bill Wise Purchase" },
  { to: "/purchase", label: "Purchase" },
];

const NON_CURRENCY = /CT|CARAT|WEIGHT|BILL\s*NO|DATE|TYPE|NAME|PARTICUL|DETAIL|PERTICUL|PRINT|STAMP|GST$/i;

export function isCurrencyHeader(header: string): boolean {
  if (!header) return false;
  if (NON_CURRENCY.test(header)) return false;
  return true;
}

export function parseNumber(value: string): number | null {
  if (!value) return null;
  const normalized = value.replace(/[₹,\s]/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;
  return Number(normalized);
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCell(header: string, value: string): string {
  if (!value) return "—";
  const num = parseNumber(value);
  if (num === null) return value;
  if (!isCurrencyHeader(header)) return value;
  return formatCurrency(num);
}

/** Parses d/m/yyyy or dd-mm-yyyy sheet dates. */
export function parseSheetDate(value: string): Date | null {
  const match = value?.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (!match) return null;
  const [, a, b, y] = match;
  const day = Number(a);
  const month = Number(b);
  if (!day || !month || month > 12 || day > 31) return null;
  return new Date(Number(y), month - 1, day);
}
