'use client'

import * as React from 'react'
import { useState } from 'react'

import { ShoplyLogo } from '@/components/icons/ShoplyLogo'

export interface ShopOption {
  id: number
  name: string
}

interface ShopSelectionProps {
  userName: string
  shops: ShopOption[]
  initialShopId?: number | null
  loading?: boolean
  onConfirm: (shopId: number) => void
  onLogout: () => void
}

export const ShopSelection = ({
  userName,
  shops,
  initialShopId,
  loading = false,
  onConfirm,
  onLogout,
}: ShopSelectionProps) => {
  const [selectedId, setSelectedId] = useState<number | null>(
    initialShopId ?? shops[0]?.id ?? null,
  )

  return (
    <div>
      <ShoplyLogo className='block h-[48px] w-[147px]' />

      <div className='mt-[24px]'>
        <h1 className='m-0 text-[20px] font-semibold leading-none tracking-[-0.02em] text-[#0E0E27]'>
          Добро пожаловать
        </h1>
        <p className='m-0 mt-[8px] text-[28px] font-bold leading-none tracking-[-0.02em] text-[#0E0E27]'>
          {userName}
        </p>
        <button
          type='button'
          onClick={onLogout}
          className='mt-[8px] cursor-pointer border-0 bg-transparent p-0 text-[14px] font-semibold leading-none text-[#F4462B] transition-opacity hover:opacity-80'
        >
          Выйти
        </button>
      </div>

      <div className='mt-[24px]'>
        <label className='block text-[12px] font-normal leading-none text-[#0E0E27]'>
          Выберите магазин
        </label>

        <div className='mt-[8px] flex flex-col gap-[8px]'>
          {loading ? (
            <p className='py-[12px] text-[14px] text-[#7F7F8A]'>Загрузка магазинов…</p>
          ) : shops.length === 0 ? (
            <p className='py-[12px] text-[14px] text-[#7F7F8A]'>Нет доступных магазинов.</p>
          ) : (
            shops.map((shop) => {
              const isSelected = shop.id === selectedId
              return (
                <button
                  key={shop.id}
                  type='button'
                  onClick={() => setSelectedId(shop.id)}
                  className='flex h-[42px] w-full cursor-pointer items-center rounded-[8px] border-0 bg-transparent px-[12px] text-left transition-colors hover:bg-[#F8F8FA] focus-visible:outline-none focus-visible:bg-[#F8F8FA]'
                >
                  <span className='flex-1 truncate text-[14px] font-normal text-[#0E0E27]'>
                    {shop.name}
                  </span>
                  <span
                    aria-hidden='true'
                    className={`grid h-[18px] w-[18px] place-items-center rounded-full border transition-colors ${
                      isSelected
                        ? 'border-[#55CB00] bg-[#55CB00]'
                        : 'border-[#E2E2EA] bg-transparent'
                    }`}
                  >
                    {isSelected && (
                      <span className='block h-[8px] w-[8px] rounded-full bg-white' />
                    )}
                  </span>
                </button>
              )
            })
          )}
        </div>
      </div>

      <button
        type='button'
        disabled={selectedId === null || loading}
        onClick={() => selectedId !== null && onConfirm(selectedId)}
        className='mt-[24px] flex h-[42px] w-full cursor-pointer items-center justify-center rounded-[8px] bg-[#9747FF] text-[14px] font-medium text-white transition-colors hover:bg-[#8538F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9747FF]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
      >
        Войти
      </button>

      <div className='mt-[24px]'>
        <a
          href='mailto:support@mail.ru'
          className='text-[14px] font-normal text-[#5BAE1F] transition-colors hover:text-[#4A9519]'
        >
          support@mail.ru
        </a>
        <p className='mt-[2px] text-[14px] font-normal leading-none text-[#7F7F8A]'>
          Почта для обращения в службу поддержки
        </p>
      </div>
    </div>
  )
}
