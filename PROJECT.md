# Shoply Panel

_веб-панель операционного управления доставкой Shoply: заказы, партнёры, каталог, акции, пользователи, отчёты._

> **Back-office** для управления e-commerce операциями доставки. Дашборд для админов, операторов регионов, владельцев и сотрудников магазинов. Russian-first UI.

**Shoply Panel** — серверный рендеринг-фронтенд (Next.js App Router) поверх NestJS-бэкенда. Не PWA и не клиентское приложение — это защищённая роут-мидлвэром админ-панель с ролевой моделью, реалтайм-обновлениями заказов через Centrifugo и токен-аутентификацией (access + refresh).

Панель — один из четырёх клиентов экосистемы Shoply: бэкенд, мобильное приложение, веб-вью для магазинов/доставки и эта админ-панель.

---

## 1. Цели и принципы

### Цели
- **Операционный back-office** — быстрый, плотный, data-dense дашборд для ежедневной работы операторов и админов.
- **Ролевая модель** — разный UI и доступ для `admin`, `operator`, `shop_owner`, `shop_employee`. Маршруты и сайдбар зависят от роли.
- **Реалтайм заказы** — канбан-доска активных заказов, обновляется через WebSocket (Centrifugo) без перезагрузки.
- **Russian-first** — весь интерфейс на русском, валюта — ₸/₽, таймзона Asia/Almaty.
- **Единый визуальный язык** со всеми клиентами Shoply: мягкий серый фон, белые скруглённые панели, зелёный акцент.

### Не-цели
- Мобильное приложение — для этого есть `shoply_mobile` (Flutter).
- Витрина магазина / клиентская часть — для этого есть `shoply/web-view`.
- SSR-кэширование контента — панель персональная, Behind-Auth, кешировать публично нечего.
- Тёмная тема (пока не запрошена).
- Офлайн-режим — необходима постоянная связь с бэкендом.

### Принципы разработки
- **Русский в UI, английский в коде** — названия классов, функций, типов на английском; пользовательский текст на русском.
- **Сначала схема API/типы** — при работе с бэкендом сначала фиксируем типы в `types/`, потом UI.
- **Маленькие коммиты**, понятные сообщения (Conventional Commits, см. ниже).
- **Чистая типизация** — TypeScript, избегать `any` без причины.
- **Реалтайм через Centrifugo**, а не поллинг — кроме случаев, где WS избыточен (справочники, разовые формы).

---

## 2. Экосистема Shoply

Панель — часть более крупной системы. Координация между проектами — на уровне API бэкенда и общих доменных моделей.

| Проект | Путь | Назначение | Стек |
|---|---|---|---|
| **Backend** | `~/Code/shoply/backend` | NestJS API, источник истины: домен, бизнес-логика, БД. | NestJS, TypeORM, PostgreSQL, Redis |
| **Panel** (этот) | `~/Code/shoply/panel` | Админ/операторский back-office. | Next.js 15, React 18, TS, Tailwind |
| **Mobile** | `~/Code/shoply_mobile` | Клиентское приложение покупателей + панель курьера. | Flutter, BLoC, Clean Architecture |
| **Web View** | `~/Code/shoply/web-view` | Монорепо веб-приложений: `@shoply/shop` (витрина) и `@shoply/delivery` (панель курьера, веб). | pnpm workspace |

### Контракты между проектами
- **API** — panel ходит в `NEXT_PUBLIC_API_URL` (NestJS). Все эндпоинты, роли (`admin`, `operator`, `shop_owner`, `shop_employee`, `delivery_man`, `user`), статусы заказов и пр. определяет бэкенд.
- **Ассеты/медиа** — через Directus (`NEXT_PUBLIC_DIRECTUS_URL`).
- **Реалтайм** — Centrifugo (`NEXT_PUBLIC_CENTRIFUGO_URL`, WSS), общая шина для panel и других клиентов.
- **Аутентификация** — JWT (`access_token` + `refresh_token`), выдаёт бэкенд `/auth/login`, `/auth/refresh`. Роль — claim в токене.
- **Типы** — доменные типы (заказы, пользователи, промокоды и т.д.) описаны в `types/` этого проекта по образцам ответов бэкенда. Единый shared-пакет типов пока не выделен.

> При изменении контракта на бэкенде — обновлять типы здесь и фиксировать в коммите.

---

## 3. Стек технологий

