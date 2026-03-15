IMPORTANT:

- Do not write test-\* files
- Our package manager its pnpm
- Do not run application like pnpm dev

# 🚀 Универсальное руководство по разработке на Next.js Frontend

## 📁 Структура проекта

Проект использует современную архитектуру:

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **State Management**: React Context + Custom Hooks
- **API**: RESTful API или GraphQL
- **Forms**: React Hook Form + Zod
- **Testing**: Jest + Testing Library или Vitest

### Директории проекта

```
/project/
├── app/                          # Next.js App Router страницы
│   ├── (auth)/                  # Страницы аутентификации
│   ├── (components)/             # Компоненты для страниц
│   ├── dashboard/                # Dashboard страницы
│   ├── api/                      # Next.js API routes (если нужно)
│   ├── layout.tsx                # Root layout
│   ├── loading.tsx               # Глобальный loading
│   └── error.tsx                 # Глобальный error
├── components/                   # Глобальные переиспользуемые компоненты
│   ├── ui/                       # shadcn/ui базовые компоненты
│   ├── forms/                    # Формы
│   ├── layout/                   # Layout компоненты
│   └── common/                   # Общие компоненты
├── lib/                          # Утилиты и конфигурации
│   ├── api-client.ts             # HTTP клиент
│   ├── utils.ts                  # Общие утилиты
│   └── validations.ts            # Zod схемы
├── hooks/                        # Пользовательские хуки
│   ├── use-api.ts                # Хук для API запросов
│   └── use-local-storage.ts      # Работа с localStorage
├── types/                        # TypeScript типы
├── contexts/                     # React контексты
├── stores/                       # Состояния (Zustand/Jotai)
├── screenshots/                  # Скриншоты Chrome DevTools для отладки
└── public/                       # Статичные ресурсы
```

---

## 🔧 Работа с API

### Frontend API Layer

#### 1. Создание API хуков:

```typescript
// api/{feature}/index.ts
import { ApiClient } from '@/lib/api-client'

export interface EntityData {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface CreateEntityData {
  name: string
  description?: string
}

export class EntityApi {
  private client = new ApiClient()

  async getAll(params?: Record<string, any>) {
    return await this.client.get<EntityData[]>('/api/entities', params)
  }

  async getById(id: string) {
    return await this.client.get<EntityData>(`/api/entities/${id}`)
  }

  async create(data: CreateEntityData) {
    return await this.client.post<EntityData>('/api/entities', data)
  }

  async update(id: string, data: Partial<CreateEntityData>) {
    return await this.client.put<EntityData>(`/api/entities/${id}`, data)
  }

  async delete(id: string) {
    return await this.client.delete(`/api/entities/${id}`)
  }
}

export const entityApi = new EntityApi()
```

#### 2. Создание универсального React хука:

```typescript
// hooks/use-crud.ts
import { useState, useCallback, useEffect } from 'react'

interface UseCrudOptions<T, CreateData> {
  api: {
    getAll: (params?: any) => Promise<T[]>
    create: (data: CreateData) => Promise<T>
    update: (id: string, data: Partial<CreateData>) => Promise<T>
    delete: (id: string) => Promise<void>
  }
  initialParams?: Record<string, any>
}

export function useCrud<T extends { id: string }, CreateData>(options: UseCrudOptions<T, CreateData>) {
  const { api, initialParams } = options

  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(
    async (params?: Record<string, any>) => {
      setLoading(true)
      setError(null)
      try {
        const result = await api.getAll({ ...initialParams, ...params })
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    },
    [api, initialParams]
  )

  const create = useCallback(
    async (newData: CreateData) => {
      try {
        const result = await api.create(newData)
        setData((prev) => [...prev, result])
        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        throw err
      }
    },
    [api]
  )

  const update = useCallback(
    async (id: string, updateData: Partial<CreateData>) => {
      try {
        const result = await api.update(id, updateData)
        setData((prev) => prev.map((item) => (item.id === id ? result : item)))
        return result
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        throw err
      }
    },
    [api]
  )

  const remove = useCallback(
    async (id: string) => {
      try {
        await api.delete(id)
        setData((prev) => prev.filter((item) => item.id !== id))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        throw err
      }
    },
    [api]
  )

  useEffect(() => {
    fetch()
  }, [fetch])

  return {
    data,
    loading,
    error,
    refetch: fetch,
    create,
    update,
    delete: remove,
  }
}
```

