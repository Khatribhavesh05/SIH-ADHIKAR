/** Display name derived from a stored path's `<timestamp>-<original name>` suffix. Safe for client components. */
export function fileDisplayName(path: string): string {
  const segment = path.split("/").pop() ?? path;
  return segment.replace(/^\d+-/, "");
}
