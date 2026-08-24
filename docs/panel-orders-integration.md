# Panel Orders API Integration

## Overview

This document describes the integration between the frontend orders page and the backend `/v2/panel/orders` API endpoint.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐    ┌─────────────────────────────────────┐ │
│  │ orders/page.tsx│───▶│ panel-page.tsx (New Implementation)  │ │
│  └───────────────┘    └─────────────────────────────────────┘ │
│                                │                                │
│                                ▼                                │
│         ┌──────────────────────────────────────────────────┐   │
│         │              usePanelOrders Hook                  │   │
│         │  (React Query + useAuthFetcher)                 │   │
│         └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Data Transformation Layer                   │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │        panel-order-transformers.tsx                       │  │
│  │  • transformOrderToCard()                                 │  │
│  │  • transformOrdersToCards()                               │  │
│  │  • groupCardsByColumn()                                   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        UI Components                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌──────────────────┐  ┌─────────────┐  │
│  │ OrdersFilterPanel│  │ OrdersPagination │  │PanelOrderCard│  │
│  └──────────────────┘  └──────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  GET /v2/panel/orders                                            │
│  Query Params: status, regionId, shopId, from, to, page, pageSize│
│  Response: PanelOrderPaginatedResponseDto                        │
└─────────────────────────────────────────────────────────────────┘
```

## Files Created

### 1. Backend DTO Types
**File:** `types/panel-orders.dto.ts`

Defines the API contract types:
- `OrderStatus` enum
- `V2PanelOrdersQueryDto` - query parameters
- `PanelOrderDto` - order data structure
- `PanelOrderPaginatedResponseDto` - paginated response

### 2. Data Transformers
**File:** `components/orders/panel-order-transformers.tsx`

Transforms backend DTO to frontend format:
- `transformOrderToCard(dto)` - Single order transformation
- `transformOrdersToCards(dtos)` - Batch transformation
- `groupCardsByColumn(cards)` - Group for Kanban layout
- `getUiStatus()` - Maps status to UI representation

### 3. Filter State Management
**File:** `components/hooks/useOrderFilters.ts`

URL-based filter state management:
- Syncs filters with URL search params
- `filters` - Current filter values
- `hasActiveFilters` - Check if filters are active
- `updateFilter()` - Update single filter
- `updateFilters()` - Update multiple filters
- `clearFilters()` - Reset all filters

### 4. Orders Hook
**File:** `components/hooks/usePanelOrders.ts`

React Query hook for fetching orders:
- Uses `useAuthFetcher` for authenticated requests
- Accepts `V2PanelOrdersQueryDto` filters
- Returns typed data with pagination meta

### 5. UI Components

**OrdersFilterPanel** (`components/orders/orders-filter-panel.tsx`)
- Dropdown filters for status, region, shop
- Date range presets (today, yesterday, last 7/30 days)
- Clear filters button

**OrdersPagination** (`components/orders/orders-pagination.tsx`)
- Page number buttons with ellipsis for large page counts
- Item range display (e.g., "Показано 1–20 из 150")
- Previous/Next navigation

**PanelOrderCard** (`components/orders/panel-order-card.tsx`)
- Displays order information in card format
- Shows status icon, shop name, address
- Click to open detail view

### 6. Main Page
**File:** `app/orders/panel-page.tsx`

Complete integration of all components with:
- Filter panel with all filter options
- Kanban board layout
- Pagination controls
- Order detail panel
- URL-based filter persistence

## Usage

### Enabling the New Integration

To switch from the legacy `OrdersBoard` to the new panel API integration:

1. **Option 1: Direct import in page.tsx**
```typescript
// app/orders/page.tsx
export { default } from "./panel-page";
```

2. **Option 2: Use panel-page directly**
```typescript
// Access the new implementation at /orders
// The legacy board is still available as a component
```

### Filter Behavior

Filters are persisted in URL search params:
```
/orders?status=ready&regionId=1&from=2026-08-01T00:00:00.000Z&page=2
```

This enables:
- Shareable filter states via URL
- Browser back/forward navigation preserves filters
- Page reload maintains filter state

### Data Flow

1. **Initial Load**
```
URL → useOrderFilters → filters object → usePanelOrders → API → transform → cards → UI
```

2. **Filter Change**
```
User selects filter → URL update → useOrderFilters detects change → usePanelOrders refetches → UI updates
```

3. **Page Change**
```
User clicks page → URL update → usePanelOrders refetches with new page → UI updates
```

## Mock Data

Currently, the filter panel uses mock data for regions and shops:
```typescript
const MOCK_REGIONS = [
  { id: 1, name: "Байконур" },
  // ...
];
```

To integrate real data:

1. Create hooks for fetching regions and shops:
```typescript
// components/hooks/useRegions.ts
export function useRegions() {
  const fetcher = useAuthFetcher();
  return useQuery({
    queryKey: ["regions"],
    queryFn: () => fetcher("/v2/regions"),
  });
}
```

2. Update `panel-page.tsx` to fetch and pass real data to `OrdersFilterPanel`.

## Pagination

The pagination meta from the API response:
```typescript
interface PaginationMeta {
  totalItems: number;      // Total number of orders
  itemCount: number;       // Items on current page
  itemsPerPage: number;     // Page size (default: 20)
  totalPages: number;       // Total number of pages
  currentPage: number;      // Current page (1-indexed)
}
```

## Error Handling

The `usePanelOrders` hook returns an `error` field that can be displayed in the UI:
```typescript
const { error, orders, meta } = usePanelOrders({ filters });

if (error) {
  return <ErrorDisplay error={error} />;
}
```

## Future Enhancements

1. **WebSocket Integration**
   - Add real-time order updates using `useOrderSocket`
   - Update board when orders change status

2. **Advanced Filtering**
   - Date range picker with custom dates
   - Multi-select for statuses and shops
   - Search by order number or customer name

3. **Performance**
   - Implement virtual scrolling for large order lists
   - Add query debouncing for rapid filter changes

4. **Analytics**
   - Add order statistics dashboard
   - Export filtered orders to CSV

## Type Safety

All components are fully typed with TypeScript:
- Backend DTO types in `types/panel-orders.dto.ts`
- Frontend card props in `panel-order-transformers.tsx`
- Filter parameters extend `V2PanelOrdersQueryDto`

This ensures compile-time checking of:
- API response structure
- Filter parameter names and types
- UI component props