| Слой | Выбор | Почему |
|---|---|---|
| Фреймворк | **Next.js 15** (App Router) | Защищённая панель: SSR/SSG отключены по сути, но нужен middleware-роутинг и server-side redirect по ролям из cookies. |
| Язык | **TypeScript 5** | Типобезопасность над динамическим API бэкенда. |
| UI | **React 18** | Стабильная экосистема, Server Components не используются активно — панель клиентская. |
| Стили | **Tailwind CSS 4** | Утилитарно, быстро, единый дизайн-язык. |
| UI-примитивы | **Radix UI** + shadcn-стиль | Доступные headless-компоненты (Dialog, Dropdown, Tabs, Switch, Avatar…). |
| Иконки | **lucide-react** | Лёгкие, консистентные. |
| Дата-фечинг | **SWR** | Кеш, ревалидация, дедуп, интегрирован с `fetchWithSession` (refresh на 401). |
| Формы | **react-hook-form + zod** | Производительные формы + схема-валидация. |
| Реалтайм | **Centrifugo** (`centrifuge` JS) | WS-канал для живой доски заказов. |
| Тосты | **sonner** | Уведомления (`top-right`, richColors). |
| Прочее | **react-datepicker**, **react-dropzone**, **xlsx** | Поля дат, загрузка файлов, экспорт в Excel. |
| Линт/формат | **ESLint 9** (flat config) | Стандарт Next.js + TS-парсер. |
| Пакетный менеджер | **pnpm 10.25** | Быстрый, детерминированный. |

> Решения в таблице — **как есть**. Меняем — фиксируем причину в разделе 8.

---

## 4. Архитектура

### Поток данных

```
┌────────────────┐    ┌──────────────────────┐    ┌──────────────────────────────┐
│  React (Client)│ ─▶ │  AuthProvider        │ ─▶ │  NestJS Backend (API)        │
│  pages/components│   │  fetchWithSession +  │    │  /v2/profile, /orders, …     │
└────────────────┘    │  SWR fetcher         │    └──────────────────────────────┘
       ▲              └──────────┬───────────┘                  ▲
       │ realtime                │ 401 → refresh                  │
       │ order/board             ▼                                │
       │              ┌──────────────────────┐                    │
       │              │  token storage       │                    │
       │              │  localStorage +      │                    │
       │              │  cookies (role,shop) │                    │
       │              └──────────────────────┘                    │
       │                                                          │
┌──────┴───────────┐    ┌──────────────────────┐
│  Centrifugo WSS  │ ◀─ │  backend publishes   │
│  /connection/ws  │    │  order/user events   │
└──────────────────┘    └──────────────────────┘
```

- **Источник истины — бэкенд**. Панель — тонкий клиент: данные не кешируются локально персистентно, только в SWR-кеше в памяти.
- **Auth** — `AuthProvider` оборачивает приложение и `SWRConfig`: каждый запрос идёт через `fetchWithSession`, который на 401 молча обновляет access-токен через `/auth/refresh` и ретраит (1 раз). Одновременные refresh-запросы дедупятся через ref на promise.
- **Роутинг по ролям** — `middleware.ts` читает `auth_token`, `user_role`, `current_shop_id` из cookies и решает доступ к маршруту ещё до рендера (см. раздел 5).
- **Реалтайм** — отдельные компоненты подписываются на каналы Centrifugo (например, доска заказов); остальное тянется SWR-фечами с ревалидацией.

### Ролевая модель

| Роль | Что видит | Дефолтный маршрут |
|---|---|---|
| `admin` | Заказы, Пользователи, Партнёры, Акции и промокоды, Отчёты | `/reports/couriers` (или `/orders`) |
| `operator` | Оператор региона — ограниченный набор админских функций | `/categories` |
| `shop_owner` | Каталог своего магазина (`/categories`), товары, акции. Запрещено: `/shops`, `/reports/*`, `/users`. | `/categories` |
| `shop_employee` | То же, что у владельца магазина. | `/categories` |

> Запрещённые маршруты для shop-ролей: `/shops`, `/reports/shops`, `/reports/couriers`, `/users` — см. `FORBIDDEN_FOR_SHOP` в `middleware.ts`.

### Структура проекта