#### 3. Универсальный API клиент:

```typescript
// lib/api-client.ts
interface ApiClientOptions {
  baseUrl?: string
  headers?: Record<string, string>
  interceptors?: {
    request?: (config: RequestInit) => RequestInit
    response?: (response: Response) => Response | Promise<Response>
  }
}

export class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>
  private interceptors: ApiClientOptions['interceptors']

  constructor(options: ApiClientOptions = {}) {
    this.baseUrl = options.baseUrl || process.env.NEXT_PUBLIC_API_URL || ''
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    this.interceptors = options.interceptors || {}
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    let config: RequestInit = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    }

    // Request interceptor
    if (this.interceptors.request) {
      config = this.interceptors.request(config)
    }

    const response = await fetch(url, config)

    // Response interceptor
    let processedResponse = response
    if (this.interceptors.response) {
      processedResponse = await this.interceptors.response(response)
    }

    if (!processedResponse.ok) {
      throw new Error(`API Error: ${processedResponse.status} ${processedResponse.statusText}`)
    }

    return processedResponse.json()
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }
    return this.request<T>(url)
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}
```

---

## 🎨 Работа с компонентами

### Глобальные компоненты

#### 1. Базовые UI компоненты (shadcn/ui):

```
components/ui/
├── button.tsx
├── card.tsx
├── dialog.tsx
├── input.tsx
├── table.tsx
├── badge.tsx
├── avatar.tsx
├── separator.tsx
├── form.tsx
├── dropdown-menu.tsx
├── toast.tsx
└── sheet.tsx
```

#### 2. Универсальный компонент карточки:

```typescript
// components/common/entity-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface EntityCardProps<T> {
  data: T & {
    id: string
    name: string
    description?: string
    active?: boolean
    createdAt: string
    updatedAt: string
  }
  onView?: (id: string) => void
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  actions?: React.ReactNode
  status?: {
    value: boolean | string
    label: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
}

export function EntityCard<T>({ data, onView, onEdit, onDelete, actions, status }: EntityCardProps<T>) {
  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex justify-between items-center'>
          <span>{data.name}</span>
          <div className='flex items-center gap-2'>
            {status && <Badge variant={status.variant || 'secondary'}>{status.label}</Badge>}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' size='sm'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {onView && (
                  <DropdownMenuItem onClick={() => onView(data.id)}>
                    <Eye className='h-4 w-4 mr-2' />
                    View
                  </DropdownMenuItem>
                )}
                {onEdit && (
                  <DropdownMenuItem onClick={() => onEdit(data.id)}>
                    <Edit className='h-4 w-4 mr-2' />
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={() => onDelete(data.id)} className='text-destructive'>
                    <Trash2 className='h-4 w-4 mr-2' />
                    Delete
                  </DropdownMenuItem>
                )}
                {actions}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.description && <p className='text-muted-foreground text-sm mb-4'>{data.description}</p>}
        <div className='mt-4 flex justify-between text-xs text-muted-foreground'>
          <span>Created: {new Date(data.createdAt).toLocaleDateString()}</span>
          <span>Updated: {new Date(data.updatedAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}
```

### Page-specific компоненты

#### 1. Структура страницы:

```
app/{feature}/
├── page.tsx              # Основная страница
├── (components)/         # Компоненты только для этой страницы
│   ├── {Feature}List.tsx
│   ├── {Feature}Form.tsx
│   ├── {Feature}Stats.tsx
│   └── {Feature}Header.tsx
├── loading.tsx           # Состояние загрузки
└── error.tsx             # Состояние ошибки
```

---

## 📋 Декомпозиция page.tsx файлов

**Всегда разделяйте page.tsx на более мелкие компоненты!**

### Правильный подход:

#### 1. Основной page.tsx (только логика и композиция):

