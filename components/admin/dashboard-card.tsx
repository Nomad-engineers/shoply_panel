'use client'

import * as React from 'react'

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg width='18' height='18' viewBox='0 0 18 18' fill='none' className={className} aria-hidden='true'>
      <path
        d='M8.99925 6C8.89575 6 8.81175 6.084 8.8125 6.1875C8.8125 6.291 8.8965 6.375 9 6.375C9.1035 6.375 9.1875 6.291 9.1875 6.1875C9.1875 6.084 9.1035 6 8.99925 6'
        stroke='#09091D'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M9 15.75V15.75C5.27175 15.75 2.25 12.7283 2.25 9V9C2.25 5.27175 5.27175 2.25 9 2.25V2.25C12.7283 2.25 15.75 5.27175 15.75 9V9C15.75 12.7283 12.7283 15.75 9 15.75Z'
        stroke='#09091D'
        strokeWidth='1.5'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path d='M9 9V12.75' stroke='#09091D' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  )
}

interface DashboardCardProps {
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  headerExtra?: React.ReactNode
  className?: string
}

export function DashboardCard({ title, children, footer, headerExtra, className }: DashboardCardProps) {
  return (
    <div className={`flex flex-col gap-[10px] rounded-[18px] bg-white p-[12px] ${className ?? ''}`}>
      <div className='flex items-center justify-between'>
        <span className='text-[12px] font-normal leading-[14px] text-[#7F7F8A]'>{title}</span>
        <InfoIcon className='h-[18px] w-[18px]' />
      </div>
      {headerExtra && <div>{headerExtra}</div>}
      <div className='h-px bg-[#F0F0F5]' />
      <div className='flex-1'>{children}</div>
      {footer && (
        <>
          <div className='h-px bg-[#F0F0F5]' />
          <div>{footer}</div>
        </>
      )}
    </div>
  )
}
