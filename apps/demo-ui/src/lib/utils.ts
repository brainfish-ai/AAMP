import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortDid(did: string): string {
  if (!did) return "";
  if (did.startsWith("did:key:")) {
    const key = did.slice("did:key:".length);
    return `did:key:…${key.slice(-8)}`;
  }
  return did.length > 40 ? `${did.slice(0, 20)}…${did.slice(-8)}` : did;
}

export function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour12:      false,
    hour:        "2-digit",
    minute:      "2-digit",
    second:      "2-digit",
    fractionalSecondDigits: 3,
  });
}
