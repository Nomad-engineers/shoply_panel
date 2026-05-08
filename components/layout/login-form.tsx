'use client'

import * as React from 'react'
import { Eye, EyeOff, Mail, ShieldCheck } from 'lucide-react'
import { useState } from 'react'

import { useAuth } from '../hooks/useLogin'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

export const LoginForm = () => {
  const { login, loading, error } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(form)
  }

  return (
    <form onSubmit={handleSubmit} method='post' autoComplete='on'>
      <div className='mb-[34px] flex items-center justify-center gap-3 text-left'>
        <div className='grid h-11 w-11 place-items-center rounded-[15px] bg-[linear-gradient(145deg,#55CB00,#67C63C)] text-xl font-black tracking-[-0.05em] text-white shadow-[0_12px_24px_rgba(85,203,0,0.22)]'>
          S
        </div>
        <div>
          <p className='m-0 text-[17px] font-[850] leading-none tracking-[-0.04em] text-[#111322]'>Shoply Panel</p>
          <div className='mt-1 text-xs font-semibold text-[#7F7F8A]'>Панель управления магазином</div>
        </div>
      </div>

      <div className='mb-[30px] text-center'>
        <div className='mb-3.5 inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.08em] text-[#67C63C]'>
          <span className='h-[7px] w-[7px] rounded-full bg-[#55CB00] shadow-[0_0_0_5px_#EEF9E8]' />
          Защищённый вход
        </div>
        <h1
          id='login-title'
          className='m-0 text-[32px] font-[850] leading-[1.06] tracking-[-0.045em] text-[#111322] max-[560px]:text-[28px]'
        >
          Вход в Shoply Panel
        </h1>
        <p className='mx-auto mt-3 max-w-[360px] text-[15px] font-medium leading-[1.55] text-[#7F7F8A]'>
          Используйте рабочую почту и пароль, чтобы перейти к заказам, товарам и отчётам магазина.
        </p>
      </div>

      <div className='grid gap-[18px]'>
        <div>
          <label htmlFor='email' className='mb-2 flex justify-between text-[13px] font-bold text-[#17171C]'>
            Email
          </label>
          <Input
            id='email'
            type='email'
            name='email'
            value={form.email}
            onChange={handleChange}
            placeholder='manager@shoply.kz'
            autoComplete='email'
            dir='ltr'
            icon={<Mail className='h-5 w-5' aria-hidden='true' />}
            iconPosition='right'
            error={!!error}
            className='h-[54px] rounded-[14px] border-[#ECECF3] bg-[#FAFAFC] py-0 pl-4 pr-12 text-[15px] font-semibold tracking-[-0.01em] text-[#111322] placeholder:text-[#9696A0] placeholder:font-medium focus-visible:border-[#55CB00] focus-visible:bg-white focus-visible:ring-[4px] focus-visible:ring-[rgba(85,203,0,0.13)] focus-visible:ring-offset-0'
            required
          />
        </div>

        <div>
          <label htmlFor='password' className='mb-2 flex justify-between text-[13px] font-bold text-[#17171C]'>
            Пароль
          </label>
          <div className='relative'>
            <Input
              id='password'
              type={showPassword ? 'text' : 'password'}
              name='password'
              value={form.password}
              onChange={handleChange}
              placeholder='Введите пароль'
              autoComplete='current-password'
              error={!!error}
              className='h-[54px] rounded-[14px] border-[#ECECF3] bg-[#FAFAFC] py-0 pl-4 pr-12 text-[15px] font-semibold tracking-[-0.01em] text-[#111322] placeholder:text-[#9696A0] placeholder:font-medium focus-visible:border-[#55CB00] focus-visible:bg-white focus-visible:ring-[4px] focus-visible:ring-[rgba(85,203,0,0.13)] focus-visible:ring-offset-0'
              required
            />
            <button
              type='button'
              className='absolute right-3 top-1/2 grid h-[30px] w-[30px] -translate-y-1/2 cursor-pointer place-items-center rounded-[10px] text-[#7F7F8A] hover:bg-[#F5F5F8] hover:text-[#111322] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#55CB00] focus-visible:ring-offset-2'
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              onClick={() => setShowPassword((value) => !value)}
            >
              {showPassword ? (
                <EyeOff className='h-[18px] w-[18px]' aria-hidden='true' />
              ) : (
                <Eye className='h-[18px] w-[18px]' aria-hidden='true' />
              )}
            </button>
          </div>
        </div>

        <div className='my-0.5 flex items-center justify-between gap-4 max-[560px]:flex-col max-[560px]:items-start'>
          <label className='inline-flex cursor-pointer select-none items-center gap-2.5 text-[13px] font-bold text-[#17171C]'>
            <input
              type='checkbox'
              name='remember'
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className='sr-only'
            />
            <span
              className='grid h-5 w-5 cursor-pointer place-items-center rounded-[7px] border border-[#E2E2EA] bg-white data-[checked=true]:border-[#55CB00] data-[checked=true]:bg-[#55CB00] data-[checked=true]:shadow-[0_0_0_4px_#EEF9E8]'
              data-checked={remember}
            >
              <span
                className='h-[5px] w-2 rotate-[-45deg] border-b-2 border-l-2 border-white opacity-0 data-[checked=true]:opacity-100'
                data-checked={remember}
              />
            </span>
            Запомнить меня
          </label>
          <a
            href='#'
            onClick={(event) => event.preventDefault()}
            className='cursor-pointer text-[13px] font-bold text-[#111322] hover:text-[#67C63C]'
          >
            Забыли пароль?
          </a>
        </div>

        {error && (
          <p className='rounded-[12px] bg-[#E26D5C]/10 px-3 py-2 text-sm font-semibold text-[#E26D5C]' role='alert'>
            {error}
          </p>
        )}

        <Button
          type='submit'
          variant='success'
          size='default'
          className='mt-1.5 h-14 w-full gap-2.5 rounded-[16px] border-0 bg-[linear-gradient(145deg,#55CB00,#67C63C)] text-[15px] font-[850] tracking-[-0.01em] text-white shadow-[0_12px_24px_rgba(85,203,0,0.22)] transition-[transform,box-shadow,filter] hover:-translate-y-px hover:bg-[linear-gradient(145deg,#55CB00,#67C63C)] hover:shadow-[0_16px_30px_rgba(85,203,0,0.25)] hover:saturate-[1.08] active:translate-y-0 active:shadow-[0_8px_16px_rgba(85,203,0,0.2)] disabled:translate-y-0 disabled:shadow-[0_12px_24px_rgba(85,203,0,0.22)]'
          disabled={loading}
        >
          {loading ? 'Вход...' : 'Войти'}
          <span className='h-[7px] w-[7px] rotate-45 border-r-2 border-t-2 border-white' aria-hidden='true' />
        </Button>
      </div>

      <div className='mt-5 flex gap-2.5 rounded-[16px] border border-[#ECECF3] bg-[#F5F5F8] p-3.5 text-xs font-semibold leading-[1.45] text-[#7F7F8A]'>
        <ShieldCheck className='h-5 w-[18px] flex-none text-[#67C63C]' aria-hidden='true' />
        <span>Доступ только для сотрудников и партнёров Shoply. Все входы логируются для безопасности магазина.</span>
      </div>
    </form>
  )
}