```
panel/
├─ app/                       # Next.js App Router
│  ├─ layout.tsx              # корневой layout: шрифты, AuthProvider, Toaster
│  ├─ page.tsx                # роут-демаркация: login или OrdersBoard
│  ├─ login/
│  ├─ orders/                 # доска заказов (админ)
│  ├─ partners/               # магазины / рестораны / сервисы
│  ├─ categories/             # каталог магазина (shop_owner/employee)
│  ├─ promotions/             # промокоды: list / create / edit
│  ├─ users/                  # управление пользователями (админ)
│  ├─ reports/                # отчёты (couriers, shops, …)
│  ├─ profile/
│  └─ not-found/
├─ components/
│  ├─ providers/              # AuthProvider (контекст сессии + SWRConfig)
│  ├─ layout/                 # sidebar, header, login-form
│  ├─ orders/                 # доска заказов, карточки
│  ├─ category/               # UI каталога
│  ├─ promotions/             # UI промокодов
│  ├─ couriers/, profile/, helpers/, hooks/, icons/
│  └─ ui/                     # shadcn-стиль примитивы (Button, Input, Spinner…)
├─ lib/
│  ├─ jwt.ts                  # парсинг JWT (payload: id, role, shops, isAdmin)
│  ├─ theme.ts
│  ├─ utils.ts                # authStorage, cn(), вспомогательное
│  └─ promocode-allowed-users.ts
├─ types/                     # доменные типы по образцам ответов API
│  ├─ auth.ts, admin-user.ts, admin-order.ts, shop.ts,
│  ├─ promocode.ts, category.types.ts, courier*.ts, api.types.ts, …
├─ hooks/
├─ middleware.ts              # edge-роутинг по ролям и cookie
├─ public/
├─ cloud-design-reference.md  # дизайн-референс панели
├─ color-scheme.json          # токены цветов
├─ PROJECT.md                 # этот файл
└─ …конфиги (next, eslint, tsconfig, postcss, tailwind v4)
```

---

## 5. Аутентификация и авторизация

### Токены
- **JWT-пара**: `access_token` (короткоживущий) + `refresh_token` (долгоживущий), оба в `localStorage` через `authStorage`.
- **Логин** — `POST /auth/login` (по email) или `POST /auth/login-by-id` (по числовому ID пользователя). Выбор эндпоинта зависит от того, содержит ли `identifier` символ `@`.
- **Refresh** — `POST /auth/refresh` с `{ refreshToken }`. На 400/401/403 → автоматический `logout()` (чистим storage, cookies, редирект на `/login`).
- **Дедуп refresh** — одновременные запросы, поймавшие 401, ждут один общий promise (`refreshPromise.current`), чтобы не запускать несколько refresh-циклов.
- **Профиль** — `GET /v2/profile` возвращает `{ id, firstName, …, role, businesses: [{ id, name, type, photoId }] }`. Кешируется в `localStorage` (`auth_profile_cache_v1`) для мгновенного старта, затем асинхронно рефетчится.

### Cookies (для middleware)
- `auth_token` — флаг наличия сессии (middleware не верифицирует подпись, только проверяет наличие; верификацию делает бэкенд).
- `user_role` — роль из токена, ставится после фетча профиля. Используется middleware для route guard без парсинга токена.
- `current_shop_id` — выбранный магазин для shop-ролей (владелец может переключаться между своими бизнесами).

### Route guard (`middleware.ts`)
1. Рендер маршрутов Next (`/_next`, статики) — пропускаем.
2. Нет `auth_token` → редирект на `/login` (кроме самого `/login`).
3. `/login` + уже авторизован → редирект на дефолтный маршрут по роли.
4. `/` → редирект по роли: `admin` → `/reports/couriers`, прочие → `/categories`.
5. `admin` — всё разрешено.
6. `shop_owner` / `operator` / `shop_employee` — редирект с запрещённых маршрутов на `/categories`; проверка, что в URL `/reports/shops/:id` совпадает с `current_shop_id`.

### Выход
- `logout()` — очищает `localStorage` (`access_token`, `refresh_token`, кеш профиля), снимает cookies (`user_role`, `current_shop_id`), сбрасывает состояние, `router.push('/login')`.

---

## 6. Дизайн-направление

Подробно — в `cloud-design-reference.md`. Кратко:

- **Эстетика**: светлый back-office. Мягкий серый фон `#EFEFF4`, белые панели со скруглением `24px`, мягкие тени.
- **Акцент**: **зелёный** (`#55CB00` / `#67C63C`). Вторичный — бирюзовый `#04DCB4`, тёмный `#0A1428`, blue-link `#478EFF`.
- **Типографика**: **Inter** (основной) + **JetBrains Mono** (моно).
- **Радиусы**: small `4`, medium `8`, large `12`, xl `16`, панели `18–24`, pills `9999`.
- **Компоненты**: плотные таблицы с hover `#FAFAFE`, канбан-доска заказов с горизонтальным скроллом, summary-карточки, pill/underline-табы.
- **Статусы через цвет текста**, а не тяжёлые бейджи: open — зелёный, closed/error — красно-оранжевый, draft — жёлтый, archived — синий.
- **Десктоп-first**. Сайдбар коллапсируется (`240px` ↔ `88px`). Внутренний скролл контента.