```typescript
// app/{feature}/page.tsx
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { FeatureHeader } from './(components)/feature-header'
import { FeatureStats } from './(components)/feature-stats'
import { FeatureList } from './(components)/feature-list'
import { PageLoader } from '@/components/ui/page-loader'

export default async function FeaturePage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className='container mx-auto py-8 space-y-8'>
      <FeatureHeader />

      <Suspense fallback={<PageLoader />}>
        <FeatureStats />
      </Suspense>

      <Suspense fallback={<PageLoader />}>
        <FeatureList />
      </Suspense>
    </div>
  )
}
```

#### 2. Универсальный header компонент:

```typescript
// app/{feature}/(components)/feature-header.tsx
import { Button } from '@/components/ui/button'
import { Plus, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FeatureForm } from './feature-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface FeatureHeaderProps {
  title?: string
  description?: string
  createButtonText?: string
  onCreate?: (data: any) => Promise<void>
}

export function FeatureHeader({
  title = 'Features',
  description,
  createButtonText = 'Create Feature',
  onCreate,
}: FeatureHeaderProps) {
  return (
    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>{title}</h1>
        {description && <p className='text-muted-foreground'>{description}</p>}
      </div>

      <div className='flex items-center gap-2 w-full sm:w-auto'>
        <div className='relative flex-1 sm:flex-initial'>
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input placeholder='Search...' className='pl-8' />
        </div>
        <Button variant='outline' size='sm'>
          <Filter className='h-4 w-4 mr-2' />
          Filter
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className='h-4 w-4 mr-2' />
              {createButtonText}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{createButtonText}</DialogTitle>
            </DialogHeader>
            <FeatureForm onSubmit={onCreate} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
```

#### 3. Универсальный список с CRUD:

```typescript
// app/{feature}/(components)/feature-list.tsx
import { EntityCard } from '@/components/common/entity-card'
import { useCrud } from '@/hooks/use-crud'
import { entityApi } from '@/api/feature'
import { toast } from 'sonner'

export function FeatureList() {
  const {
    data,
    loading,
    error,
    create,
    update,
    delete: remove,
  } = useCrud({
    api: entityApi,
  })

  const handleDelete = async (id: string) => {
    try {
      await remove(id)
      toast.success('Item deleted successfully')
    } catch (error) {
      toast.error('Failed to delete item')
    }
  }

  const handleEdit = async (id: string) => {
    // Open edit dialog/modal
  }

  if (loading && data.length === 0) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
      {data.map((item) => (
        <EntityCard
          key={item.id}
          data={item}
          onEdit={handleEdit}
          onDelete={handleDelete}
          status={{
            value: item.active,
            label: item.active ? 'Active' : 'Inactive',
            variant: item.active ? 'default' : 'secondary',
          }}
        />
      ))}
    </div>
  )
}
```

### Принципы декомпозиции:

1. **Один файл = одна ответственность**
2. **page.tsx только для композиции**
3. **Бизнес-логика в хуках**
4. **UI-логика в компонентах**
5. **Переиспользуемость через generics**

---

## 🎯 TypeScript типы

### Универсальные типы:

```typescript
// types/common.ts
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface NameEntity extends BaseEntity {
  name: string
  description?: string
}

export interface StatusEntity extends BaseEntity {
  active: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  code?: string
  details?: any
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  message?: string
}

export type PaginationParams = {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export type FilterParams = {
  search?: string
  active?: boolean
  [key: string]: any
}

export type ListParams = PaginationParams & FilterParams
```

---

## 📱 Работа с формами

### Универсальная форма:

```typescript
// lib/form-config.ts
import { z } from 'zod'

export const baseFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  active: z.boolean().default(true),
})

export type BaseFormData = z.infer<typeof baseFormSchema>

export function createFormSchema<T extends z.ZodRawShape>(schema: T) {
  return z.object(schema)
}
```

