import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getSession() decodes the session from the request cookie locally and
  // only calls the network if the access token needs refreshing — unlike
  // auth.getUser(), which always makes a round trip to Supabase's Auth
  // server to revalidate. That round trip, run on every single navigation,
  // measured at 100-1200ms and was the single largest contributor to this
  // app's per-click latency.
  //
  // This is a deliberate, safe trade: middleware is only a fast UX
  // redirect (logged-out users never see a protected shell render), not
  // the authorization boundary. The real boundary is getCurrentUser() in
  // src/lib/auth.ts, which every protected layout/page and every mutating
  // server action calls — and that function always does the full,
  // network-revalidated auth.getUser() check via Supabase. A request with
  // a stale/tampered session cookie would pass this soft gate but still
  // be rejected the moment it reaches real data access.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login");
  const isPublicRoute =
    request.nextUrl.pathname === "/" ||
    isAuthRoute ||
    request.nextUrl.pathname.startsWith("/api/public-status");

  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
