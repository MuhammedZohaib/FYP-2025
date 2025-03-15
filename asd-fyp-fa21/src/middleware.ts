"use server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const _cookies = await cookies();
  if (!_cookies.get("access_token"))
    return NextResponse.redirect(new URL("/auth/login", request.url));
}

export const config = {
  matcher: "/dashboard/:path*",
};
