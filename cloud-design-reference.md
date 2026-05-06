# Shoply Panel — Cloud Design Reference

Use this file as a reference prompt/context for recreating the current Shoply Panel admin interface in Cloud Design.

## Product context

Shoply Panel is a Russian-language admin dashboard for managing delivery commerce operations: orders, partners/shops, products/categories, promotions/promocodes, users, and reports.

The interface should feel like a modern operational back-office: clean, spacious, rounded, light, data-dense where needed, but still soft and approachable.

Primary users:

- Shoply administrators managing all shops, users, partners, reports, orders, and promotions.
- Shop owners/managers managing their own catalog, products, and promotions.

Primary language: Russian.

## Visual identity

Overall style:

- Light dashboard UI.
- Soft grey app background with white rounded panels.
- Large rounded containers, usually `24px` radius.
- Cards and tables use subtle borders and soft shadows.
- Main accent is bright green.
- Secondary accent colors are used sparingly for statuses and links.
- Typography is compact, clean, and admin-oriented.

Fonts:

- Primary: Inter.
- Monospace/accent: JetBrains Mono if needed.

Color palette:

```text
App background:        #EFEFF4
Surface / panel:       #FFFFFF
Light surface:         #F5F5F8
Lighter surface:       #FAFAFC
Primary text:          #17171C / #111322
Secondary text:        #7F7F8A
Disabled text:         #9696A0
Primary green:         #67C63C / #55CB00
Highlight turquoise:   #04DCB4
Dark secondary:        #0A1428
Warning:               #F59E0B
Error:                 #DC2626 / #E26D5C / #F26A4B
Blue link/accent:      #478EFF
Border light:          #E2E2EA / #ECECF3
Border medium:         #B4B4BE
```

Spacing scale:

```text
4px, 8px, 16px, 24px, 32px, 48px, 64px
```

Radius scale:

```text
Small: 4px
Medium: 8px
Large: 12px
XL: 16px
Dashboard panels: 18px–24px
Pills: 9999px
```

Shadow style:

```text
Small cards: 0 6px 18px rgba(17, 19, 34, 0.04)
Panels:      0 16px 50px rgba(17, 19, 34, 0.05)
Large:       0 20px 60px rgba(15, 23, 42, 0.06)
```

## Global app layout

The application uses a full-height dashboard shell:

- Outer app container fills the screen.
- Background is `#EFEFF4`.
- Padding around the whole app: about `16px`.
- Main layout is horizontal: left sidebar + right main content.
- Gap between sidebar and main content: about `16px`.

### Sidebar

Sidebar behavior:

- White surface.
- Full height.
- Rounded `24px`.
- Width expanded: about `240px`.
- Collapsed width: about `88px`.
- Smooth width transition.
- Contains shop switcher for shop-owner users.
- Contains navigation items.
- User profile and logout button are pinned to the bottom.

Sidebar navigation items:

Admin area:

- Заказы
- Пользователи
- Партнеры
- Акции и промокоды
- Отчеты

Shop-owner area:

- Товары
- Акции и промокоды

Navigation item style:

- Rounded `12px`.
- Padding around `18px 12px`.
- Icon + label.
- Font size `14px`, semibold.
- Active item has light grey background `#EEEEF4` and primary text.
- Active icon can become green.
- Hover background is very light grey `#F7F7FA`.
- Disabled items are muted and partially transparent.

Logout button:

- Bottom of sidebar.
- Warm pale orange background `#FFD9B8`.
- Dark text `#0E0F27`.
- Rounded `12px`.

### Main area

Main content behavior:

- White or near-white surface.
- Rounded `24px`.
- Full height.
- Header height about `72px`.
- Header uses horizontal layout: page title + tabs/actions.
- Content area scrolls internally.

Common page title:

- Font size about `28px`.
- Bold.
- Tight letter spacing around `-0.03em`.
- Color `#111322`.

## Core screens to recreate

### 1. Login screen

Purpose: authenticate admin/shop owner.

Layout:

- Same dashboard shell can be used, but sidebar hidden.
- Header title: `Вход` in green.
- Centered login card.
- Card width about `max-w-md`.
- White background.
- Rounded `16px–24px`.
- Soft shadow.
- Padding around `40px`.
- Top margin around `64px`.

### 2. Orders board / Заказы

This is the main operational screen.

Header:

- Title: `Заказы`.
- Horizontal pill tabs:
  - `Активные заказы` active.
  - `История заказов` disabled.
  - `Промо компании` disabled.
