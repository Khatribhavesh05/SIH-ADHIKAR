import { getCurrentUser, type CurrentUser } from "@/lib/auth";
import { PERMISSIONS, type Role } from "@/lib/domain/roles";

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/**
 * Server-side permission gate used by every mutating server action / API
 * route. Always checks the REAL authenticated user's role — never the
 * "view as" demo cookie, which is UI-only.
 */
export async function requirePermission(
  check: (perm: (typeof PERMISSIONS)[Role]) => boolean
): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new ForbiddenError("Not authenticated");
  if (!check(PERMISSIONS[user.role])) {
    throw new ForbiddenError("You do not have permission to perform this action");
  }
  return user;
}
