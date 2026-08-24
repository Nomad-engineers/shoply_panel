'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { AppShell, Main, Content, Sidebar } from '@/components/layout'
import { SidebarNav } from '@/components/layout/sidebar-nav'
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

const NOW = new Date()

const daysAgoLocal = (daysAgo: number) => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - daysAgo)
  return d
}

const fmtNum = (n: number | null | undefined) => (n == null ? '—' : n.toLocaleString('ru-RU'))

const fmtMoney = (n: number | null | undefined) => (n == null ? '—' : `${n.toLocaleString('ru-RU')} ₽`)

const fmtCompact = (n: number | null | undefined) => {
  if (n == null) return '—'
  if (n >= 1000000) return `${(n / 1000000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} млн`
  if (n >= 1000) return `${(n / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} к`
  return n.toLocaleString('ru-RU')
}

const fmtPct = (n: number | null | undefined) => (n == null ? '—' : `${n.toLocaleString('ru-RU', { maximumFractionDigits: 1 })}%`)

const fmtMinutes = (n: number | null | undefined) => (n == null ? '—' : `${Math.round(n)} мин`)

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
    <div className='flex gap-[10px] pt-[2px]'>
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

function TopActionBar() {
  return (
    <div className='flex items-center justify-between'>
      <div className='flex items-center gap-3'>
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
          className='flex items-center gap-[8px] rounded-full border border-[#E2E2EA] bg-white px-[16px] py-[10px] text-[14px] font-medium text-[#0E0E27] transition-colors hover:bg-[#F5F6F6]'
        >
          <TagPurpleIcon className='h-[24px] w-[24px]' />
          Создать промокод
        </button>
      </div>

      <span className='text-[28px] font-bold tracking-[-0.02em] text-[#0E0E27]'>{CURRENT_DATE_LABEL}</span>
    </div>
  )
}