```typescript
// components/common/entity-form.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'

interface EntityFormProps<T> {
  initialData?: Partial<T>
  onSubmit: (data: T) => Promise<void>
  schema: any
  submitText?: string
  loading?: boolean
}

export function EntityForm<T extends BaseFormData>({
  initialData,
  onSubmit,
  schema,
  submitText = 'Submit',
  loading = false,
}: EntityFormProps<T>) {
  const { toast } = useToast()

  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      active: true,
      ...initialData,
    },
  })

  const handleSubmit = async (data: T) => {
    try {
      await onSubmit(data)
      toast({
        title: 'Success!',
        description: 'Operation completed successfully.',
      })
      if (!initialData) {
        form.reset()
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Operation failed',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Enter name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder='Enter description' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='active'
          render={({ field }) => (
            <FormItem className='flex flex-row items-center justify-between rounded-lg border p-4'>
              <div className='space-y-0.5'>
                <FormLabel className='text-base'>Active</FormLabel>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type='submit' className='w-full' disabled={loading}>
          {loading ? 'Submitting...' : submitText}
        </Button>
      </form>
    </Form>
  )
}
```

---

## 🔔 Обработка ошибок и состояния загрузки

### Универсальный Error Boundary:

```typescript
// components/error-boundary.tsx
'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
  showErrorDetails?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
}

export default function ErrorBoundary({
  children,
  fallback: Fallback,
  showErrorDetails = process.env.NODE_ENV === 'development',
}: Props) {
  const [state, setState] = React.useState<State>({
    hasError: false,
    error: null,
  })

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setState({
        hasError: true,
        error: event.error,
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      setState({
        hasError: true,
        error: new Error(event.reason),
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  const reset = () => {
    setState({
      hasError: false,
      error: null,
    })
  }

  if (state.hasError && state.error) {
    if (Fallback) {
      return <Fallback error={state.error} reset={reset} />
    }

    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <Card className='w-full max-w-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-destructive'>
              <AlertTriangle className='h-5 w-5' />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <p className='text-sm text-muted-foreground'>
              An unexpected error occurred. Please try again or contact support if the problem persists.
            </p>

            {showErrorDetails && (
              <div className='bg-muted p-3 rounded text-xs'>
                <strong>Error details:</strong>
                <pre className='mt-1 whitespace-pre-wrap'>{state.error.message}</pre>
              </div>
            )}

            <div className='flex gap-2'>
              <Button onClick={reset} variant='outline' className='flex-1'>
                <RefreshCw className='h-4 w-4 mr-2' />
                Try Again
              </Button>
              <Button asChild variant='default' className='flex-1'>
                <Link href='/'>
                  <Home className='h-4 w-4 mr-2' />
                  Go Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
```

### Универсальные загрузчики:

```typescript
// components/ui/loaders.tsx
import { Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function PageLoader() {
  return (
    <div className='flex items-center justify-center min-h-[400px]'>
      <div className='text-center space-y-4'>
        <Loader2 className='h-8 w-8 animate-spin mx-auto text-primary' />
        <p className='text-muted-foreground'>Loading...</p>
      </div>
    </div>
  )
}

export function InlineLoader() {
  return (
    <div className='flex items-center justify-center py-8'>
      <Loader2 className='h-6 w-6 animate-spin text-primary' />
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className='rounded-lg border'>
      <div className='p-6 space-y-4'>
        <div className='space-y-2'>
          <Skeleton className='h-6 w-3/4' />
          <Skeleton className='h-4 w-1/2' />
        </div>
        <Skeleton className='h-20 w-full' />
        <div className='flex justify-between'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-24' />
        </div>
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className='space-y-3'>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className='flex items-center space-x-4'>
          <Skeleton className='h-12 w-12 rounded-full' />
          <div className='space-y-2 flex-1'>
            <Skeleton className='h-4 w-3/4' />
            <Skeleton className='h-4 w-1/2' />
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## 🛠️ Утилиты и хелперы

### Универсальные утилиты:

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Форматирование даты
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short') {
  const d = new Date(date)
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  return d.toLocaleDateString()
}

// Debounce
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Local storage
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    if (typeof window === 'undefined') return null
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch {
      return defaultValue || null
    }
  },
  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Ignore errors
    }
  },
  remove: (key: string): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  },
  clear: (): void => {
    if (typeof window === 'undefined') return
    localStorage.clear()
  },
}

// URL helpers
export function buildUrl(base: string, params: Record<string, any>): string {
  const url = new URL(base)
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value))
    }
  })
  return url.toString()
}

// Validation helpers
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
```

