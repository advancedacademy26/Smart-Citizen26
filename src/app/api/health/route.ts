// This exhibition passport app is a fully client-side PWA — visitor data,
// stamps, and certificates are all stored in the browser's localStorage.
// No database is required to run or deploy this app. This handler has no
// dynamic/request-dependent behaviour, so it is explicitly marked static —
// this keeps it compatible both as a normal server route (used by this
// sandbox's health check) and as a static export (used for GitHub Pages).
export const dynamic = "force-static";

export async function GET() {
  return Response.json({ ok: true });
}