function OrdersTodayCard({ today }: { today: DashboardStatusCounts | null }) {
  return (
    <DashboardCard title='Заказы сегодня'>
      <div className='flex items-start gap-[48px]'>
        <div className='flex flex-col'>
          <span className='text-[12px] leading-3.5 text-[#7F7F8A]'>В работе</span>
          <span className='mt-[2px] text-[32px] font-bold leading-[36px] tracking-[-0.02em] text-[#0E0E27]'>{fmtNum(today?.inWork)}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-[12px] leading-3.5 text-[#7F7F8A]'>Доставлено</span>
          <span className='mt-0.5 text-[20px] font-bold leading-7 text-[#0E0E27]'>{fmtNum(today?.delivered)}</span>
        </div>
        <div className='flex flex-col'>
          <span className='text-[12px] leading-3.5 text-[#7F7F8A]'>Отмен</span>
          <span className='mt-0.5 text-[20px] font-bold leading-7 text-[#0E0E27]'>{fmtNum(today?.cancelled)}</span>
        </div>
      </div>
      <div className='mt-[20px] flex gap-[4px] pb-[4px]'>
        <div className='flex w-[72px] flex-col justify-between rounded-[8px] border border-[#DCDCE6]/50 p-[8px]'>
          <div className='flex items-center gap-[4px]'>
            <svg width='18' height='18' viewBox='0 0 18 18' fill='none' aria-hidden='true'>
              <circle cx='9' cy='9' r='3.75' fill='#55CB00' />
            </svg>
            <span className='text-[14px] font-bold leading-none text-[#0E0E27]'>{fmtNum(today?.pending)}</span>
          </div>
          <span className='text-[11px] leading-none text-[#7F7F8A]'>Ожидание</span>
        </div>

        <div className='flex w-[72px] flex-col justify-between rounded-[8px] border border-[#DCDCE6]/50 p-[8px]'>
          <div className='flex items-center gap-[4px]'>
            <svg width='18' height='18' viewBox='0 0 18 18' fill='none' aria-hidden='true'>
              <path
                d='M8.87975 1.5C10.619 1.50021 12.0292 2.91106 12.0292 4.65039V5.25H13.4354C14.2192 5.25018 14.8705 5.85321 14.9305 6.63477L15.0506 8.19238C15.0824 8.60527 14.7731 8.96609 14.3602 8.99805C13.9474 9.02957 13.5874 8.72042 13.5555 8.30762L13.4354 6.75H4.32408V6.75098L3.75182 14.1924C3.71843 14.6279 4.0632 15 4.49986 15H8.24986C8.66394 15.0002 8.99986 15.3359 8.99986 15.75C8.99986 16.1641 8.66394 16.4998 8.24986 16.5H4.49986C3.18908 16.5 2.1567 15.384 2.2567 14.0781L2.82896 6.63574C2.8889 5.85373 3.53973 5.25013 4.32408 5.25H5.72936V4.65039C5.72936 2.91099 7.14037 1.50011 8.87975 1.5ZM15.7215 11.8828C15.9664 11.9306 16.1722 12.0974 16.2694 12.3271C16.7315 13.4203 16.5203 14.7333 15.6258 15.627L15.6268 15.6279C14.9067 16.3479 13.917 16.6148 12.996 16.457C12.5882 16.3869 12.3142 15.9997 12.3837 15.5918C12.4536 15.1835 12.8416 14.9086 13.2499 14.9785C13.7205 15.0591 14.211 14.9215 14.5663 14.5664L14.6454 14.4805C14.8346 14.2599 14.9485 13.9968 14.9891 13.7246C14.8694 13.691 14.7552 13.6303 14.661 13.5361C14.3684 13.2433 14.3684 12.7684 14.661 12.4756L15.0477 12.0889C15.224 11.9126 15.4768 11.8353 15.7215 11.8828ZM11.5194 11.2354C12.2706 10.578 13.2653 10.3691 14.1717 10.5771C14.5752 10.6699 14.8278 11.073 14.7352 11.4766C14.6483 11.8548 14.2889 12.0996 13.912 12.0527L13.6483 12.0088C13.209 11.9628 12.7626 12.1045 12.4335 12.4336C12.1968 12.6699 12.0548 12.9663 12.0087 13.2744C12.1288 13.3079 12.2432 13.3694 12.3378 13.4639C12.6305 13.7567 12.6305 14.2316 12.3378 14.5244L11.951 14.9121C11.7747 15.0883 11.5219 15.1648 11.2772 15.1172C11.0325 15.0694 10.8276 14.9033 10.7303 14.6738C10.2679 13.5805 10.4783 12.2669 11.3729 11.373L11.5194 11.2354ZM8.87975 3C7.9688 3.00011 7.22936 3.73942 7.22936 4.65039V5.25H10.5292V4.65039C10.5292 3.73948 9.7906 3.00021 8.87975 3Z'
                fill='#FFC400'
              />
            </svg>
            <span className='text-[14px] font-bold leading-none text-[#0E0E27]'>{fmtNum(today?.assembling)}</span>
          </div>
          <span className='text-[11px] leading-none text-[#7F7F8A]'>Сборка</span>
        </div>

        <div className='flex w-[72px] flex-col justify-between rounded-[8px] border border-[#DCDCE6]/50 p-[8px]'>
          <div className='flex items-center gap-[4px]'>
            <svg width='18' height='18' viewBox='0 0 18 18' fill='none' aria-hidden='true'>
              <path
                d='M13.5 16.5C11.8425 16.5 10.5 15.1568 10.5 13.5C10.5 11.8432 11.8425 10.5 13.5 10.5C15.1568 10.5 16.5 11.8432 16.5 13.5C16.5 15.1568 15.1568 16.5 13.5 16.5'
                stroke='#55CB00'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M8.25 15.75H3.75C2.92125 15.75 2.25 15.0788 2.25 14.25V6.375C2.25 5.754 2.754 5.25 3.375 5.25H13.125C13.746 5.25 14.25 5.754 14.25 6.375V8.25'
                stroke='#55CB00'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M5.25 5.0625V5.0625C5.25 3.50925 6.50925 2.25 8.0625 2.25H8.4375C9.99075 2.25 11.25 3.50925 11.25 5.0625V5.0625'
                stroke='#55CB00'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M11.25 5.0625V5.25'
                stroke='#55CB00'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M14.6699 12.9141L13.2112 14.3728L12.3359 13.4976'
                stroke='#55CB00'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <span className='text-[14px] font-bold leading-none text-[#0E0E27]'>{fmtNum(today?.ready)}</span>
          </div>
          <span className='text-[11px] leading-none text-[#7F7F8A]'>Готов</span>
        </div>

        <div className='flex w-[72px] flex-col justify-between rounded-[8px] border border-[#DCDCE6]/50 p-[8px]'>
          <div className='flex items-center gap-[4px]'>
            <svg width='18' height='18' viewBox='0 0 18 18' fill='none' aria-hidden='true'>
              <path
                d='M6.7525 11.2513C6.7525 12.9088 5.40879 14.2525 3.75125 14.2525C2.09371 14.2525 0.75 12.9088 0.75 11.2513C0.75 9.59372 2.09371 8.25001 3.75125 8.25001C4.27289 8.24901 4.78548 8.38622 5.23687 8.64768'
                stroke='#478EFF'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <circle
                cx='14.2591'
                cy='11.2512'
                r='3.00125'
                stroke='#478EFF'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M14.4463 6.36797C14.6951 6.36797 14.9336 6.26916 15.1095 6.09327C15.2854 5.91738 15.3842 5.67882 15.3842 5.43008V5.43008C15.3842 5.18133 15.2854 4.94278 15.1095 4.76689C14.9336 4.591 14.6951 4.49219 14.4463 4.49219H12.0078L14.2588 11.245'
                stroke='#478EFF'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                fillRule='evenodd'
                clipRule='evenodd'
                d='M3.75 11.2444H8.25187L12.0034 5.99219H6.75125L3.75 11.2444Z'
                stroke='#478EFF'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M5.25 4.11734H7.50094'
                stroke='#478EFF'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              <path
                d='M8.25094 11.2452L6 4.11719'
                stroke='#478EFF'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <span className='text-[14px] font-bold leading-none text-[#0E0E27]'>{fmtNum(today?.delivery)}</span>
          </div>
          <span className='text-[11px] leading-none text-[#7F7F8A]'>Доставка</span>
        </div>
      </div>
    </DashboardCard>
  )
}

function UsersQuarterCard({ stat }: { stat: DashboardUsersQuarter | null }) {
  return (
    <DashboardCard title='Пользователей (квартал)' footer={<MoreLink />}>
      <div className='flex items-start gap-[32px]'>
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
      <div className='flex items-start gap-[32px]'>
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

const OrdersChartLegend = () => (
  <div className='flex items-center gap-[16px]'>
    <span className='flex items-center gap-[6px] text-[12px] text-[#7F7F8A]'>
      <span className='block h-[14px] w-[14px] rounded-[8px] bg-[#55CB00]' />
      Выполнено
    </span>
    <span className='flex items-center gap-[6px] text-[12px] text-[#7F7F8A]'>
      <span className='block h-[14px] w-[14px] rounded-[8px] bg-[#F5462C]' />
      Отменено
    </span>
  </div>
)

function OrdersChartCard({
  chart,
  chartTotals,
  avgTimes,
}: {
  chart: DashboardDayStat[]
  chartTotals: ReturnType<typeof useDashboardData>['chartTotals']
  avgTimes: DashboardAvgTimes | null
}) {
  const todayDay = NOW.getDate()
  const chartData = chart.length
    ? chart
    : Array.from({ length: 30 }, (_, i) => {
        const d = daysAgoLocal(29 - i)
        return { date: '', day: d.getDate(), weekday: '', completed: 0, cancelled: 0, active: 0 }
      })
  const [hoveredDay, setHoveredDay] = React.useState<number | null>(null)
  const [tooltip, setTooltip] = React.useState<{ x: number; y: number; value: number } | null>(null)
  const barsRef = React.useRef<HTMLDivElement>(null)

  const chartMaxTotal = Math.max(1, ...chartData.map((d) => d.completed + d.cancelled))

  const activeDay = hoveredDay

  const handleSectionMove = (day: number, value: number, e: React.MouseEvent) => {
    const rect = barsRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = Math.min(Math.max(e.clientX - rect.left, 32), rect.width - 32)
    const y = Math.max(e.clientY - rect.top, 44)
    setHoveredDay(day)
    setTooltip({ x, y, value })
  }

  const handleChartLeave = () => {
    setHoveredDay(null)
    setTooltip(null)
  }

  return (
    <DashboardCard title='График заказов за 30 дней' footer={<OrdersChartLegend />}>
      <div className='flex items-start'>
        <div className='flex flex-1 min-w-0 flex-col'>
          <span className='text-[12px] leading-[14px] text-[#7F7F8A]'>Всего</span>
          <span className='mt-[2px] text-[28px] font-bold leading-[32px] tracking-[-0.02em] text-[#0E0E27]'>
            {fmtNum(chartTotals?.total)}
          </span>

        </div>
        <div className='flex flex-1 min-w-0 flex-col'>
          <span className='min-h-7 text-[12px] leading-3.5 text-[#7F7F8A]'>
            Доставлено
            <br />
            заказов
          </span>
          <span className='mt-[2px] text-[20px] font-bold leading-[28px] text-[#0E0E27]'>{fmtNum(chartTotals?.completed)}</span>

        </div>
        <div className='flex flex-1 min-w-0 flex-col'>
          <span className='min-h-[28px] text-[12px] leading-[14px] text-[#7F7F8A]'>
            Отмененные
            <br />
            заказы
          </span>
          <span className='mt-[2px] whitespace-nowrap text-[20px] font-bold leading-[28px] text-[#0E0E27]'>
            {chartTotals ? `${fmtNum(chartTotals.cancelled)} (${fmtPct(chartTotals.cancelledPercent)})` : '—'}
          </span>

        </div>
        <div className='flex flex-1 min-w-0 flex-col'>
          <span className='min-h-[28px] text-[12px] leading-[14px] text-[#7F7F8A]'>
            Частотность
            <br />
            заказов
          </span>
          <span className='mt-[2px] text-[20px] font-bold leading-[28px] text-[#0E0E27]'>
            {chartTotals ? chartTotals.ordersPerDay.toLocaleString('ru-RU') : '—'}
          </span>
        </div>
        <div className='flex flex-1 min-w-0 flex-col'>
          <span className='text-[12px] leading-[14px] text-[#7F7F8A]'>
            Среднее время
            <br />
            закрытия заказа
          </span>
          <span className='mt-[2px] text-[20px] font-bold leading-[28px] text-[#0E0E27]'>{fmtMinutes(avgTimes?.closeMinutes)}</span>
        </div>
        <div className='flex flex-1 min-w-0 flex-col'>
          <span className='min-h-[28px] text-[12px] leading-[14px] text-[#7F7F8A]'>
            Среднее время
            <br />
            доставки
          </span>
          <span className='mt-[2px] text-[20px] font-bold leading-[28px] text-[#0E0E27]'>{fmtMinutes(avgTimes?.deliveryMinutes)}</span>
        </div>
        <div className='flex flex-1 min-w-0 flex-col'>
          <span className='min-h-[28px] text-[12px] leading-[14px] text-[#7F7F8A]'>
            Среднее время
            <br />
            Сборки
          </span>
          <span className='mt-[2px] text-[20px] font-bold leading-[28px] text-[#0E0E27]'>{fmtMinutes(avgTimes?.assemblyMinutes)}</span>
        </div>
        <div className='flex flex-1 min-w-0 flex-col'>
          <span className='min-h-[28px] text-[12px] leading-[14px] text-[#7F7F8A]'>
            Среднее время
            <br />
            подтверждения
          </span>
          <span className='mt-[2px] text-[20px] font-bold leading-[28px] text-[#0E0E27]'>{fmtMinutes(avgTimes?.confirmMinutes)}</span>
        </div>
      </div>

      <div ref={barsRef} className='relative mt-[24px]' onMouseLeave={handleChartLeave}>
        <div className='flex items-end gap-[6px]'>
          {chartData.map((d) => {
            const total = d.completed + d.cancelled
            const totalPct = (total / chartMaxTotal) * 100
            const cancelledPct = total > 0 ? (d.cancelled / total) * 100 : 0
            const completedPct = total > 0 ? (d.completed / total) * 100 : 0
            const isActive = d.day === activeDay
            return (
              <div
                key={`${d.date}-${d.day}`}
                className='flex flex-1 cursor-pointer flex-col justify-end'
                style={{ height: '200px' }}
              >
                <div className='flex w-full flex-col gap-[2px]' style={{ height: `${totalPct}%` }}>
                  {d.cancelled > 0 && (
                    <div
                      className='w-full rounded-[8px]'
                      style={{
                        height: `${cancelledPct}%`,
                        backgroundColor: isActive ? '#F5462C' : '#AAAAB8',
                      }}
                      onMouseMove={(e) => handleSectionMove(d.day, d.cancelled, e)}
                    />
                  )}
                  <div
                    className='w-full rounded-[8px]'
                    style={{
                      height: `${completedPct}%`,
                      backgroundColor: isActive ? '#55CB00' : '#EEEEF4',
                    }}
                    onMouseMove={(e) => handleSectionMove(d.day, d.completed, e)}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {tooltip && (
          <div
            className='pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-[10px] bg-[#0E0E27] px-[12px] py-[6px] text-[13px] font-semibold text-white shadow-md'
            style={{ left: tooltip.x, top: tooltip.y - 12 }}
          >
            {tooltip.value}
          </div>
        )}
      </div>

      <div className='mt-[8px] flex gap-[6px]'>
        {chartData.map((d) => (
          <div key={d.day} className='flex flex-1 flex-col items-center'>
            <span className='text-[11px] leading-[16px] text-[#0E0E27]'>{d.day}</span>
            <span className='text-[10px] leading-[14px] text-[#A9A9B7]'>{d.weekday}</span>
            {d.day === todayDay && <div className='mt-[4px] h-px w-full rounded-[1px] bg-[#55CB00]' />}
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}

function OperationalRevenueCard({ revenue }: { revenue: DashboardRevenue | null }) {
  const items = [
    {
      label: 'Выплаты курьерам',
      value: revenue?.courierPayouts,
      color: '#6BA4F8',
    },
    {
      label: 'Доход компаний',
      value: revenue?.companyIncome,
      color: '#9747FF',
    },
    {
      label: 'Доход партнеров',
      value: revenue?.partnerIncome,
      color: '#E5A832',
    },
    {
      label: 'Оборот продавцов',
      value: revenue?.sellerTurnover,
      color: '#67C63C',
    },
  ]

  const percents =
    revenue && revenue.total > 0
      ? items.map((item) => Math.round(((item.value ?? 0) / revenue.total) * 100))
      : [25, 25, 25, 25]

  return (
    <DashboardCard title='Операционная выручка (месяц)' footer={<MoreLink />} className='flex-1'>
      <div className='flex h-full gap-[12px]'>
        <div className='flex-1 min-w-0 flex flex-col'>
          <span className='text-[12px] leading-[14px] text-[#7F7F8A]'>Всего</span>
          <div className='mt-[2px] text-[28px] font-bold leading-[32px] tracking-[-0.02em] text-[#0E0E27]'>
            {fmtMoney(revenue?.total)}
          </div>

          <div className='mt-[12px] flex flex-1 flex-col justify-center'>
            {items.map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <div className='my-[12px] h-px bg-[#F0F0F5]' />}
                <div className='flex flex-row gap-1.5'>
                  <span
                    className='inline-block h-[14px] w-[14px] rounded-[8px]'
                    style={{ backgroundColor: item.color }}
                  />
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-[6px]'>
                      <span className='text-[12px] text-[#7F7F8A]'>{item.label}</span>
                    </div>
                    <span className='mt-[1px] block font-[Inter_Tight] text-[14px] font-semibold leading-[16px] tracking-normal text-[#0E0F27]'>
                      {fmtMoney(item.value ?? null)}
                    </span>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className='flex h-full w-[90px] flex-shrink-0 flex-col gap-[2px]'>
          {items.map((item, i) => (
            <div
              key={item.label}
              className='flex min-h-[44px] items-center justify-center rounded-[8px]'
              style={{ backgroundColor: item.color, flex: Math.max(percents[i], 1) }}
            >
              <span className='text-center text-[12px] font-semibold leading-tight text-white'>
                {fmtCompact(item.value ?? null)}
                <br />
                {percents[i]}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  )
}

function PaymentMethodsCard({ payments }: { payments: DashboardPaymentMethods | null }) {
  const methods = [
    { label: 'Наличными', value: payments?.cash },
    { label: 'СБП', value: payments?.sbp },
    { label: 'Kaspi', value: payments?.kaspi },
  ]

  return (
    <DashboardCard title='Метод оплаты'>
      <div className='flex items-start gap-[32px]'>
        {methods.map((m) => (
          <div key={m.label} className='flex flex-col'>
            <span className='text-[14px] leading-[18px] text-[#0E0F27]/50'>{m.label}</span>
            <span className='mt-[2px] font-[Inter_Tight] text-[14px] font-semibold leading-[16px] text-[#0E0F27]'>
              {fmtNum(m.value ?? null)}
            </span>
          </div>
        ))}
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
        <div className='flex items-center gap-[8px] pb-[10px]'>
          <span className='w-[74px] shrink-0 text-[14px] leading-[18px] text-[#0E0F27]/50'>Дата</span>
          <span className='w-[70px] shrink-0 text-[14px] leading-[18px] text-[#0E0F27]/50'>Оценка</span>
          <span className='w-[92px] shrink-0 text-[14px] leading-[18px] text-[#0E0F27]/50'>Магазин</span>
          <span className='flex-1 truncate text-[14px] leading-[18px] text-[#0E0F27]/50'>Отзыв</span>
        </div>

        {state.data.map((r) => (
          <React.Fragment key={r.id}>
            <div className='h-px bg-[#F0F0F5]' />
            <div className='flex items-start gap-[8px] py-[10px]'>
              <span className='w-[74px] shrink-0 whitespace-nowrap text-[14px] leading-[18px] text-[#0E0F27]'>
                {formatReviewDate(r.createdAt)}
              </span>
              <span className='flex w-[70px] shrink-0 items-center gap-[4px]'>
                <StarIcon />
                <span className='text-[14px] leading-[18px] text-[#0E0F27]'>{r.rate}</span>
              </span>
              <span className='line-clamp-4 w-[92px] shrink-0 text-[14px] leading-[18px] text-[#0E0F27]'>
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
        <div className='flex items-center gap-[8px] pb-[10px]'>
          <span className='w-[18px] shrink-0 text-[14px] leading-[18px] text-[#0E0F27]/50'>№</span>
          <span className='flex-[2] truncate text-[14px] leading-[18px] text-[#0E0F27]/50'>Название</span>
          {active === 0 && (
            <span className='flex-1 truncate text-[14px] leading-[18px] text-[#0E0F27]/50'>Рейтинг</span>
          )}
          {active === 1 && (
            <span className='flex-1 truncate text-[14px] leading-[18px] text-[#0E0F27]/50'>Выручка</span>
          )}
          <span className='line-clamp-2 flex-1 whitespace-pre-line text-left text-[14px] leading-[18px] text-[#0E0F27]/50'>
            {metricLabel}
          </span>
        </div>

        {state.data.slice(0, 6).map((s) => (
          <React.Fragment key={s.id}>
            <div className='h-px bg-[#F0F0F5]' />
            <div className='flex items-start gap-[8px] py-[10px]'>
              <span className='w-[18px] shrink-0 text-[14px] leading-[18px] text-[#0E0E27]'>{s.id}</span>
              <span className='line-clamp-4 flex-[2] text-[14px] leading-[18px] text-[#0E0E27]'>{s.name}</span>
              {active === 0 && (
                <span className='flex flex-1 items-center gap-[4px]'>
                  <StarIcon />
                  <span className='text-[14px] leading-[18px] text-[#0E0E27]'>{s.rating || '—'}</span>
                </span>
              )}
              {active === 1 && (
                <span className='flex-1 text-[14px] leading-[18px] text-[#0E0F27]'>{fmtMoney(s.revenue)}</span>
              )}
              <span className='line-clamp-2 flex-1 whitespace-pre-line text-left text-[14px] leading-[18px] text-[#0E0E27]'>
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
        <div className='flex items-center gap-[8px] pb-[10px]'>
          <span className='w-[18px] shrink-0 text-[14px] leading-[18px] text-[#0E0F27]/50'>№</span>
          <span className='flex-[2] truncate text-[14px] leading-[18px] text-[#0E0F27]/50'>Имя Ф.</span>
          <span className='flex-1 truncate text-[14px] leading-[18px] text-[#0E0F27]/50'>Заказов</span>
          <span className='flex-1 truncate text-[14px] leading-[18px] text-[#0E0F27]/50'>Доход</span>
          <span className='w-[8px] shrink-0' />
        </div>

        {state.data.slice(0, 11).map((c) => (
          <React.Fragment key={c.id}>
            <div className='h-px bg-[#F0F0F5]' />
            <div className='flex items-start gap-[8px] py-[10px]'>
              <span className='w-[18px] shrink-0 text-[14px] leading-[18px] text-[#0E0E27]'>{c.id}</span>
              <span className='line-clamp-4 flex-[2] text-[14px] leading-[18px] text-[#0E0E27]'>{c.name}</span>
              <span className='flex-1 text-[14px] leading-[18px] text-[#0E0F27]'>{fmtNum(c.orderCount)}</span>
              <span className='flex-1 text-[14px] leading-[18px] text-[#0E0F27]'>{fmtMoney(c.income)}</span>
              <span
                className='mt-[5px] block h-[8px] w-[8px] shrink-0 rounded-full'
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
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const { adminData } = useAuth()
  const isAdmin = adminData?.isAdmin ?? false
  const dashboard = useDashboardData({ skip: !isAdmin })
  const lists = useDashboardLists({ skip: !isAdmin })

  return (
    <AppShell>
      <Sidebar isCollapsed={sidebarCollapsed}>
        <SidebarNav isCollapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)} />
      </Sidebar>
      <Main className='bg-[#EDEDF4]'>
        <Content className='p-[24px]'>
          <TopActionBar />

          <section className='mt-[24px]'>
            <h2 className='text-[14px] font-medium leading-none text-[#0E0E27]'>Основные</h2>

            <div className='mt-[12px] flex gap-[8px]'>
              <div className='flex-1 flex flex-col gap-[8px]'>
                <div className='grid grid-cols-3 gap-[8px]'>
                  <OrdersTodayCard today={dashboard.today} />
                  <UsersQuarterCard stat={dashboard.usersQuarter} />
                  <ClientsMonthCard clients={dashboard.clientsMonth} />
                </div>
                <OrdersChartCard
                  chart={dashboard.chart}
                  chartTotals={dashboard.chartTotals}
                  avgTimes={dashboard.avgTimes}
                />
              </div>

              <div className='flex w-[320px] flex-col gap-[8px]'>
                <OperationalRevenueCard revenue={dashboard.revenue} />
                <PaymentMethodsCard payments={dashboard.payments} />
              </div>
            </div>
          </section>

          <section className='mt-[24px]'>
            <h2 className='text-[14px] font-medium leading-none text-[#0E0E27]'>Дополнительные</h2>

            <div className='mt-[12px] grid grid-cols-3 gap-[8px]'>
              <ReviewsCard state={lists.reviews} onFilter={lists.fetchReviews} />
              <SellersCard state={lists.sellers} onSort={lists.fetchSellers} />
              <CouriersCard state={lists.couriers} onSort={lists.fetchCouriers} />
            </div>
          </section>
        </Content>
      </Main>
    </AppShell>
  )
}