- Active tab is green pill `#55CB00`, white text, subtle green shadow.
- Disabled tabs are dark text with reduced opacity.

Content panel:

- Large white rounded panel.
- Border `#ECECF3`.
- Radius `24px`.
- Soft shadow.
- Padding about `16px`.

Summary cards row:

- Small white cards.
- Width about `156px`.
- Rounded `18px`.
- Border `#ECECF3`.
- Icon + label in muted grey.
- Value in darker text.
- Examples:
  - Активные
  - Новые
  - В работе
  - Собраны
  - Доставка
  - Завершение
  - Отмены

Board layout:

- Horizontal scroll kanban board.
- Columns have min width about `230px`.
- Column container background `#F2F2F8`.
- Column radius `18px`.
- Inner area background `#F7F7FB`.
- Column header has title and dark count badge.

Columns:

- Новые заказы
- В работе
- Собраны
- На доставке
- Завершение
- Возврат

Order card:

- White card.
- Border `#E9E9F1`.
- Radius `16px`.
- Padding `16px 12px`.
- Soft shadow.
- Top row: `№ {id}` bold + status label.
- Status is green for active statuses, red/orange for return.
- Body: shop/customer name, address.
- Bottom: total price large bold, item count muted.

Empty/loading/error states:

- Centered inside rounded light-grey area.
- Text in muted grey.
- Loading uses spinner.

### 3. Partners / Партнеры

Purpose: manage shops/restaurants/services.

Header:

- Title: `Партнеры`.
- Inline category tabs:
  - Магазины
  - Рестораны
  - Сервисы
- Active tab has green underline.
- Each tab has count badge in light grey.

Toolbar:

- Search input with bottom border only.
- Toggle: `Показать архивные`.
- Period dropdown: `День`, `Неделя`, `Месяц`.
- Primary action button: `Создать магазин`.

Table panel:

- White rounded `24px` panel.
- Border and soft shadow.
- Table has separate borders and horizontal row dividers.
- Header text is muted grey.
- Rows hover with `#FAFAFE`.
- Rows are clickable and show right chevron.

Columns:

- ID
- Название
- Кол-во товаров
- Рейтинг
- Статус
- Actions chevron

Partner row details:

- Partner avatar/photo or fallback store icon in circular light grey badge.
- Name in primary text.
- Item count as `N товаров`.
- Rating uses yellow star if available, otherwise em dash.
- Status colors:
  - Open: green.
  - Closed: red/orange.
  - Draft: muted yellow.
  - Archived: blue.

### 4. Promotions / Промокоды

Purpose: list, filter, create, edit promocodes.

Header:

- Title: `Промокоды`.

Toolbar:

- Tabs:
  - `Промокоды`
  - `Архив`
- Active tab has green underline.
- Optional admin filter button: `Фильтр`.
- Search input with bottom border.
- Primary button: `Создать промокод`.
  - Green background.
  - Rounded `16px`.
  - Bold white text.
  - Plus icon.
  - Soft green shadow.
  - Slight active scale feedback.

Filter panel:

- Appears under toolbar.
- Border-bottom divider.
- Shop dropdown with label `Магазин`.
- Dropdown is light grey rounded select.
- Dropdown menu is white, rounded `16px`, border, shadow.
- Includes internal search input and list of shops.
- Selected item is green text on green-tinted background.
- Reset button: `Сбросить` with reset icon.

Promocode table columns:

- ID
- Дата
- Название
- Комментарий
- Выпуск
- Оборот
- Условия
- Содержание
- Активация
- Actions chevron

Promocode row details:

- Promocode name is blue `#478EFF`, bold, clickable-looking.
- Promocode icon also blue.
- Shop issuer shown with small circular avatar or green initial fallback.
- Discount content shown as small light-grey badge.
- Row hover is `#FAFAFE`.

Pagination:

- Bottom bar with page information: `Страница X из Y (всего N)`.
- Buttons: `Назад`, `Вперед`.
- Buttons are light grey rounded pills.

### 5. Categories / Товары / Все категории

Purpose: manage shop categories and products.

Content layout:

- Uses main section inside dashboard.
- Scrollable content with padding around `18px`.

Header row:

- Title: `Все категории`.
- Search input: `Поиск категорий`.
- Grid/list view toggle.

Selection row:

- `Выбрать все` button.
- Circular custom checkbox.
- Selected state: green border and light green fill with inner green dot.
- If selected: `Выбрано: N`.

Category display:

