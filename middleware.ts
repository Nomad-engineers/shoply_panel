import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const ROLES = {
  ADMIN: "admin",
  SHOP_OWNER: "shop_owner",
  OPERATOR: "operator",
} as const;

const FORBIDDEN_FOR_SHOP = [
  "/shops",
  "/reports/shops",
  "/reports/couriers",
  "/users",
];

function getRoleFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.role || decodedPayload.userRole || null;
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get("auth_token")?.value;
  const shopId = request.cookies.get("current_shop_id")?.value;
  const cookieRole = request.cookies.get("user_role")?.value;

  if (!authToken) {
    if (pathname === "/login") return NextResponse.next();
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const userRole = cookieRole || getRoleFromToken(authToken);

  if (!userRole && pathname !== "/login") {
    return NextResponse.next();
  }

  if (pathname === "/login") {
    if (!userRole) {
      return NextResponse.next();
    }

    return NextResponse.redirect(
      new URL(
        userRole === ROLES.ADMIN ? "/reports/couriers" : "/categories",
        request.url
      )
    );
  }

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(
        userRole === ROLES.ADMIN ? "/reports/couriers" : "/categories",
        request.url
      )
    );
  }

  if (userRole === ROLES.ADMIN) {
    return NextResponse.next();
  }

  if (userRole === ROLES.SHOP_OWNER || userRole === ROLES.OPERATOR) {
    const isForbidden = FORBIDDEN_FOR_SHOP.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (isForbidden) {
      return NextResponse.redirect(new URL("/categories", request.url));
    }

    if (pathname.startsWith("/reports/shops/")) {
      const urlSegments = pathname.split("/");
      const urlShopId = urlSegments[3];

      if (urlShopId && shopId && urlShopId !== shopId) {
        return NextResponse.redirect(
          new URL(`/reports/shops/${shopId}`, request.url)
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
