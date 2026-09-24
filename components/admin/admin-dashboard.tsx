'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { Main, Content } from '@/components/layout'
import { DashboardCard } from './dashboard-card'
import { useAuth } from '@/components/hooks/useLogin'
import {
  useDashboardData,
  type DashboardStatusCounts,
  type DashboardRevenue,
  type DashboardPaymentMethods,
  type DashboardAvgTimes,
  type DashboardDayStat,
  type DashboardClientsMonth,
  type DashboardUsersQuarter,
} from '@/components/hooks/useDashboardData'
import {
  useDashboardLists,
  type ReviewFilter,
  type SellersSort,
  type CouriersSort,
} from '@/components/hooks/useDashboardLists'
import { CreatePromocodeSheet } from '@/components/promotions/create-promocode-sheet'
import { OrdersChartCard } from '@/components/charts/orders-chart-card'
import { OrdersTodayCard } from '@/components/dashboard/orders-today-card'
import { OperationalRevenueCard } from '@/components/dashboard/operational-revenue-card'
import { PaymentMethodsCard } from '@/components/dashboard/payment-methods-card'

const NOW = new Date()

const fmtNum = (n: number | null | undefined) => (n == null ? '—' : n.toLocaleString('ru-RU'))

const fmtMoney = (n: number | null | undefined) => (n == null ? '—' : `${n.toLocaleString('ru-RU')} ₽`)

const fmtCompact = (n: number | null | undefined) => {
  if (n == null) return '—'
  if (n >= 1000000) return `${(n / 1000000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} млн`
  if (n >= 1000) return `${(n / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} к`
  return n.toLocaleString('ru-RU')
}

function Trend({ value, invert = false }: { value: number | null | undefined; invert?: boolean }) {
  if (value == null || !Number.isFinite(value)) return null
  const rounded = Math.round(value * 10) / 10
  const up = rounded >= 0
  const good = invert ? !up : up
  return (
    <span className={`mt-[4px] text-[12px] font-medium ${good ? 'text-[#55CB00]' : 'text-[#F4462B]'}`}>
      {up ? '↗' : '↘'} {up ? '+' : '-'}
      {Math.abs(rounded).toLocaleString('ru-RU')}%
    </span>
  )
}

const MONTHS_RU = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
]

const CURRENT_DATE_LABEL = `${NOW.getDate()} ${MONTHS_RU[NOW.getMonth()]}, ${NOW.getFullYear()}`

function RegionIcon({ className }: { className?: string }) {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' className={className} aria-hidden='true'>
      <path
        d='M14.8516 19.8679H16.4806C18.7286 19.8679 20.5516 18.0449 20.5516 15.7969'
        stroke='#8DF56A'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M16.0726 21.0904L14.8516 19.8694L16.0726 18.6484'
        stroke='#8DF56A'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M9.15312 4.13281H7.52413C5.27613 4.13281 3.45312 5.95581 3.45312 8.20381'
        stroke='#98D2FF'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M7.92969 2.90625L9.15069 4.12825L7.92969 5.34925'
        stroke='#98D2FF'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='2.25' y='9.75' width='11.5' height='11.5' rx='5.5' stroke='#55CB00' strokeWidth='1.5' />
      <rect
        x='5.8151'
        y='13.3151'
        width='4.36667'
        height='1.11667'
        rx='0.558333'
        fill='#55CB00'
        stroke='#55CB00'
        strokeWidth='0.833333'
      />
      <path
        d='M17 12C19.7614 12 22 9.76142 22 7C22 4.23858 19.7614 2 17 2C14.2386 2 12 4.23858 12 7'
        stroke='#478EFF'
        strokeWidth='1.5'
        strokeLinecap='round'
      />
      <rect
        x='15.0182'
        y='5.01823'
        width='3.96667'
        height='0.966667'
        rx='0.483333'
        fill='#478EFF'
        stroke='#478EFF'
        strokeWidth='0.833333'
      />
    </svg>
  )
}

