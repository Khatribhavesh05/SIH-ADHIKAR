import { Prisma } from "@prisma/client";
import type { CurrentUser } from "@/lib/auth";
import type { Role } from "@/lib/domain/roles";
import { PERMISSIONS } from "@/lib/domain/roles";

/**
 * Builds a Prisma `where` clause scoping the Project list to what a role
 * is allowed to see, per the deadline/analytics scope column of the
 * permission matrix.
 */
export function projectScopeWhere(
  role: Role,
  user: CurrentUser
): Prisma.ProjectWhereInput {
  const scope = PERMISSIONS[role].deadlineScope;

  switch (scope) {
    case "own_projects":
      return { createdByUserId: user.id };
    case "own_district":
      return user.jurisdictionDistrict
        ? { district: user.jurisdictionDistrict }
        : {};
    case "own_state":
      return user.jurisdictionState ? { state: user.jurisdictionState } : {};
    case "national":
    default:
      return {};
  }
}
