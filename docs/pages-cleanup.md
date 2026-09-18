# Аудит страниц и неиспользуемых частей panel

Обновлено: 18.09.2026 — выполнена очистка (см. разделы с пометкой ✅ удалено).

Маршруты в Next.js App Router создают **только файлы `page.tsx`** — остальные файлы рядом с ними (`panel-page.tsx` и т.п.) это обычные компоненты.

---

## 1. Активные маршруты (НЕ удалять)

| Маршрут | Файл | Комментарий |
|---|---|---|
| `/` | `app/(panel)/page.tsx` | Главная, рендерит `AdminDashboard` |
| `/login` | `app/login/page.tsx` | Используется `AuthProvider` и главной страницей |
| `/orders` | `app/(panel)/orders/page.tsx` | Реэкспорт из `panel-page.tsx` — **сам `panel-page.tsx` НЕ удалять**, несмотря на имя |
| `/categories` | `app/(panel)/categories/page.tsx` | Сайдбар «Товары» |
| `/categories/[categoryId]` | `.../[categoryId]/page.tsx` | Из списка категорий |
| `.../subCategory/[subCategoryId]/product/[shopProductId]` | `page.tsx` | Из `categoryId/page.tsx` |
| `/categories/addProduct` | `page.tsx` | Из `components/category/header.tsx` |
| `/categories/excel` | `page.tsx` | Из `components/category/header.tsx` |
| `/partners` | `page.tsx` | Сайдбар |
| `/partners/[id]` | `page.tsx` | Из списка партнеров |
| `/partners/[id]/categories/[categoryId]` | `page.tsx` | Из карточки партнера |
| `/promotions` | `(sections)/page.tsx` | Redirect на `/promotions/promocodes` |
| `/promotions/promocodes` | `(sections)/promocodes/page.tsx` | **Новая** страница промокодов (таблица + `CreatePromocodeSheet`) |
| `/promotions/push` | `(sections)/push/page.tsx` | Новый флоу (`CreatePushSheet`) |
| `/promotions/banners` | `(sections)/banners/page.tsx` | Новый флоу (`CreateBannerSheet`) |
| `/reports` | `page.tsx` | Redirect на `/reports/couriers` |
| `/reports/couriers`, `/reports/couriers/[id]` | | Сайдбар + табы отчетов |
| `/reports/shops`, `/reports/shops/[id]` | | Табы отчетов |
| `/users` | `page.tsx` | Сайдбар (admin) |
| `/not-found` | `page.tsx` | Конвенция Next.js |

Компоненты маркетинга (`create-promocode-sheet`, `create-push-sheet`, `create-banner-sheet`, `select-*-modal`, `shops-filter-dropdown`, `allowed-users-field`, `toggle-field`) — все используются новыми страницами и сайдбаром.

---

## 2. ✅ Удаленные legacy-маршруты

- ~~`/promotions/create` + `/promotions/create/[shopId]`~~ — старый флоу создания промокода, заменен листом `CreatePromocodeSheet` на `/promotions/promocodes`.
- ~~`/promotions/edit/[id]`~~ — редактирование теперь через тот же `CreatePromocodeSheet` (клик по строке таблицы).
- ~~`/reports/statistics`~~ — мок-страница с захардкоженными цифрами, в табах отчетов отсутствовала.

## 3. ⚠️ Требует решения (не удалено)

### `/profile` — страница-сирота
- `app/(panel)/profile/page.tsx` + `components/profile/` (profile-page-content, profile-info, password-form)

Ни сайдбар, ни хедер, ни один компонент не ссылается на `/profile`. Либо удалить, либо вернуть в UI (кнопка в сайдбаре/меню профиля).

## 4. ✅ Удаленные неиспользуемые файлы

| Файл | Причина |
|---|---|
| `components/orders/orders-board.tsx` | Старая доска заказов, заменена `panel-page.tsx` |
| `components/hooks/useOrderSocket.ts` | Использовался только `orders-board.tsx` |
| `components/hooks/useCourier.ts` | Заменен на `useCouriers` / `useCourierDetail` |
| `components/hooks/useOrderFilters.ts` | Не импортировался |
| `components/hooks/usePayouts.ts` | Не импортировался |
| `components/examples/` (tabs-example.tsx) | Демо-файл |
| `components/helpers/date-range.ts` | Не импортировался |
| `components/icons/FooterLogoMark.tsx` | Не импортировался |
| `components/icons/KeyIcon.tsx` | Не импортировался |
| `components/orders/pending-order-detail-modal.tsx` | Экспортировался только из неиспользуемого barrel |
| `components/orders/v2-order-detail-modal.tsx` | То же |
| `components/orders/index.ts` | Barrel никто не импортировал (`@/components/orders`) |
| `components/layout/page-header.tsx` | `PageHeader`/`Breadcrumb` нигде не использовались; экспорт убран из `components/layout/index.ts` |
| `components/ui/badge.tsx` | Не использовался; экспорт убран из `components/ui/index.ts` |
| `components/ui/date-time-picker.tsx` | Не использовался |
| `lib/jwt.ts` | Не использовался; из `lib/utils.ts` удален мертвый импорт `parseJwt` (middleware декодирует токен сам) |
| `types/headerProps.types.ts` | Не импортировался |
| `types/courier.js`, `types/courier.js.map` | Артефакты компиляции (используется `types/courier.ts`) |

Проверка после удаления: `tsc --noEmit` — OK, `eslint` — OK.

## 5. Зависимости, которые важно не потерять

- `app/(panel)/orders/panel-page.tsx` — реальная реализация `/orders` (реэкспортируется в `page.tsx`).
- `lib/promocode-allowed-users.ts` — используется новым `create-promocode-sheet.tsx`.
- `types/courier.ts`, `courier.d.ts` — используются `useCouriers`/`useCourierDetail`.
- `docs/panel-orders-integration.md` — опционально к архивации: описание уже выполненной интеграции `panel-page.tsx`.

## 6. Ложные срабатывания (выглядят подозрительно, но нужны)

| Файл | Почему нужен |
|---|---|
| `app/(panel)/orders/panel-page.tsx` | Реальная реализация страницы `/orders` (`page.tsx` её реэкспортирует) |
| `components/promotions/*` (sheets, modals) | Используются новыми страницами маркетинга |
| `hooks/use-view-mode.ts` | Используется страницами категорий |
| `components/helpers/date-form.ts`, `date-picker.ts` | Используются курьерами/отчетами |
| `components/layout/app-shell.tsx`, `main-section.tsx` | Используются layout'ами через `components/layout/index.ts` |
| `components/ui/shops.dropdown.tsx` | Используется сайдбаром |
