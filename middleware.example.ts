import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js Middleware для проверки аутентификации и роли пользователя
 * 
 * Этот файл запускается на Edge Runtime перед каждым запросом к защищенным маршрутам.
 * Используйте его для:
 * - Проверки аутентификации
 * - Контроля доступа на основе ролей (admin, shop_owner и т.д.)
 * - Редиректов неавторизованных пользователей
 */

export function middleware(request: NextRequest) {
    // Получаем токен аутентификации из cookies
    const authToken = request.cookies.get('auth_token')?.value
    const userRole = request.cookies.get('user_role')?.value

    const path = request.nextUrl.pathname

    // Если пользователь не авторизован, редирект на страницу входа
    if (!authToken) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // ============================================
    // КОНТРОЛЬ ДОСТУПА НА ОСНОВЕ РОЛЕЙ
    // ============================================

    // Маршруты только для администраторов
    const adminOnlyRoutes = [
        '/users',           // Управление пользователями
        '/reports/couriers', // Отчеты по курьерам
        '/promotions'       // Управление промокодами
    ]

    // Проверяем, является ли текущий путь админским
    const isAdminRoute = adminOnlyRoutes.some(route => path.startsWith(route))

    if (isAdminRoute && userRole !== 'admin') {
        // Если пользователь не админ, но пытается зайти на админский маршрут
        return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // Маршруты для владельцев магазинов
    if (path.startsWith('/shops')) {
        if (userRole === 'shop_owner') {
            // Владельцы магазинов могут видеть только свой магазин
            // Здесь можно добавить дополнительную логику для проверки ID магазина
            // Например, проверить, что shopId в URL совпадает с shopId пользователя

            const shopId = request.cookies.get('user_shop_id')?.value
            const urlShopId = path.split('/')[2] // /shops/[id]

            if (urlShopId && urlShopId !== shopId && urlShopId !== 'undefined') {
                // Если владелец магазина пытается посмотреть чужой магазин
                return NextResponse.redirect(new URL(`/shops/${shopId}`, request.url))
            }
        }
        // Админы могут видеть все магазины
    }

    // Маршруты заказов
    if (path.startsWith('/orders')) {
        if (userRole === 'shop_owner') {
            // Владельцы магазинов видят только заказы своего магазина
            // Можно добавить query параметр для фильтрации
            const url = request.nextUrl.clone()
            const shopId = request.cookies.get('user_shop_id')?.value

            if (shopId && !url.searchParams.has('shopId')) {
                url.searchParams.set('shopId', shopId)
                return NextResponse.redirect(url)
            }
        }
        // Админы видят все заказы
    }

    // Если все проверки пройдены, разрешаем доступ
    return NextResponse.next()
}

/**
 * Конфигурация middleware
 * 
 * matcher - определяет, на каких маршрутах будет запускаться middleware
 * Используйте glob-паттерны для указания путей
 */
export const config = {
    matcher: [
        /*
         * Применяем middleware ко всем маршрутам, кроме:
         * - /login (страница входа)
         * - /api/auth/* (API аутентификации)
         * - /_next/* (внутренние файлы Next.js)
         * - /static/* (статические файлы)
         * - /*.ico, /*.png и т.д. (файлы изображений)
         */
        '/((?!login|api/auth|_next|static|.*\\..*|favicon.ico).*)',
    ],
}

/**
 * ПРИМЕЧАНИЯ ПО ИНТЕГРАЦИИ:
 * 
 * 1. Замените 'auth_token' и 'user_role' на реальные имена ваших cookies
 * 2. Добавьте логику для получения роли из вашей системы аутентификации
 * 3. Настройте маршруты в соответствии с вашими требованиями
 * 4. Создайте страницу /unauthorized для отображения ошибки доступа
 * 
 * ВАЖНО:
 * - Middleware работает на Edge Runtime (не имеет доступа к Node.js API)
 * - Для сложной логики используйте API routes
 * - Держите middleware легковесным для быстрой работы
 */
