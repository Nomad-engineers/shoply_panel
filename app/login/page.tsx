'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/layout/login-form'
import { ShopSelection, type ShopOption } from '@/components/layout/shop-selection'
import { useAuth } from '@/components/hooks/useLogin'
import type { AuthProfile } from '@/types/auth'

type Step = 'form' | 'select'

function needsShopSelection(profile: AuthProfile): boolean {
  return profile.businesses.length > 1
}

function displayName(profile: AuthProfile): string {
  return [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Пользователь'
}

const LoginPage: React.FC = () => {
  const router = useRouter()
  const { setCurrentShopId, logout } = useAuth()

  const [step, setStep] = useState<Step>('form')
  const [profile, setProfile] = useState<AuthProfile | null>(null)
  const [shops, setShops] = useState<ShopOption[]>([])

  const redirectToDefault = (p: AuthProfile) => {
    router.push(p.isAdmin ? '/' : '/categories')
  }

  const handleSuccess = (p: AuthProfile) => {
    setProfile(p)

    if (needsShopSelection(p)) {
      setShops(p.businesses.map((b) => ({ id: b.id, name: b.name })))
      setStep('select')
    } else {
      redirectToDefault(p)
    }
  }

  const handleConfirm = (shopId: number) => {
    setCurrentShopId(shopId)
    if (profile) redirectToDefault(profile)
  }

  const handleLogout = () => {
    setStep('form')
    setProfile(null)
    setShops([])
    logout()
  }

  return (
    <main className='flex min-h-screen items-center justify-center bg-[#EDEDF4] p-[24px]'>
      <div className='w-full max-w-[480px]'>
        <section
          className='rounded-[26px] bg-white p-[18px] shadow-[0_18px_42px_rgba(17,23,41,0.08)]'
          aria-labelledby='login-title'
        >
          {step === 'form' ? (
            <LoginForm onSuccess={handleSuccess} />
          ) : (
            <ShopSelection
              userName={profile ? displayName(profile) : ''}
              shops={shops}
              initialShopId={profile?.shopId ?? null}
              onConfirm={handleConfirm}
              onLogout={handleLogout}
            />
          )}
        </section>

        <footer className='mt-[24px] flex flex-col gap-[10px]'>
          <Image src='/footer-logo-mark.svg' alt='Shoply' width={93} height={16} className='block h-[16px] w-[93px]' />
          <p className='text-[12px] font-normal leading-[14px] text-[#0E0F27]/50'>
            Все авторские права защищены
            <br />
            2024-2026 ©
          </p>
        </footer>
      </div>
    </main>
  )
}

export default LoginPage