function WalletCheckIcon({ className }: { className?: string }) {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' className={className} aria-hidden='true'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M6 21H4C3.448 21 3 20.552 3 20V14C3 13.448 3.448 13 4 13H6C6.552 13 7 13.448 7 14V20C7 20.552 6.552 21 6 21Z'
        stroke='#55CB00'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M13 16.9991H15.333C15.766 16.9991 16.187 16.8591 16.533 16.5991L18.949 14.7871C19.552 14.3351 20.396 14.3951 20.929 14.9281V14.9281C21.521 15.5201 21.521 16.4791 20.929 17.0701L18.856 19.1431C18.298 19.7011 17.586 20.0821 16.812 20.2371L13.882 20.8231C13.301 20.9391 12.702 20.9251 12.127 20.7811L9.477 20.1191C9.16 20.0391 8.835 19.9991 8.508 19.9991H7'
        stroke='#55CB00'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M13 17H14.485C15.322 17 16 16.322 16 15.485V15.182C16 14.487 15.527 13.881 14.853 13.713L12.561 13.14C12.188 13.047 11.806 13 11.422 13V13C10.495 13 9.588 13.274 8.817 13.789L7 15'
        stroke='#55CB00'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M17.1651 5.15154C18.2734 6.25985 18.2734 8.05677 17.1651 9.16508C16.0568 10.2734 14.2599 10.2734 13.1515 9.16508C12.0432 8.05677 12.0432 6.25985 13.1515 5.15154C14.2599 4.04324 16.0568 4.04324 17.1651 5.15154'
        stroke='#55CB00'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M14.631 4.375C14.538 3.81 14.28 3.267 13.844 2.831C12.736 1.723 10.939 1.723 9.831 2.831C8.723 3.939 8.723 5.736 9.831 6.844C10.521 7.534 11.477 7.793 12.368 7.624'
        stroke='#55CB00'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function WalletPurpleIcon({ className }: { className?: string }) {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' className={className} aria-hidden='true'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M15.3365 19.005L13.6698 20.0054L12.0021 19.005L10.3344 20.0054L8.66769 19.005L7 20.0054V7H17.0042V20.0054L15.3365 19.005Z'
        stroke='#9747FF'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M10 16.008H14.0017' stroke='#9747FF' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M17.0023 11.0033H19.0031C20.1847 10.9194 21.0778 9.89866 21.004 8.71638V5.28695C21.0778 4.10467 20.1847 3.08392 19.0031 3H4.99729C3.81568 3.08392 2.92263 4.10467 2.99645 5.28695V8.71738C2.92265 9.89947 3.81583 10.9199 4.99729 11.0033H6.99812'
        stroke='#9747FF'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M13.7513 11.0156L11.7314 13.0345L10.75 12.0561'
        stroke='#9747FF'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function TagPurpleIcon({ className }: { className?: string }) {
  return (
    <svg width='24' height='24' viewBox='0 0 24 24' fill='none' className={className} aria-hidden='true'>
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M8.807 19.711H6.472C5.268 19.711 4.291 18.735 4.291 17.53V16.098C4.291 15.52 4.061 14.965 3.652 14.556L2.639 13.543C1.787 12.691 1.787 11.311 2.639 10.459L3.652 9.446C4.061 9.037 4.291 8.483 4.291 7.904V6.472C4.291 5.268 5.267 4.291 6.472 4.291H7.904C8.482 4.291 9.037 4.061 9.446 3.652L10.459 2.639C11.311 1.787 12.691 1.787 13.543 2.639L14.556 3.652C14.965 4.061 15.52 4.291 16.098 4.291H17.53C18.734 4.291 19.711 5.267 19.711 6.472V7.904C19.711 8.482 19.941 9.037 20.35 9.446L21.363 10.459C22.215 11.311 22.215 12.691 21.363 13.543L20.35 14.556C19.941 14.965 19.711 15.52 19.711 16.098V17.53C19.711 18.734 18.735 19.711 17.53 19.711H16.098C15.52 19.711 14.965 19.941 14.556 20.35L13.543 21.363C12.691 22.215 11.311 22.215 10.459 21.363L8.807 19.711Z'
        stroke='#9747FF'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M9 15L15 9' stroke='#9747FF' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
      <path
        d='M9.249 9C9.111 9 8.999 9.112 9 9.25C9 9.388 9.112 9.5 9.25 9.5C9.388 9.5 9.5 9.388 9.5 9.25C9.5 9.112 9.388 9 9.249 9'
        stroke='#9747FF'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M14.749 14.5C14.611 14.5 14.499 14.612 14.5 14.75C14.5 14.888 14.612 15 14.75 15C14.888 15 15 14.888 15 14.75C15 14.612 14.888 14.5 14.749 14.5'
        stroke='#9747FF'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  )
}

function MoreLink() {
  return (
    <a
      href='#'
      onClick={(e) => e.preventDefault()}
      className='text-[14px] font-semibold leading-none text-[#2F7CF7] hover:opacity-80'
    >
      Подробнее
    </a>
  )
}

function FilterBadges({
  filters,
  active,
  onChange,
}: {
  filters: string[]
  active?: number
  onChange?: (index: number) => void
}) {
  const [internalActive, setInternalActive] = React.useState(0)
  const currentActive = active ?? internalActive

  return (
    <div className='flex flex-wrap gap-[10px] pt-[2px]'>
      {filters.map((f, i) => (
        <button
          key={f}
          type='button'
          onClick={() => {
            setInternalActive(i)
            onChange?.(i)
          }}
          className={`flex h-[34px] cursor-pointer items-center justify-center rounded-[18px] border px-[16px] py-[8px] text-[14px] font-medium leading-[18px] transition-colors ${
            i === currentActive ? 'border-[#55CB00] text-[#5BAF1F]' : 'border-[#E2E2EA] text-[#0E0E27]'
          }`}
        >
          {f}
        </button>
      ))}
    </div>
  )
}

function TopActionBar({ onCreatePromocode }: { onCreatePromocode: () => void }) {
  return (
    <div className='flex flex-col gap-[12px] lg:flex-row lg:items-center lg:justify-between'>
      <div className='flex flex-col items-stretch gap-[8px] lg:flex-row lg:items-center lg:gap-3'>
        <button
          type='button'
          className='flex items-center gap-2 rounded-full border border-[#E2E2EA] bg-white px-4 py-2.5 text-[14px] font-medium text-[#0E0E27] transition-colors hover:bg-[#F5F6F6]'
        >
          <RegionIcon className='h-6 w-6' />
          <span>Регион</span>
          <span className='text-[#7F7F8A]'>Все</span>
          <ChevronDown className='h-4 w-4 text-[#7F7F8A]' />
        </button>

        <button
          type='button'
          className='flex items-center gap-2 rounded-full border border-[#E2E2EA] bg-white px-4 py-2.5 text-[14px] font-medium text-[#0E0E27] transition-colors hover:bg-[#F5F6F6]'
        >
          <WalletCheckIcon className='h-6 w-6' />
          Выплата курьерам
        </button>

        <button
          type='button'
          className='flex items-center gap-2 rounded-full border border-[#E2E2EA] bg-white px-4 py-2.5 text-[14px] font-medium text-[#0E0E27] transition-colors hover:bg-[#F5F6F6]'
        >
          <WalletPurpleIcon className='h-6 w-6' />
          Внести данные по заказам
        </button>

        <button
          type='button'
          onClick={onCreatePromocode}
          className='flex items-center gap-[8px] rounded-full border border-[#E2E2EA] bg-white px-[16px] py-[10px] text-[14px] font-medium text-[#0E0E27] transition-colors hover:bg-[#F5F6F6]'
        >
          <TagPurpleIcon className='h-[24px] w-[24px]' />
          Создать промокод
        </button>
      </div>

      <span className='text-[20px] font-bold tracking-[-0.02em] text-[#0E0E27] lg:text-[28px]'>{CURRENT_DATE_LABEL}</span>
    </div>
  )
}

function UsersQuarterCard({ stat }: { stat: DashboardUsersQuarter | null }) {
  return (
    <DashboardCard title='Пользователей (квартал)' footer={<MoreLink />}>
      <div className='flex flex-wrap items-start gap-x-[32px] gap-y-[12px]'>
        <div className='flex flex-col'>
          <span className='text-[12px] leading-[14px] text-[#7F7F8A]'>Всего</span>
          <span className='mt-[2px] text-[32px] font-bold leading-[36px] tracking-[-0.02em] text-[#0E0E27]'>
            {stat ? fmtCompact(stat.total) : '—'}
          </span>
          <Trend value={stat?.totalPercent} />
        </div>
        <div className='flex flex-col'>
          <span className='text-[12px] leading-[14px] text-[#7F7F8A]'>Регистрации</span>
          <span className='mt-[2px] text-[20px] font-bold leading-[28px] text-[#0E0E27]'>
            {stat ? `+${fmtNum(stat.newCount)}` : '—'}
          </span>
          <Trend value={stat?.newPercent} />
        </div>
        <div className='flex flex-col'>
          <span className='text-[12px] leading-[14px] text-[#7F7F8A]'>Активные</span>
          <span className='mt-[2px] text-[20px] font-bold leading-[28px] text-[#0E0E27]'>
            {stat ? `${stat.activePercent}%` : '—'}
          </span>
        </div>
      </div>
    </DashboardCard>
  )
}

function ClientsMonthCard({ clients }: { clients: DashboardClientsMonth | null }) {
  return (
    <DashboardCard title='Клиенты (месяц)' footer={<MoreLink />}>
      <div className='flex flex-wrap items-start gap-x-[32px] gap-y-[12px]'>
        <div className='flex flex-col'>
          <span className='text-[12px] leading-[14px] text-[#7F7F8A]'>Всего</span>
          <span className='mt-[2px] text-[32px] font-bold leading-[36px] tracking-[-0.02em] text-[#0E0E27]'>
            {fmtNum(clients?.total)}
          </span>
        </div>
        <div className='flex flex-col'>
          <span className='text-[12px] leading-[14px] text-[#7F7F8A]'>Новых</span>
          <span className='mt-[2px] text-[20px] font-bold leading-[28px] text-[#0E0E27]'>{fmtNum(clients?.newCount)}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-[12px] leading-[14px] text-[#7F7F8A]'>Потерянные</span>
          <span className='mt-[2px] text-[20px] font-bold leading-[28px] text-[#0E0E27]'>{fmtNum(clients?.lost)}</span>
        </div>
      </div>
    </DashboardCard>
  )
}

function StarIcon() {
  return (
    <svg width='10' height='10' viewBox='0 0 10 10' fill='none' aria-hidden='true'>
      <path
        d='M4.39505 0.392675C4.64251 -0.130892 5.35749 -0.130891 5.60495 0.392676L6.62741 2.55599C6.72568 2.7639 6.91563 2.908 7.13536 2.94134L9.42166 3.28824C9.97499 3.3722 10.1959 4.08225 9.79554 4.48979L8.14116 6.1737C7.98216 6.33553 7.9096 6.5687 7.94714 6.79721L8.33769 9.17492C8.43221 9.75038 7.85377 10.1892 7.35885 9.91752L5.31393 8.79492C5.11739 8.68703 4.88261 8.68703 4.68607 8.79492L2.64115 9.91752C2.14623 10.1892 1.56779 9.75038 1.66231 9.17492L2.05286 6.79721C2.0904 6.5687 2.01784 6.33553 1.85884 6.1737L0.204463 4.48979C-0.195932 4.08225 0.0250112 3.3722 0.578344 3.28824L2.86464 2.94134C3.08437 2.908 3.27432 2.7639 3.37259 2.55599L4.39505 0.392675Z'
        fill='#09091D'
      />
    </svg>
  )
}

const REVIEW_FILTERS = ['Последние', 'Позитивные', 'Негативные'] as const
const REVIEW_FILTER_VALUES = ['latest', 'positive', 'negative'] as const

function ReviewsCard({ state, onFilter }: { state: ReturnType<typeof useDashboardLists>['reviews']; onFilter: (f: ReviewFilter) => void }) {
  const [active, setActive] = React.useState(0)

  return (
    <DashboardCard
      title='Отзывы'
      footer={<MoreLink />}
      className='min-h-[600px]'
      headerExtra={
        <FilterBadges
          filters={[...REVIEW_FILTERS]}
          active={active}
          onChange={(i) => {
            setActive(i)
            onFilter(REVIEW_FILTER_VALUES[i])
          }}
        />
      }
    >
      <div className='flex flex-col'>
        <div className='flex items-center gap-[8px] pb-[10px] max-lg:grid max-lg:grid-cols-[74px_70px_1fr]'>
          <span className='w-[74px] shrink-0 text-[14px] leading-[18px] text-[#0E0F27]/50'>Дата</span>
          <span className='w-[70px] shrink-0 text-[14px] leading-[18px] text-[#0E0F27]/50'>Оценка</span>
          <span className='w-[92px] shrink-0 text-[14px] leading-[18px] text-[#0E0F27]/50 max-lg:hidden'>Магазин</span>
          <span className='flex-1 truncate text-[14px] leading-[18px] text-[#0E0F27]/50'>Отзыв</span>
        </div>

        {state.data.map((r) => (
          <React.Fragment key={r.id}>
            <div className='h-px bg-[#F0F0F5]' />
            <div className='flex items-start gap-[8px] py-[10px] max-lg:grid max-lg:grid-cols-[74px_70px_1fr] max-lg:gap-y-[4px]'>
              <span className='w-[74px] shrink-0 whitespace-nowrap text-[14px] leading-[18px] text-[#0E0F27]'>
                {formatReviewDate(r.createdAt)}
              </span>
              <span className='flex w-[70px] shrink-0 items-center gap-[4px]'>
                <StarIcon />
                <span className='text-[14px] leading-[18px] text-[#0E0F27]'>{r.rate}</span>
              </span>
              <span className='line-clamp-4 w-[92px] shrink-0 text-[14px] leading-[18px] text-[#0E0F27] max-lg:col-span-3 max-lg:w-auto'>
                {r.shopName}
              </span>
              <span className='line-clamp-4 flex-1 text-[14px] leading-[18px] text-[#0E0F27]'>{r.text}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </DashboardCard>
  )
}

const SELLER_FILTERS = ['Заказы', 'Выручка', 'Товары'] as const
const SELLER_SORT_VALUES = ['id', 'revenue', 'products'] as const

function SellersCard({ state, onSort }: { state: ReturnType<typeof useDashboardLists>['sellers']; onSort: (s: SellersSort) => void }) {
  const [active, setActive] = React.useState(0)

  const metricLabel = active === 1 ? 'Выручка' : active === 2 ? 'Кол-во\nтоваров' : 'Кол-во\nзаказов'

  return (
    <DashboardCard
      title='Продавцы'
      footer={<MoreLink />}
      className='min-h-[600px]'
      headerExtra={
        <FilterBadges
          filters={[...SELLER_FILTERS]}
          active={active}
          onChange={(i) => {
            setActive(i)
            onSort(SELLER_SORT_VALUES[i])
          }}
        />
      }
    >
      <div className='flex flex-col'>
        <div className='flex items-center gap-[8px] pb-[10px] max-lg:grid max-lg:grid-cols-[18px_1fr_1fr]'>
          <span className='w-[18px] shrink-0 text-[14px] leading-[18px] text-[#0E0F27]/50 max-lg:col-start-1 max-lg:row-start-1'>№</span>
          <span className='flex-[2] truncate text-[14px] leading-[18px] text-[#0E0F27]/50 max-lg:col-start-2 max-lg:row-start-1'>Название</span>
          {active === 0 && (
            <span className='flex-1 truncate text-[14px] leading-[18px] text-[#0E0F27]/50 max-lg:col-start-1 max-lg:row-start-2'>Рейтинг</span>
          )}
          {active === 1 && (
            <span className='flex-1 truncate text-[14px] leading-[18px] text-[#0E0F27]/50 max-lg:col-start-1 max-lg:row-start-2'>Выручка</span>
          )}
          <span className='line-clamp-2 flex-1 whitespace-pre-line text-left text-[14px] leading-[18px] text-[#0E0F27]/50 max-lg:col-start-2 max-lg:row-start-2'>
            {metricLabel}
          </span>
        </div>

        {state.data.slice(0, 6).map((s) => (
          <React.Fragment key={s.id}>
            <div className='h-px bg-[#F0F0F5]' />
            <div className='flex items-start gap-[8px] py-[10px] max-lg:grid max-lg:grid-cols-[18px_1fr_1fr] max-lg:gap-y-[4px]'>
              <span className='w-[18px] shrink-0 text-[14px] leading-[18px] text-[#0E0E27] max-lg:col-start-1 max-lg:row-start-1'>{s.id}</span>
              <span className='line-clamp-4 flex-[2] text-[14px] leading-[18px] text-[#0E0E27] max-lg:col-start-2 max-lg:row-start-1'>{s.name}</span>
              {active === 0 && (
                <span className='flex flex-1 items-center gap-[4px] max-lg:col-start-1 max-lg:row-start-2'>
                  <StarIcon />
                  <span className='text-[14px] leading-[18px] text-[#0E0E27]'>{s.rating || '—'}</span>
                </span>
              )}
              {active === 1 && (
                <span className='flex-1 text-[14px] leading-[18px] text-[#0E0F27] max-lg:col-start-1 max-lg:row-start-2'>{fmtMoney(s.revenue)}</span>
              )}
              <span className='line-clamp-2 flex-1 whitespace-pre-line text-left text-[14px] leading-[18px] text-[#0E0E27] max-lg:col-start-2 max-lg:row-start-2'>
                {active === 2 ? fmtNum(s.productCount) : fmtNum(s.orderCount)}
              </span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </DashboardCard>
  )
}

const COURIER_FILTERS = ['На линии', 'Заказы'] as const
const COURIER_SORT_VALUES = ['onShift', 'orders'] as const

function CouriersCard({ state, onSort }: { state: ReturnType<typeof useDashboardLists>['couriers']; onSort: (s: CouriersSort) => void }) {
  const [active, setActive] = React.useState(1)
  const onlineCount = state.data.filter((c) => c.onShift).length

  return (
    <DashboardCard
      title='Курьеры'
      footer={
        <div className='flex items-center justify-between'>
          <MoreLink />
          <span className='text-[14px] font-normal leading-none text-[#5BAF1F]'>На линии {onlineCount}</span>
        </div>
      }
      className='min-h-[600px]'
      headerExtra={
        <FilterBadges
          filters={[...COURIER_FILTERS]}
          active={active}
          onChange={(i) => {
            setActive(i)
            onSort(COURIER_SORT_VALUES[i])
          }}
        />
      }
    >
      <div className='flex flex-col'>
        <div className='flex items-center gap-[8px] pb-[10px] max-lg:grid max-lg:grid-cols-[18px_1fr_1fr]'>
          <span className='w-[18px] shrink-0 text-[14px] leading-[18px] text-[#0E0F27]/50 max-lg:col-start-1 max-lg:row-start-1'>№</span>
          <span className='flex-[2] truncate text-[14px] leading-[18px] text-[#0E0F27]/50 max-lg:col-start-2 max-lg:row-start-1'>Имя Ф.</span>
          <span className='flex-1 truncate text-[14px] leading-[18px] text-[#0E0F27]/50 max-lg:col-start-1 max-lg:row-start-2'>Заказов</span>
          <span className='flex-1 truncate text-[14px] leading-[18px] text-[#0E0F27]/50 max-lg:col-start-2 max-lg:row-start-2'>Доход</span>
          <span className='w-[8px] shrink-0 max-lg:hidden' />
        </div>

        {state.data.slice(0, 11).map((c) => (
          <React.Fragment key={c.id}>
            <div className='h-px bg-[#F0F0F5]' />
            <div className='flex items-start gap-[8px] py-[10px] max-lg:grid max-lg:grid-cols-[18px_1fr_1fr] max-lg:gap-y-[4px]'>
              <span className='w-[18px] shrink-0 text-[14px] leading-[18px] text-[#0E0E27] max-lg:col-start-1 max-lg:row-start-1'>{c.id}</span>
              <span className='line-clamp-4 flex-[2] text-[14px] leading-[18px] text-[#0E0E27] max-lg:col-start-2 max-lg:row-start-1'>{c.name}</span>
              <span className='flex-1 text-[14px] leading-[18px] text-[#0E0F27] max-lg:col-start-1 max-lg:row-start-2'>{fmtNum(c.orderCount)}</span>
              <span className='flex-1 text-[14px] leading-[18px] text-[#0E0F27] max-lg:col-start-2 max-lg:row-start-2'>{fmtMoney(c.income)}</span>
              <span
                className='mt-[5px] block h-[8px] w-[8px] shrink-0 rounded-full max-lg:col-start-3 max-lg:row-start-1 max-lg:justify-self-end'
                style={{ backgroundColor: c.onShift ? '#55CB00' : '#DDDDE2' }}
              />
            </div>
          </React.Fragment>
        ))}
      </div>
    </DashboardCard>
  )
}

function formatReviewDate(iso: string) {
  const d = new Date(iso)
  return `${d.getDate()} ${MONTHS_RU[d.getMonth()].slice(0, 3)}, ${String(d.getFullYear()).slice(2)}`
}

export const AdminDashboard = () => {
  const [createPromocodeOpen, setCreatePromocodeOpen] = React.useState(false)
  const { adminData } = useAuth()
  const isAdmin = adminData?.isAdmin ?? false
  const dashboard = useDashboardData({ skip: !isAdmin })
  const lists = useDashboardLists({ skip: !isAdmin })

  return (
    <Main className='bg-[#EDEDF4]'>
      <Content className='p-[16px] lg:p-[24px]'>
        <TopActionBar onCreatePromocode={() => setCreatePromocodeOpen(true)} />

        <CreatePromocodeSheet
          open={createPromocodeOpen}
          onClose={() => setCreatePromocodeOpen(false)}
        />

        <section className='mt-[24px]'>
          <h2 className='text-[14px] font-medium leading-none text-[#0E0E27]'>Основные</h2>

          <div className='mt-[12px] flex flex-col gap-[8px] lg:flex-row'>
            <div className='flex min-w-0 flex-1 flex-col gap-[8px]'>
              <div className='grid grid-cols-1 gap-[8px] sm:grid-cols-3'>
                <OrdersTodayCard today={dashboard.today} />
                <UsersQuarterCard stat={dashboard.usersQuarter} />
                <ClientsMonthCard clients={dashboard.clientsMonth} />
              </div>
              <OrdersChartCard
                title='График заказов за 30 дней'
                chart={dashboard.chart}
                chartTotals={dashboard.chartTotals}
                avgTimes={dashboard.avgTimes}
              />
            </div>

            <div className='flex flex-col gap-[8px] lg:w-[320px]'>
              <OperationalRevenueCard revenue={dashboard.revenue} className='flex-1' />
              <PaymentMethodsCard payments={dashboard.payments} />
            </div>
          </div>
        </section>

        <section className='mt-[24px]'>
          <h2 className='text-[14px] font-medium leading-none text-[#0E0E27]'>Дополнительные</h2>

          <div className='mt-[12px] grid grid-cols-1 gap-[8px] lg:grid-cols-3'>
            <ReviewsCard state={lists.reviews} onFilter={lists.fetchReviews} />
            <SellersCard state={lists.sellers} onSort={lists.fetchSellers} />
            <CouriersCard state={lists.couriers} onSort={lists.fetchCouriers} />
          </div>
        </section>
      </Content>
    </Main>
  )
}