---

## 7. Как вести разработку

### Перед стартом сессии
1. Прочитать статус в трекере/`ROADMAP` (если есть).
2. Если меняется контракт с бэкендом — сначала свериться с `~/Code/shoply/backend` (типы, эндпоинты, роли).

### Процесс
1. **Ветка** под задачу: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`, `docs/<slug>`.
2. **Коммиты — Conventional Commits** со scope по фиче:
   - `feat(orders): realtime updates via centrifugo`
   - `fix(auth): dedup concurrent refresh requests`
   - `chore(deps): bump next to 15.4`
   - `docs: add PROJECT.md`
3. **Перед коммитом**: `pnpm lint`. (Тестов пока нет — `package.json` не содержит `test`-скрипта.)
4. **Ролевые изменения** — проверять, что новый маршрут добавлен в guard `middleware.ts` и в навигацию сайдбара для нужных ролей.

### Соглашения по коду
- TypeScript, без `any` без обоснования.
- Импорты — абсолютные (`@/components/…`, `@/lib/…`, `@/types/…`).
- Компоненты — функциональные, хуки — с префиксом `use`.
- Русский — только в пользовательских строках (заголовки, лейблы, тосты). Код/типы — английский.
- Никаких комментариев-«объяснялок» — только для нетривиальных решений.

### Запуск
```bash
pnpm install
pnpm dev          # локальная разработка (next dev)
pnpm build        # production-сборка
pnpm start        # запуск production-сборки
pnpm lint
```

### Переменные окружения (`.env.local`)
- `NEXT_PUBLIC_API_URL` — NestJS API (по умолчанию `https://dev.api.shoply.kz`, локально `http://localhost:3060`).
- `NEXT_PUBLIC_DIRECTUS_URL` — Directus (медиа).
- `NEXT_PUBLIC_CENTRIFUGO_URL` — WSS-эндпоинт Centrifugo.

---

## 8. Журнал решений (ADR-lite)

| Дата | Решение | Контекст / альтернативы |
|---|---|---|
| 2026-02 | **Next.js App Router** вместо Vite SPA | Нужен edge-middleware для route guard по cookies/ролям до рендера; SSR даёт удобный server-side redirect. Vite + собственный роут-гвард — больше бойлерплейта. |
| 2026-02 | **Tailwind v4** + Radix (shadcn-стиль) | Соответствует дизайн-референсу (`cloud-design-reference.md`), быстро, доступно. Готовые UI-киты (MUI/AntD) — чужая эстетика, сложно подогнать под зелёный минимализм. |
| 2026-02 | **SWR** вместо React Query | Меньше boilerplate, `mutate`-фокус; для тонкого клиента поверх REST-бэкенда достаточно. React Query — мощнее, но оверкилл. |
| 2026-02 | **Токены в localStorage**, не в httpOnly-cookie | Исторически сложилось; middleware не верифицирует подпись JWT, а только наличие `auth_token`. Альтернатива (httpOnly-cookie + серверная сессия) — требует доработки бэкенда, отложено. |
| 2026-02 | **Роль в cookie** (`user_role`) дублирует JWT claim | Middleware работает на edge и не имеет ключей для верификации JWT → роль ставится в cookie после фетча профиля для быстрого route guard. Это компромисс: бэкенд всё равно авторизует каждый запрос. |
| 2026-02 | **Centrifugo** для реалтайма доски заказов | Уже используется в экосистеме (моб. приложение, web-view). Поллинг — нагрузка на бэкенд и задержки. |
| 2026-02 | **react-hook-form + zod** для форм | Согласованность валидации клиента с контрактами; performant. Formik — медленнее, `zod` покрывает и форму, и API-схемы. |
| 2026-08-10 | Документирование проекта в **PROJECT.md** | По образцу `~/Code/todo-app/PROJECT.md`; зафиксировать экосистему, роли, стек и ADR для онбординга. |

---

## 9. Ресурсы и референсы

- **Дизайн-референс панели** — `cloud-design-reference.md` (локально).
- **Цветовые токены** — `color-scheme.json` (локально).
- **Next.js docs** — https://nextjs.org/docs
- **Radix UI** — https://www.radix-ui.com/primitives
- **SWR** — https://swr.vercel.app/
- **Centrifugo** — https://centrifugal.dev/
- **react-hook-form** — https://react-hook-form.com/
- **zod** — https://zod.dev/
- **Соседние проекты**: `~/Code/shoply/backend` (API), `~/Code/shoply_mobile` (Flutter), `~/Code/shoply/web-view` (витрина + веб-курьер).
