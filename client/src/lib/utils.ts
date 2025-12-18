import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "R$ 0,00";
  
  let numValue: number;
  if (typeof value === "string") {
    // Handle Brazilian format (1.234,56) or international format (1234.56)
    if (value.includes(",")) {
      // Brazilian format: remove dots (thousands) and replace comma with dot
      const cleaned = value.replace(/\./g, "").replace(",", ".");
      numValue = parseFloat(cleaned);
    } else {
      numValue = parseFloat(value);
    }
  } else {
    numValue = value;
  }
  
  if (isNaN(numValue)) return "R$ 0,00";
  
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numValue);
}

export function parseCurrencyToNumber(value: string): number {
  if (!value) return 0;
  const cleaned = value
    .replace(/[R$\s]/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export function formatCurrencyInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  
  const numValue = parseInt(digits, 10) / 100;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
}
