import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/lib/domain/roles";

export interface CurrentUser {
  id: string;
  authUserId: string;
  email: string;
  name: string;
  role: Role;
  jurisdictionState: string | null;
  jurisdictionDistrict: string | null;
}

// Per-process, short-TTL cache for the User profile lookup, keyed by
// Supabase auth user id. Role/jurisdiction are fixed at account creation
// in this app (see build prompt: "not user-selectable") — there is no
// in-app mutation that changes them — so caching this specific lookup for
// a few minutes is safe. It removes the second network round trip
// (Prisma -> Postgres) from the hot path of every navigation; the
// security-relevant call, auth.getUser() against Supabase, is never
// cached and always runs fresh below.
const PROFILE_CACHE_TTL_MS = 5 * 60 * 1000;
const profileCache = new Map<string, { profile: CurrentUser; expiresAt: number }>();

/**
 * The real, authenticated user + DB profile — the single source of truth
 * for both permission checks and what's rendered. "View As" (see
 * AccountSwitcher.tsx) swaps the actual Supabase session to another demo
 * account rather than overlaying a cosmetic role, so this function always
 * reflects who is genuinely signed in.
 *
 * Wrapped in React's `cache()` for request-level memoization: the (app)
 * layout and every page under it each call this independently, and
 * without memoization that meant two full round trips (Supabase Auth's
 * getUser() + a Prisma lookup) per navigation instead of one — the
 * dominant cost in a ~2-4s page load. `cache()` makes every call within
 * the same render pass share one in-flight/resolved result.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const cached = profileCache.get(user.id);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.profile;
  }

  const profile = await prisma.user.findUnique({
    where: { authUserId: user.id },
  });

  if (!profile) return null;

  const currentUser: CurrentUser = {
    id: profile.id,
    authUserId: profile.authUserId,
    email: profile.email,
    name: profile.name,
    role: profile.role as Role,
    jurisdictionState: profile.jurisdictionState,
    jurisdictionDistrict: profile.jurisdictionDistrict,
  };

  profileCache.set(user.id, { profile: currentUser, expiresAt: Date.now() + PROFILE_CACHE_TTL_MS });

  return currentUser;
});
