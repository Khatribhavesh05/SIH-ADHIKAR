import { Prisma } from "@prisma/client";
import type { CurrentUser } from "@/lib/auth";
import type { Role } from "@/lib/domain/roles";
import { PERMISSIONS } from "@/lib/domain/roles";
import { prisma } from "@/lib/prisma";
import { ForbiddenError } from "@/lib/require-role";

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

/**
 * Server-side guard for project-scoped mutations: throws if `projectId`
 * doesn't fall within the caller's role/jurisdiction scope, so a direct
 * action/API call with an out-of-scope project id can't bypass the same
 * WHERE clause the list/detail pages apply. Call this in every mutating
 * server action that takes a projectId, alongside the existing
 * `requirePermission` role check.
 */
export async function assertProjectInScope(
  user: CurrentUser,
  projectId: string
): Promise<void> {
  const match = await prisma.project.findFirst({
    where: { id: projectId, ...projectScopeWhere(user.role, user) },
    select: { id: true },
  });
  if (!match) {
    throw new ForbiddenError("Project is outside your scope");
  }
}
