import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isAuth = !!req.auth;
  // Note: in Route Groups (builder), the URL path doesn't include the group name.
  // The path will be /dashboard or /app/...
  const isBuilderRoute = req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/app/");
  const isLoginRoute = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register";

  if (isBuilderRoute && !isAuth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoginRoute && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

// Run middleware on all routes except static files and APIs
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
