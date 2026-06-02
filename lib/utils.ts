import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function currency(value: number | null | undefined) {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0
  }).format(value ?? 0);
}

const bangladeshFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Dhaka",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
});

function bangladeshParts(date: Date) {
  const parts = bangladeshFormatter.formatToParts(date);
  return {
    year: parts.find((part) => part.type === "year")?.value ?? "1970",
    month: parts.find((part) => part.type === "month")?.value ?? "01",
    day: parts.find((part) => part.type === "day")?.value ?? "01"
  };
}

export function bangladeshIsoDate(date = new Date()) {
  const parts = bangladeshParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function todayIso() {
  return bangladeshIsoDate();
}

export function currentBangladeshYear() {
  return bangladeshParts(new Date()).year;
}

export function addDaysIso(dateText: string, days: number) {
  const date = new Date(`${dateText}T00:00:00+06:00`);
  date.setUTCDate(date.getUTCDate() + days);
  return bangladeshIsoDate(date);
}

export function monthRangeIso(dateText: string) {
  const [yearText, monthText] = dateText.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    start: `${yearText}-${monthText}-01`,
    end: `${yearText}-${monthText}-${String(lastDay).padStart(2, "0")}`
  };
}

export function bangladeshDateRangeToUtc(startDate: string, endDate: string) {
  return {
    start: new Date(`${startDate}T00:00:00.000+06:00`).toISOString(),
    end: new Date(`${endDate}T23:59:59.999+06:00`).toISOString()
  };
}

export function toNumber(value: FormDataEntryValue | null) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function emptyToNull(value: FormDataEntryValue | string | null | undefined) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

export function parseOptionalInteger(value: FormDataEntryValue | string | null | undefined) {
  const text = emptyToNull(value);
  if (text === null) return null;
  const parsed = Number(text);
  return Number.isInteger(parsed) ? parsed : null;
}
