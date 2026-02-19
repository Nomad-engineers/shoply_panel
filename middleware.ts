  import { NextResponse } from 'next/server'
  import type { NextRequest } from 'next/server'

  export const ROLES = {
    ADMIN: 'admin',
    SHOP_OWNER: 'Shop Owner',
  } as const;

  const FORBIDDEN_FOR_SHOP = [
    '/shops',
    '/reports/shops',
    '/reports/couriers',
    '/users',
    '/promotions'
  ];

  export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (
      pathname.startsWith('/_next') || 
      pathname.startsWith('/static') || 
      pathname.includes('.') || 
      pathname === '/favicon.ico'
    ) {
      return NextResponse.next();
    }

    const authToken = request.cookies.get('auth_token')?.value;
    const userRole = request.cookies.get('user_role')?.value;
    const shopId = request.cookies.get('user_shop_id')?.value;

    if (!authToken) {
      if (pathname === '/login') return NextResponse.next();
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname === '/login') {
      return NextResponse.redirect(new URL('/categories', request.url));
    }

    if (userRole === ROLES.ADMIN) {
      return NextResponse.next();
    }

    if (userRole === ROLES.SHOP_OWNER) {
      const isForbidden = FORBIDDEN_FOR_SHOP.some(route => 
        pathname === route || pathname.startsWith(`${route}/`)
      );

      if (isForbidden) {
        const redirectUrl ='/categories'
        return NextResponse.redirect(new URL(redirectUrl, request.url));
      }

      if (pathname.startsWith('/reports/shops/')) {
        const urlSegments = pathname.split('/');
        const urlShopId = urlSegments[3];

        if (urlShopId && shopId && urlShopId !== shopId) {
          return NextResponse.redirect(new URL(`/reports/shops/${shopId}`, request.url));
        }
      }
    }

    return NextResponse.next();
  }

  export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  };