"use client";

import React, { useState, useCallback, useMemo } from "react";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { useShops } from "@/components/hooks/useShops";
import { Button, Spinner } from "@/components/ui";
import { UploadModeToggle } from "./components/UploadModeToggle";
import { FileDropzone } from "./components/FileDropzone";
import { UploadStatus } from "./components/UploadStatus";
import { ShopConfigSidebar } from "./components/ShopConfigSidebar";

type UploadMode = "products" | "prices";

export default function ExcelPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<UploadMode>("products");
  const [selectedShopId, setSelectedShopId] = useState("");
  const [status, setStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const url = process.env.NEXT_PUBLIC_API_URL;

  const {
    adminData,
    loading: authLoading,
    refreshSession,
    fetchWithSession,
  } = useAuthContext();

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

  const sendFileToServer = async () => {
    if (!file) return;

    if (isAdmin && !selectedShopId) {
      setStatus({ type: "error", msg: "Выберите магазин" });
      return;
    }

    if (!isAdmin && !userShopId) {
      setStatus({
        type: "error",
        msg: "У вашего аккаунта нет привязанного магазина",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("shopId", shopId);

    const endpoint =
      mode === "products"
        ? `/panel/shop/${shopId}/products`
        : `/panel/shop/${shopId}/products/prices`;

    try {
      const response = await fetchWithSession(
        `${url}${endpoint}`,
        () => localStorage.getItem("access_token"),
        refreshSession,
        { method: "POST", body: formData }
      );

      const result = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          msg: result.message || "Синхронизация успешна!",
        });
        setFile(null);
      } else {
        setStatus({ type: "error", msg: result.message || "Ошибка сервера" });
      }
    } catch (error) {
      setStatus({ type: "error", msg: "Ошибка сети" });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading)
    return (
      <div className="flex justify-center p-20">
        <Spinner />
      </div>
    );

  return (
    <div className="mx-auto p-6 space-y-8 bg-white rounded-3xl min-h-screen">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Управление данными</h1>
        <p className="text-gray-500">
          Загрузка номенклатуры и обновление прайс-листов
        </p>
      </div>

      <UploadModeToggle mode={mode} onModeChange={(m) => { setMode(m); setStatus(null); }} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <FileDropzone
            file={file}
            onFileDrop={onDrop}
            onRemoveFile={() => setFile(null)}
          />

          <Button
            onClick={sendFileToServer}
            disabled={!file || loading}
            className="w-full h-14 rounded-2xl text-lg font-bold"
          >
            {loading ? <Spinner className="mr-2" /> : "Начать синхронизацию"}
          </Button>

          <UploadStatus status={status} />
        </div>

        <ShopConfigSidebar
          isAdmin={isAdmin}
          adminData={adminData}
          selectedShopId={selectedShopId}
          shopsStats={shopsStats}
          onShopChange={setSelectedShopId}
        />
      </div>
    </div>
  );
}
