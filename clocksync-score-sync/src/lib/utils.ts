import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class names with intelligent deduping.
 * Usage: cn("px-4", isActive && "bg-blue-500", customClass)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
