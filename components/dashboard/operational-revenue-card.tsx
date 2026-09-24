'use client'

import * as React from 'react'
import { DashboardCard } from '@/components/admin/dashboard-card'
import type { DashboardRevenue } from '@/components/hooks/useDashboardData'

const fmtMoney = (n: number | null | undefined) => (n == null ? '—' : `${n.toLocaleString('ru-RU')} ₽`)

const fmtCompact = (n: number | null | undefined) => {
  if (n == null) return '—'
  if (n >= 1000000) return `${(n / 1000000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} млн`
  if (n >= 1000) return `${(n / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 1 })} к`
  return n.toLocaleString('ru-RU')
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

export function OperationalRevenueCard({
  revenue,
  className,
}: {
  revenue: DashboardRevenue | null
  className?: string
}) {
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
    <DashboardCard title='Операционная выручка (месяц)' footer={<MoreLink />} className={className}>
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

        <div className='flex h-full w-[64px] flex-shrink-0 flex-col gap-[2px] lg:w-[90px]'>
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
