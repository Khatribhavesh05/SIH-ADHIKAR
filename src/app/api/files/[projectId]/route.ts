import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { assertProjectInScope } from "@/lib/queries/scope";
import { getSignedFileUrl } from "@/lib/supabase/storage";
import { ForbiddenError } from "@/lib/require-role";

// Scoped file access: verifies the caller can see this project before
// minting a signed URL, then redirects to it — mirrors the
// assertProjectInScope check already used on project mutations, applied
// here to reads.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const path = request.nextUrl.searchParams.get("path");
  if (!path || !path.startsWith(`${projectId}/`)) {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    await assertProjectInScope(user, projectId);
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    throw err;
  }

  const signedUrl = await getSignedFileUrl(path);
  return NextResponse.redirect(signedUrl);
}
