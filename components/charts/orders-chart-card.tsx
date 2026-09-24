'use client'

import * as React from 'react'

import { DashboardCard } from '@/components/admin/dashboard-card'
import type {
  DashboardAvgTimes,
  DashboardChart,
  DashboardDayStat,
} from '@/components/hooks/useDashboardData'

const fmtNum = (n: number | null | undefined) => (n == null ? '—' : n.toLocaleString('ru-RU'))

const fmtPct = (n: number | null | undefined) => (n == null ? '—' : `${n.toLocaleString('ru-RU', { maximumFractionDigits: 1 })}%`)

const fmtMinutes = (n: number | null | undefined) => (n == null ? '—' : `${Math.round(n)} мин`)

const daysAgoLocal = (daysAgo: number) => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - daysAgo)
  return d
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

interface OrdersChartCardProps {
  title: string
  chart: DashboardDayStat[]
  chartTotals: DashboardChart | null
  avgTimes?: DashboardAvgTimes | null
  daysCount?: number
  className?: string
}

export function OrdersChartCard({
  title,
  chart,
  chartTotals,
  avgTimes,
  daysCount = 30,
  className,
}: OrdersChartCardProps) {
  const todayDay = new Date().getDate()
  const chartData = chart.length
    ? chart
    : Array.from({ length: daysCount }, (_, i) => {
        const d = daysAgoLocal(daysCount - 1 - i)
        return { date: '', day: d.getDate(), weekday: '', completed: 0, cancelled: 0, active: 0 }
      })
  const [hoveredDay, setHoveredDay] = React.useState<number | null>(null)
  const [tooltip, setTooltip] = React.useState<{ x: number; y: number; value: number } | null>(null)
  const barsRef = React.useRef<HTMLDivElement>(null)

  const chartMaxTotal = Math.max(1, ...chartData.map((d) => d.completed + d.cancelled))

  const activeDay = hoveredDay

  const handleSectionMove = (day: number, value: number, e: React.MouseEvent | React.TouchEvent) => {
    const rect = barsRef.current?.getBoundingClientRect()
    if (!rect) return
    const point = 'touches' in e ? e.touches[0] : e
    if (!point) return
    const x = Math.min(Math.max(point.clientX - rect.left, 32), rect.width - 32)
    const y = Math.max(point.clientY - rect.top, 44)
    setHoveredDay(day)
    setTooltip({ x, y, value })
  }

  const handleChartLeave = () => {
    setHoveredDay(null)
    setTooltip(null)
  }

  const showAvgTimes = avgTimes !== undefined

  return (
    <DashboardCard title={title} footer={<OrdersChartLegend />} className={className}>
      <div className='grid grid-cols-2 gap-x-[16px] gap-y-[12px] sm:grid-cols-4 lg:flex lg:items-start'>
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
        {showAvgTimes && (
          <>
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
          </>
        )}
      </div>

      <div ref={barsRef} className='relative mt-[24px]' onMouseLeave={handleChartLeave} onTouchEnd={handleChartLeave}>
        <div className='flex items-end gap-[3px] lg:gap-[6px]'>
          {chartData.map((d) => {
            const total = d.completed + d.cancelled
            const totalPct = (total / chartMaxTotal) * 100
            const cancelledPct = total > 0 ? (d.cancelled / total) * 100 : 0
            const completedPct = total > 0 ? (d.completed / total) * 100 : 0
            const isActive = d.day === activeDay
            return (
              <div
                key={`${d.date}-${d.day}`}
                className='flex h-[140px] flex-1 cursor-pointer flex-col justify-end lg:h-[200px]'
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
                      onTouchMove={(e) => handleSectionMove(d.day, d.cancelled, e)}
                    />
                  )}
                  <div
                    className='w-full rounded-[8px]'
                    style={{
                      height: `${completedPct}%`,
                      backgroundColor: isActive ? '#55CB00' : '#EEEEF4',
                    }}
                    onMouseMove={(e) => handleSectionMove(d.day, d.completed, e)}
                    onTouchMove={(e) => handleSectionMove(d.day, d.completed, e)}
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

      <div className='mt-[8px] flex gap-[3px] lg:gap-[6px]'>
        {chartData.map((d, i) => (
          <div key={d.day} className='flex flex-1 flex-col items-center'>
            <span className={`text-[11px] leading-[16px] text-[#0E0E27] ${i % 2 === 1 ? 'max-lg:hidden' : ''}`}>{d.day}</span>
            <span className='hidden text-[10px] leading-[14px] text-[#A9A9B7] lg:block'>{d.weekday}</span>
            {d.day === todayDay && <div className='mt-[4px] h-px w-full rounded-[1px] bg-[#55CB00]' />}
          </div>
        ))}
      </div>
    </DashboardCard>
  )
}
