export const DEFAULT_APP_LOCALE = "es-PY" as const;
export const DEFAULT_APP_CURRENCY = "PYG" as const;

type FormatOptions = {
  language?: string;
  currency?: string;
};

// Base currency used in persistence layer (database)
const BASE_CURRENCY = "PYG" as const;
// Static conversion used only for UI conversion between PYG and BRL.
// If needed later, this can be replaced by an API/provider.
const PYG_PER_BRL = 1400;

export function getAppCurrencySymbol(currency: string = DEFAULT_APP_CURRENCY): string {
  return currency === "BRL" ? "R$" : "₲";
}

function fromBaseCurrency(value: number, currency: string): number {
  if (currency === BASE_CURRENCY) return value;
  if (currency === "BRL") return value / PYG_PER_BRL;
  return value;
}

function toBaseCurrency(value: number, currency: string): number {
  if (currency === BASE_CURRENCY) return value;
  if (currency === "BRL") return value * PYG_PER_BRL;
  return value;
}

/**
 * Formats an integer amount (whole guaranis) as a currency string (e.g. "₲ 1.500").
 * Values are stored as integers in the smallest unit currently in use (1 PYG).
 */
export function formatCurrency(value: number | null | undefined, options?: FormatOptions): string {
  const safeBase = typeof value === "number" && Number.isFinite(value) ? value : 0;
  const language = options?.language || DEFAULT_APP_LOCALE;
  const currency = options?.currency || DEFAULT_APP_CURRENCY;
  const safe = fromBaseCurrency(safeBase, currency);
  const currencyFormatter = new Intl.NumberFormat(language, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "BRL" ? 2 : 0,
    maximumFractionDigits: currency === "BRL" ? 2 : 0,
  });
  return currencyFormatter.format(safe);
}

/**
 * Formats an integer as a plain localized number (no currency symbol).
 */
export function formatNumber(value: number | null | undefined, options?: FormatOptions): string {
  const safeBase = typeof value === "number" && Number.isFinite(value) ? value : 0;
  const language = options?.language || DEFAULT_APP_LOCALE;
  const currency = options?.currency || DEFAULT_APP_CURRENCY;
  const safe = fromBaseCurrency(safeBase, currency);
  const numberFormatter = new Intl.NumberFormat(language, {
    minimumFractionDigits: currency === "BRL" ? 2 : 0,
    maximumFractionDigits: currency === "BRL" ? 2 : 0,
  });
  return numberFormatter.format(safe);
}

/**
 * Converts a user input string (e.g. "1500", "1.500", "1,500") into an integer
 * amount in guaranis. Returns NaN when the input is empty/invalid.
 */
export function parseCurrencyInput(input: string, options?: FormatOptions): number {
  if (typeof input !== "string") return NaN;
  const currency = options?.currency || DEFAULT_APP_CURRENCY;
  const normalized = input.replace(/\s/g, "").replace(",", ".");
  const cleaned = normalized.replace(/[^\d.-]/g, "");
  if (cleaned === "" || cleaned === "-" || cleaned === ".") return NaN;
  const parsed = Number.parseFloat(cleaned);
  if (!Number.isFinite(parsed)) return NaN;
  const inBase = toBaseCurrency(parsed, currency);
  return Math.round(inBase);
}

export function convertFromBaseCurrency(value: number | null | undefined, currency: string): number {
  const safe = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return fromBaseCurrency(safe, currency);
}
