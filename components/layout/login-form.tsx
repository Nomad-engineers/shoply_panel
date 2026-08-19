'use client'

import * as React from 'react'
import Image from 'next/image'
import { useState } from 'react'

import { useAuth } from '../hooks/useLogin'
import type { AuthProfile } from '@/types/auth'

const inputBase =
  'h-[48px] w-full rounded-[8px] border border-[#DCDCE6]! bg-[#F8F8FA] px-[12px] text-[14px] font-normal text-[#0E0E27] outline-none placeholder:font-normal placeholder:text-[#A9A9B7]'

interface LoginFormProps {
  onSuccess?: (profile: AuthProfile) => void
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { login, loading, error } = useAuth()
  const [form, setForm] = useState({ identifier: '', password: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const profile = await login(form)
    if (profile) onSuccess?.(profile)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault()
      e.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <form onSubmit={handleSubmit} method='post' autoComplete='on'>
      <Image
        src='/shoply-logo.svg'
        alt='Shoply Panel'
        width={147}
        height={48}
        priority
        className='block h-[48px] w-[147px]'
      />

      <h1 className='mt-[24px] text-[20px] font-semibold leading-none tracking-[-0.02em] text-[#0E0E27]'>
        Авторизация
      </h1>

      <div className='mt-[24px] flex flex-col gap-[8px]'>
        <div>
          <label
            htmlFor='identifier'
            className='mb-[8px] block text-[12px] font-normal leading-[14px] text-[#0E0F27]/50'
          >
            Почта или ID
          </label>
          <div className='relative'>
            <input
              id='identifier'
              type='text'
              name='identifier'
              value={form.identifier}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder='Почта или ID'
              autoComplete='username'
              dir='ltr'
              required
              className={`${inputBase} pr-[48px] ${error ? 'bg-[#FEEFEC]' : ''}`}
            />
            <Image
              src='/icon-user.svg'
              alt=''
              width={24}
              height={24}
              aria-hidden='true'
              className='pointer-events-none absolute right-[12px] top-1/2 h-[24px] w-[24px] -translate-y-1/2'
            />
          </div>
        </div>

        <div>
          <div className='relative'>
            <input
              id='password'
              type='password'
              name='password'
              value={form.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder='Пароль'
              autoComplete='current-password'
              required
              className={`${inputBase} pr-[48px] ${error ? 'bg-[#FEEFEC]' : ''}`}
            />
            <Image
              src='/icon-key.svg'
              alt=''
              width={24}
              height={24}
              aria-hidden='true'
              className='pointer-events-none absolute right-[12px] top-1/2 h-[24px] w-[24px] -translate-y-1/2'
            />
          </div>
        </div>
      </div>

      {error && (
        <p
          className='mt-[10px] rounded-[8px] bg-[#F4462B]/10 px-[12px] py-[8px] text-[13px] font-medium text-[#F4462B]'
          role='alert'
        >
          {error}
        </p>
      )}

      <button
        type='submit'
        disabled={loading}
        className='mt-[24px] flex h-[42px] w-full cursor-pointer items-center justify-center rounded-[8px] bg-[#9747FF] text-[14px] font-medium text-white transition-colors hover:bg-[#8538F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9747FF]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'
      >
        {loading ? 'Вход...' : 'Войти'}
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
    </form>
  )
}
