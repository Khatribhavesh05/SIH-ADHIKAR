import { Prisma } from "@prisma/client";

/**
 * Recursively converts Prisma `Decimal` instances (e.g. totalAreaAcres,
 * marketValue, finalCompensationAmount, disbursedAmount, ...) into plain
 * numbers. React Server Components can only pass plain objects across the
 * server/client boundary — a raw Decimal instance passed as a prop to a
 * "use client" component logs "Only plain objects can be passed to Client
 * Components..." and silently loses its custom prototype on the client.
 *
 * Call this on any Prisma query result (including its nested `include`s)
 * before handing it to a Client Component. Dates and everything else pass
 * through untouched — Next.js already knows how to serialize those.
 */
export function serializeDecimals<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (value instanceof Prisma.Decimal) {
    return value.toNumber() as unknown as T;
  }
  if (value instanceof Date) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => serializeDecimals(v)) as unknown as T;
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = serializeDecimals(v);
    }
    return out as T;
  }
  return value;
}
