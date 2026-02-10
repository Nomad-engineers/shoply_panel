'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from "@/lib/theme";
import { ProductIcon, ShopIcon } from '@/components/layout/icons'; 
import { Button, Spinner } from '@/components/ui'; 
import { CheckCircle2, AlertCircle, FileSpreadsheet, X, ChevronDown, Info } from 'lucide-react';
import { useAuth } from '@/components/hooks/useLogin';
import { useShops } from '@/components/hooks/useShops';

type UploadMode = 'products' | 'prices';

export default function ProductPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<UploadMode>('products');
  const [selectedShopId, setSelectedShopId] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const url = process.env.NEXT_PUBLIC_API_URL;

  const { adminData, loading: authLoading, refreshSession, fetchWithSession } = useAuth(
    process.env.NEXT_PUBLIC_DIRECTUS_URL,
  );

  const { shopsStats } = useShops();
  const userShopId = useMemo(() => {
    return adminData?.shop?.id ?? adminData?.shopId ?? adminData?.shop_id;
  }, [adminData]);

  const isAdmin = adminData?.isAdmin;

  const shopId = isAdmin ? selectedShopId : userShopId;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFile(acceptedFiles[0]);
    setStatus(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
  });

  const sendFileToServer = async () => {
    if (!file) return;

    if (isAdmin && !selectedShopId) {
      setStatus({ type: 'error', msg: 'Выберите магазин' });
      return;
    }

    if (!isAdmin && !userShopId) {
      setStatus({ type: 'error', msg: 'У вашего аккаунта нет привязанного магазина' });
      return;
    }

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('shopId', shopId); 

    const endpoint = mode === 'products' ? `/panel/shop/${shopId}/products` : `/panel/shop/${shopId}/products/prices`;

    try {
      const response = await fetchWithSession(
        `${url}${endpoint}`,
        () => localStorage.getItem('access_token'),
        refreshSession,
        { method: 'POST', body: formData },
      );

      const result = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', msg: result.message || 'Синхронизация успешна!' });
        setFile(null);
      } else {
        setStatus({ type: 'error', msg: result.message || 'Ошибка сервера' });
      }
    } catch (error) {
      setStatus({ type: 'error', msg: 'Ошибка сети' });
    } finally {
      setLoading(false);
    }
  };

  // Пока грузится профиль, показываем спиннер
  if (authLoading) return <div className="flex justify-center p-20"><Spinner /></div>;

  return (
    <div className="mx-auto p-6 space-y-8 bg-white rounded-3xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Управление данными</h1>
        <p className="text-gray-500">Загрузка номенклатуры и обновление прайс-листов</p>
      </div>

      {/* Переключатель режимов */}
      <div className="flex p-1.5 bg-gray-100 rounded-2xl w-fit">
        <button
          onClick={() => { setMode('products'); setStatus(null); }}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
            mode === 'products' ? "bg-white text-primary-main shadow-sm" : "text-gray-500"
          )}
        >
          <ProductIcon className="w-5 h-5" />
          Номенклатура
        </button>
        <button
          onClick={() => { setMode('prices'); setStatus(null); }}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all",
            mode === 'prices' ? "bg-white text-primary-main shadow-sm" : "text-gray-500"
          )}
        >
          <ShopIcon className="w-5 h-5" />
          Прайс-лист
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div
            {...getRootProps()}
            className={cn(
              "relative border-2 border-dashed rounded-[32px] p-16 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer",
              isDragActive ? "border-primary-main bg-primary-main/5" : "border-gray-200 bg-white hover:border-primary-main/30",
              file && "border-solid border-primary-main/20 bg-primary-main/5"
            )}
          >
            <input {...getInputProps()} />
            <div className="p-5 bg-gray-50 rounded-2xl text-primary-main">
              <FileSpreadsheet className="w-12 h-12" />
            </div>
            <div className="text-center">
              {file ? (
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-100">
                  <span className="font-semibold text-gray-900">{file.name}</span>
                  <X className="w-4 h-4 text-red-400" onClick={(e) => { e.stopPropagation(); setFile(null); }} />
                </div>
              ) : (
                <p className="text-gray-900 font-semibold">Выберите .xlsx файл</p>
              )}
            </div>
          </div>

          <Button
            onClick={sendFileToServer}
            disabled={!file || loading}
            className="w-full h-14 rounded-2xl text-lg font-bold"
          >
            {loading ? <Spinner className="mr-2" /> : 'Начать синхронизацию'}
          </Button>

          {status && (
            <div className={cn(
              "p-4 rounded-2xl flex items-center gap-3",
              status.type === 'success' ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            )}>
              {status.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}
              <span className="text-sm font-medium">{status.msg}</span>
            </div>
          )}
        </div>

        {/* Сайдбар конфигурации */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 space-y-4">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 text-xs uppercase tracking-widest">
              <Info className="w-4 h-4 text-primary-main" />
              Конфигурация
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase ml-1">Магазин назначения</label>
                {isAdmin ? (
                  <div className="relative">
                    <select 
                      value={selectedShopId}
                      onChange={(e) => setSelectedShopId(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm appearance-none focus:ring-2 focus:ring-primary-main outline-none"
                    >
                      <option value="">Выберите магазин...</option>
                      {shopsStats.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-gray-400" />
                  </div>
                ) : (
                  <div className="p-4 bg-white border border-gray-200 rounded-xl">
                    <div className="text-sm font-bold text-gray-900">{adminData?.shop?.name || 'Мой магазин'}</div>
                   
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}