- Supports grid view and list view.
- Grid/list items should use rounded cards or rows with category image, name, products count, and selection control.
- Empty states:
  - `Нет активных категорий`
  - `Архив пуст`

Search input style:

- Height around `40px`.
- Width around `240px`.
- Rounded `14px`.
- White background.
- Border `#D9DDEA`.
- Focus border green.
- Search icon at right.

### 6. Reports / Отчеты

Reports are part of admin navigation and should follow the same dashboard/table/card language.

Expected report pages:

- Courier reports.
- Shop reports.
- Statistics.

Design reports with:

- Page title and tabs or breadcrumbs.
- Date range controls.
- Summary cards.
- Data tables with muted headers, row dividers, hover states.
- Empty/loading states consistent with other pages.

## Reusable components

### Buttons

Primary:

- Green background `#55CB00` or `#67C63C`.
- White text.
- Rounded `12px–16px`.
- Semibold/bold.
- Hover slightly darker green.

Secondary:

- Dark background `#0A1428` with white text, or light grey background depending on context.

Destructive:

- Pale red/orange background or red text depending on context.

Ghost/text:

- Transparent background.
- Dark or muted text.
- Light grey hover.

### Inputs

Two common input styles:

1. Search field with bottom border only:
   - Transparent background.
   - Bottom border muted grey.
   - Focus border green.
   - Search icon on the right.

2. Rounded field:
   - White or light grey background.
   - Rounded `12px–14px`.
   - Border light grey.
   - Focus border green.

### Tables

- White panel container.
- Header text muted grey, size `14px`.
- Body text size `16px`.
- Row divider: light border.
- Row hover: `#FAFAFE`.
- Clickable rows use right chevron.
- Dense but comfortable spacing: horizontal padding `12px`, vertical padding `12px`.

### Cards

- White background.
- Light border.
- Rounded `16px–18px`.
- Subtle shadow.
- Use muted metadata and stronger primary values.

### Tabs

Two tab styles:

1. Pill tab:
   - Active green pill with white text.
   - Used on Orders.

2. Underline tab:
   - Text tab with green underline on active.
   - Used on Partners and Promotions.

### Switches

- Compact switch.
- Used for archive visibility and settings.
- Should align with text label.

### Dropdowns

- Trigger is rounded light grey button.
- Menu is white, rounded `16px`, border, shadow.
- Selected item uses pale green background and green text.

### Status labels

Use text color rather than heavy badges in tables:

- Open/active: green.
- Closed/error/return: red-orange.
- Draft/warning: muted yellow.
- Archived/info: blue.

## Interaction patterns

- Most table rows are clickable.
- Cards in board/list views are clickable or selectable.
- Search is immediate or submit-based depending on page.
- Filter panels can expand under toolbar.
- Dropdowns close after selecting an item.
- Toasts appear top-right for success actions such as copying a promocode.
- Loading states use centered spinner.
- Error states are centered and muted, with red text when needed.

## Responsive behavior

Primary target appears to be desktop/admin usage.

Design priority:

1. Desktop dashboard layout.
2. Horizontal scroll for wide kanban boards and tables.
3. Sidebar can collapse.
4. Toolbar controls wrap when width is limited.
5. Preserve internal scrolling inside main content.

## Content examples for mockups

Use realistic Russian sample data.

Orders:

```text
№ 1284 — Новый
Магазин: Green Market
Адрес: г. Алматы, ул. Абая 15
Итого: 12 400 ₸
5 товаров
```

Partners:

```text
ID 104
Green Market
245 товаров
—
Открыт до 22:00
```

Promocodes:

```text
ID 302
02.05.2026
SPRING20
Весенняя акция
SHOPLY
125 000 ₽
100 шт
-20%
43
```

Categories:

```text
Овощи и фрукты
128 товаров
```

## Design generation instruction

When recreating the app in Cloud Design:

- Build a polished reference dashboard, not a generic admin template.
- Preserve the Russian labels and Shoply operational context.
- Use the exact visual language: soft grey background, white rounded panels, green primary accents, subtle borders, compact tables, kanban board for orders.
- Prioritize these screens in order:
  1. Orders board.
  2. Partners table.
  3. Promotions table with filter panel.
  4. Categories grid/list management.
  5. Login screen.
- Include reusable components and design tokens so the design can scale to reports, users, product forms, and detail pages.
- Avoid dark mode unless explicitly requested.
- Avoid overly colorful dashboards; keep most UI neutral and let green accents guide the eye.
