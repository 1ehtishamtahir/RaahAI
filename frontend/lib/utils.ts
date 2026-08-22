import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function maskCnic(value: string): string {
  // 12345-1234567-1 -> XXXXX-XXXXXXX-X
  return value.replace(/\d{5}-\d{7}-\d{1}/g, "XXXXX-XXXXXXX-X");
}
