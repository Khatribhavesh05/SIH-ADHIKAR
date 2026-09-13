const BUCKET = "project-files";
const SIGNED_URL_TTL_SECONDS = 60 * 10;

// Talks to the Supabase Storage REST API directly with the service-role
// key, bypassing RLS. Used only from server actions/routes that have
// already checked the caller's project scope — never sent to the browser.
//
// Deliberately NOT using @supabase/supabase-js's createClient here: its
// constructor eagerly builds a RealtimeClient, which requires a global
// WebSocket constructor and throws on Node <22 even though this module
// never touches realtime — see supabase/supabase-js#45715 (Node 20 is
// what this app currently runs on).
function storageUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1${path}`;
}

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const key = process.env.SUPABASE_SECRET_KEY!;
  return {
    Authorization: `Bearer ${key}`,
    apikey: key,
    ...extra,
  };
}

let bucketReady: Promise<void> | null = null;

// The bucket is private — every read goes through a signed URL minted
// after an assertProjectInScope check, mirroring the access control already
// enforced on project mutations.
function ensureBucket(): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      const res = await fetch(storageUrl("/bucket"), { headers: authHeaders() });
      if (!res.ok) throw new Error(`Could not list storage buckets: ${await res.text()}`);
      const buckets: Array<{ name: string }> = await res.json();
      if (!buckets.some((b) => b.name === BUCKET)) {
        const createRes = await fetch(storageUrl("/bucket"), {
          method: "POST",
          headers: authHeaders({ "Content-Type": "application/json" }),
          body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false }),
        });
        if (!createRes.ok) throw new Error(`Could not create storage bucket: ${await createRes.text()}`);
      }
    })();
  }
  return bucketReady;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120);
}

/**
 * Uploads a File to the project-files bucket under a path namespaced by
 * project + record kind, and returns the storage object path to persist
 * in the DB (e.g. as `noticeBoardProofUrl`). Returns null if no file was
 * actually chosen.
 */
export async function uploadProjectFile(
  projectId: string,
  kind: string,
  file: File | null
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  await ensureBucket();
  const path = `${projectId}/${kind}/${Date.now()}-${sanitizeFilename(file.name)}`;

  const res = await fetch(storageUrl(`/object/${BUCKET}/${path}`), {
    method: "POST",
    headers: authHeaders({ "Content-Type": file.type || "application/octet-stream" }),
    body: await file.arrayBuffer(),
  });
  if (!res.ok) throw new Error(`File upload failed: ${await res.text()}`);

  return path;
}

/** Mints a short-lived signed URL for a stored object path. */
export async function getSignedFileUrl(path: string): Promise<string> {
  await ensureBucket();
  const res = await fetch(storageUrl(`/object/sign/${BUCKET}/${path}`), {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ expiresIn: SIGNED_URL_TTL_SECONDS }),
  });
  if (!res.ok) throw new Error(`Could not create signed URL: ${await res.text()}`);
  const { signedURL } = await res.json();
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1${signedURL}`;
}
