import { clsx } from "clsx";

/** Merges class names, dropping falsy values. */
export function cn(...inputs) {
  return clsx(inputs);
}
