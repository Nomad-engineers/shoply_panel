'use client'

import { DashboardCard } from '@/components/admin/dashboard-card'
import type { DashboardPaymentMethods } from '@/components/hooks/useDashboardData'

const fmtNum = (n: number | null | undefined) => (n == null ? '—' : n.toLocaleString('ru-RU'))

export function PaymentMethodsCard({
  payments,
  className,
}: {
  payments: DashboardPaymentMethods | null
  className?: string
}) {
  const methods = [
    { label: 'Наличными', value: payments?.cash },
    { label: 'СБП', value: payments?.sbp },
    { label: 'Kaspi', value: payments?.kaspi },
  ]

  return (
    <DashboardCard title='Метод оплаты' className={className}>
      <div className='flex flex-wrap items-start gap-x-[24px] gap-y-[12px] lg:gap-x-[32px]'>
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
