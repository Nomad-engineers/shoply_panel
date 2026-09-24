'use client'

import { DashboardCard } from '@/components/admin/dashboard-card'
import type { DashboardStatusCounts } from '@/components/hooks/useDashboardData'

const fmtNum = (n: number | null | undefined) => (n == null ? '—' : n.toLocaleString('ru-RU'))

export function OrdersTodayCard({
  today,
  className,
}: {
  today: DashboardStatusCounts | null
  className?: string
}) {
  return (
    <DashboardCard title='Заказы сегодня' className={className}>
      <div className='flex flex-wrap items-start gap-x-[32px] gap-y-[12px] lg:gap-[48px]'>
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
      <div className='mt-[20px] grid grid-cols-2 gap-[4px] pb-[4px] min-[420px]:grid-cols-4'>
        <div className='flex flex-col justify-between gap-[6px] rounded-[8px] border border-[#DCDCE6]/50 p-[8px]'>
          <div className='flex items-center gap-[4px]'>
            <svg width='18' height='18' viewBox='0 0 18 18' fill='none' aria-hidden='true'>
              <circle cx='9' cy='9' r='3.75' fill='#55CB00' />
            </svg>
            <span className='text-[14px] font-bold leading-none text-[#0E0E27]'>{fmtNum(today?.pending)}</span>
          </div>
          <span className='text-[11px] leading-none text-[#7F7F8A]'>Ожидание</span>
        </div>

        <div className='flex flex-col justify-between gap-[6px] rounded-[8px] border border-[#DCDCE6]/50 p-[8px]'>
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

        <div className='flex flex-col justify-between gap-[6px] rounded-[8px] border border-[#DCDCE6]/50 p-[8px]'>
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

        <div className='flex flex-col justify-between gap-[6px] rounded-[8px] border border-[#DCDCE6]/50 p-[8px]'>
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
