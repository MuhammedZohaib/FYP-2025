import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateToken } from "./lib/actions";

export async function middleware(request: NextRequest) {
  const valid = await validateToken();
  if (!valid) return NextResponse.redirect(new URL("/auth/login", request.url));
}

export const config = {
  matcher: "/dashboard/:path*",
};