### Универсальные хуки:

```typescript
// hooks/use-local-storage.ts
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch {
      // Ignore errors
    }
  }

  return [storedValue, setValue]
}

// hooks/use-debounce.ts
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// hooks/use-async-operation.ts
import { useState, useCallback } from 'react'

export function useAsyncOperation<T extends any[], R>(operation: (...args: T) => Promise<R>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(
    async (...args: T): Promise<R | null> => {
      setLoading(true)
      setError(null)

      try {
        const result = await operation(...args)
        return result
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        return null
      } finally {
        setLoading(false)
      }
    },
    [operation]
  )

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
  }, [])

  return {
    execute,
    loading,
    error,
    reset,
  }
}
```

---

## 🛠️ Команды разработки

```bash
# Frontend (Next.js)
npm run dev              # Запуск dev сервера
npm run build           # Production сборка
npm run start           # Запуск production сервера
npm run lint            # Проверка линтером
npm run type-check      # Проверка TypeScript
npm run test            # Запуск тестов
npm run test:watch      # Тесты в режиме watch
npm run test:coverage   # Тесты с покрытием

# Дополнительные команды
npm run format          # Форматирование кода
npm run format:check    # Проверка форматирования
npm run clean           # Очистка cache
```

---

## ✅ Лучшие практики

### 1. Структура кода:

- **Всегда декомпозируйте page.tsx**
- **Используйте TypeScript для всего**
- **Следуйте структуре директорий**
- **Используйте консистентные именования**
- **Создавайте переиспользуемые компоненты**

### 2. Производительность:

- **Используйте React.memo для дорогих компонентов**
- **Применяйте useMemo/useCallback для оптимизации**
- **Ленивая загрузка компонентов с React.lazy**
- **Оптимизация изображений с Next.js Image**
- **Используйте Suspense boundaries**

### 3. UX/UI:

- **Показывайте состояния загрузки**
- **Обрабатывайте ошибки корректно**
- **Используйте анимации для переходов**
- **Следуйте дизайну системы**
- **Создавайте доступные интерфейсы**

### 4. Доступность:

- **Используйте семантическую HTML разметку**
- **Добавьте ARIA атрибуты где необходимо**
- **Обеспечьте навигацию с клавиатуры**
- **Проверьте контрастность цветов**
- **Тестируйте с screen readers**

### 5. Тестирование:

- **Тестируйте пользовательские хуки**
- **Пишите интеграционные тесты для форм**
- **Тестируйте компоненты в изоляции**
- **Проверяйте доступность**
- **Используйте E2E тесты для критических путей**

### 6. Разработка и отладка:

- **Сохраняйте скриншоты Chrome DevTools в отдельную папку `screenshots/` в корне проекта**
- **Используйте MCP chrome-devtools для автоматизации браузера и отладки**
- **Ведите документацию найденных проблем с визуальными материалами**
- **Создавайте скриншоты для баг-репортов и документации**
- **Используйте именованные файлы скриншотов с датой и описанием проблемы**

### 7. Безопасность:

- **Валидация данных на клиенте**
- **Используйте HTTPS в production**
- **Защита от XSS атак**
- **Безопасное хранение секретов**
- **CORS настройки**

---

## 🚀 Проект инициализация

### Создание нового проекта:

```bash
# 1. Создать Next.js проект
npx create-next-app@latest my-project --typescript --tailwind --eslint --app

# 2. Добавить shadcn/ui
npx shadcn-ui@latest init

# 3. Добавить основные компоненты
npx shadcn-ui@latest add button card input label form
npx shadcn-ui@latest add dialog dropdown-menu toast
npx shadcn-ui@latest add avatar badge skeleton

# 4. Добавить зависимости
npm install zod react-hook-form @hookform/resolvers
npm install clsx tailwind-merge lucide-react
npm install @radix-ui/react-switch @radix-ui/react-toast
npm install sonner

# 5. Создать структуру директорий
mkdir -p app/\(components\)
mkdir -p components/{ui,common,layout,forms}
mkdir -p lib hooks types contexts stores
mkdir -p api/{types}
```
