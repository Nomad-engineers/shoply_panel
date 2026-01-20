"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronLeft, Lock } from "lucide-react";

import { cn } from "@/lib/theme";
import { useAuth } from "@/components/hooks/useLogin";
import type { Shop } from "@/types/shop";

import { Button, Input, Switch } from "@/components/ui";

type DiscountType = "fixed" | "percent" | "freeDelivery";

type UsageMode = "quantity" | "infinite" | "temporary";

const generateCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let res = "";
  for (let i = 0; i < 8; i++) {
    res += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return res;
};

export default function PromotionsCreateIndexPage() {
  const router = useRouter();

  const { adminData, refreshSession, fetchWithSession } = useAuth(
    process.env.NEXT_PUBLIC_DIRECTUS_URL,
  );

  const derivedShopId =
    (adminData as any)?.shopId ??
    (adminData as any)?.shop?.id ??
    (adminData as any)?.shop_id;

  const isAdmin = !derivedShopId;

  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null);

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [technicalName, setTechnicalName] = useState("");
  const [promocodeName, setPromocodeName] = useState("");

  const [type, setType] = useState<DiscountType>("fixed");
  const [valueForType, setValueForType] = useState<number>(0);

  const [usageMode, setUsageMode] = useState<UsageMode>("quantity");
  const [usageLimit, setUsageLimit] = useState<number>(0);

  const [minSum, setMinSum] = useState<number>(0);

  const [payFromShop, setPayFromShop] = useState(false);

  const [validUntilEnabled, setValidUntilEnabled] = useState(false);
  const [validUntil, setValidUntil] = useState<string>("");

  const [typeOpen, setTypeOpen] = useState(false);
  const [usageOpen, setUsageOpen] = useState(false);

  useEffect(() => {
    if (derivedShopId) {
      router.replace(`/promotions/create/${derivedShopId}`);
    }
  }, [derivedShopId, router]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams();
        query.set("relations", "photo");
        query.set("isPublic", "true");
        query.set("sort", JSON.stringify({ createdAt: "DESC" }));

        const url = `${process.env.NEXT_PUBLIC_API_URL}/shops?${query.toString()}`;
        const res = await fetchWithSession(
          url,
          () => localStorage.getItem("access_token"),
          refreshSession,
        );

        if (!res.ok) throw new Error("Ошибка при получении магазинов");

        const json = await res.json();
        const list = (json.data ?? json) as Shop[];
        setShops(Array.isArray(list) ? list : []);
      } catch (e: any) {
        setError(e.message ?? "Ошибка");
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [fetchWithSession, refreshSession]);

  useEffect(() => {
    if (usageMode === "quantity") {
      setValidUntilEnabled(false);
    }
    if (usageMode === "infinite") {
      setValidUntilEnabled(false);
      setUsageLimit(0);
    }
    if (usageMode === "temporary") {
      setValidUntilEnabled(true);
      setUsageLimit(0);
    }
  }, [usageMode]);

  const selectedShop = useMemo(() => {
    if (selectedShopId === null) return null;
    return shops.find((s) => s.id === selectedShopId) ?? null;
  }, [selectedShopId, shops]);

  const isSaveDisabled = useMemo(() => {
    if (!selectedShopId) return true;
    if (!technicalName.trim()) return true;
    if (!promocodeName.trim()) return true;
    if (type === "fixed" && valueForType <= 0) return true;
    if (type === "percent" && (valueForType <= 0 || valueForType > 100))
      return true;

    if (usageMode === "quantity" && usageLimit <= 0) return true;
    if (usageMode === "temporary" && !validUntil) return true;

    return false;
  }, [
    promocodeName,
    selectedShopId,
    technicalName,
    type,
    usageLimit,
    usageMode,
    validUntil,
    valueForType,
  ]);

  const submit = async () => {
    setSubmitError(null);
    setSaving(true);

    try {
      const shopId = selectedShopId;
      if (!shopId) throw new Error("Выберите магазин");

      const body = {
        technicalName: technicalName.trim(),
        promocodeName: promocodeName.trim(),
        minSum: Number(minSum) || 0,
        usageLimit: usageMode === "quantity" ? Number(usageLimit) || 0 : 0,
        valueForType: Number(valueForType) || 0,
        validUntil:
          usageMode === "temporary" && validUntil
            ? new Date(validUntil).toISOString()
            : null,
        type,
        shopId,

        payFromShop: isAdmin ? payFromShop : false,
      };

      const doPost = async (token: string) => {
        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/promocode`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      };

      let token = localStorage.getItem("access_token");
      if (!token) throw new Error("Не авторизован");

      let postRes = await doPost(token);
      if (postRes.status === 401) {
        token = await refreshSession();
        postRes = await doPost(token);
      }

      if (!postRes.ok) {
        throw new Error("Не удалось создать промокод");
      }

      router.push("/promotions");
    } catch (e: any) {
      setSubmitError(e.message ?? "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl">
      <div
        className="flex items-center justify-between px-6 py-4 border-b"
        style={{ borderColor: "rgba(220, 220, 230, 1)" }}
      >
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-50"
            onClick={() => router.back()}
            type="button"
          >
            <ChevronLeft className="w-5 h-5 text-[#111111]" />
          </button>
          <div className="text-[16px] font-semibold text-[#111111]">
            Создание промокода
          </div>

          <div className="relative ml-4">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="h-10 px-3 border border-input rounded-md flex items-center gap-2 min-w-[260px] justify-between"
              disabled={loading || Boolean(error)}
            >
              <span className="text-sm text-[#111111] font-medium truncate">
                {selectedShopId === -1
                  ? "Региональный"
                  : selectedShop
                    ? selectedShop.name
                    : loading
                      ? "Загрузка..."
                      : "Выберите магазин"}
              </span>
              <ChevronDown className="w-4 h-4 text-[#8E8E93]" />
            </button>

            {open && !loading && !error && (
              <div className="absolute z-20 mt-2 w-[320px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-h-[400px] overflow-y-auto">
                <button
                  type="button"
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                  onClick={() => {
                    setSelectedShopId(-1);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#5AC800] flex items-center justify-center flex-shrink-0">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M7 13c1.5 1.5 5 2.5 10 0" />
                      </svg>
                    </div>
                    <span className="text-[#111111] font-medium text-[15px]">
                      Региональный
                    </span>
                  </div>

                  <div
                    className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0",
                      selectedShopId === -1
                        ? "bg-[#5AC800] border-[#5AC800]"
                        : "bg-white border-[#DCDCE6]",
                    )}
                  >
                    {selectedShopId === -1 && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </button>

                <div className="h-px bg-gray-100 my-1" />

                {(shops || []).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => {
                      setSelectedShopId(s.id);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      {s.photo?.url ? (
                        <Image
                          src={s.photo.url}
                          alt={s.name}
                          width={32}
                          height={32}
                          className="rounded-full w-8 h-8 object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-gray-500">
                            {s.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}

                      <span className="text-[#111111] truncate text-[15px]">
                        {s.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pl-2 flex-shrink-0">
                      <span className="text-xs text-[#C7C7CC]">ID {s.id}</span>
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                          selectedShopId === s.id
                            ? "bg-[#5AC800] border-[#5AC800]"
                            : "bg-white border-[#DCDCE6]",
                        )}
                      >
                        {selectedShopId === s.id && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedShop || selectedShopId === -1 ? (
            <div className="flex items-center gap-2">
              {selectedShopId === -1 ? null : selectedShop?.photo?.url ? (
                <Image
                  src={selectedShop.photo.url}
                  alt={selectedShop.name}
                  width={20}
                  height={20}
                  className="rounded-full"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-[gray-200]" />
              )}
              {selectedShopId !== -1 && (
                <Lock className="w-4 h-4 text-[#C7C7CC]" />
              )}
            </div>
          ) : null}
        </div>

        <Button
          variant="secondary"
          className={cn("rounded-xl gap-2", isSaveDisabled && "opacity-60")}
          disabled={isSaveDisabled || saving}
          onClick={submit}
        >
          Сохранить
          <Check className="w-4 h-4" />
        </Button>
      </div>

      <div className="px-6 py-6">
        {(loading || error) && (
          <div className="mb-6">
            {loading && <div className="text-gray-500">Загрузка...</div>}
            {!loading && error && (
              <div className="text-red-500">Ошибка: {error}</div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-[#8E8E93] mb-2">
              Техническое название
            </div>
            <Input
              placeholder="Поле ввода"
              value={technicalName}
              onChange={(e) => setTechnicalName(e.target.value)}
            />
          </div>

          <div>
            <div className="text-xs text-[#8E8E93] mb-2">Промокод</div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Поле ввода"
                  value={promocodeName}
                  onChange={(e) => setPromocodeName(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const code = generateCode();
                  setPromocodeName(code);
                  if (!technicalName) setTechnicalName(code);
                }}
                className="text-sm text-[#2F80ED] font-medium"
              >
                Сгенерировать
              </button>
            </div>
          </div>
        </div>

        <div
          className="h-px my-6"
          style={{ backgroundColor: "rgba(220, 220, 230, 0.6)" }}
        />

        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-[#8E8E93] mb-2">Содержание</div>
            <div className="relative">
              <Input
                type="number"
                value={String(valueForType)}
                onChange={(e) => setValueForType(Number(e.target.value))}
                className="pr-16"
                disabled={type === "freeDelivery"}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#8E8E93]">
                {type === "percent" ? "%" : type === "fixed" ? "руб" : ""}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-[#8E8E93] mb-2">&nbsp;</div>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setTypeOpen(!typeOpen);
                  setUsageOpen(false);
                }}
                className="w-full h-10 px-3 border border-input rounded-md flex items-center justify-between text-sm"
              >
                <span className="text-[#111111]">
                  {type === "fixed"
                    ? "Фиксированный"
                    : type === "percent"
                      ? "Процент"
                      : "Бесплатная доставка"}
                </span>
                <ChevronDown className="w-4 h-4 text-[#8E8E93]" />
              </button>

              {typeOpen && (
                <div className="absolute z-20 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => {
                      setType("fixed");
                      setTypeOpen(false);
                    }}
                  >
                    Фиксированный
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                        type === "fixed"
                          ? "bg-[#5AC800] border-[#5AC800]"
                          : "bg-white border-[#DCDCE6]",
                      )}
                    >
                      {type === "fixed" && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => {
                      setType("percent");
                      setTypeOpen(false);
                    }}
                  >
                    Процент
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                        type === "percent"
                          ? "bg-[#5AC800] border-[#5AC800]"
                          : "bg-white border-[#DCDCE6]",
                      )}
                    >
                      {type === "percent" && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => {
                      setType("freeDelivery");
                      setTypeOpen(false);
                    }}
                  >
                    Бесплатная доставка
                    <div
                      className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                        type === "freeDelivery"
                          ? "bg-[#5AC800] border-[#5AC800]"
                          : "bg-white border-[#DCDCE6]",
                      )}
                    >
                      {type === "freeDelivery" && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="h-px my-6"
          style={{ backgroundColor: "rgba(220, 220, 230, 0.6)" }}
        />

        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-xs text-[#8E8E93] mb-2">Условия</div>
            <div className="relative">
              <Input
                type="number"
                value={String(usageLimit)}
                onChange={(e) => setUsageLimit(Number(e.target.value))}
                className="pr-16"
                disabled={usageMode !== "quantity"}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#8E8E93]">
                шт.
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-[#8E8E93] mb-2">&nbsp;</div>
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setUsageOpen(!usageOpen);
                  setTypeOpen(false);
                }}
                className="w-full h-10 px-3 border border-input rounded-md flex items-center justify-between text-sm"
              >
                <span className="text-[#111111]">
                  {usageMode === "quantity"
                    ? "Заданное количество"
                    : usageMode === "infinite"
                      ? "Бесконечный"
                      : "Временный"}
                </span>
                <ChevronDown className="w-4 h-4 text-[#8E8E93]" />
              </button>

              {usageOpen && (
                <div className="absolute z-20 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => {
                      setUsageMode("quantity");
                      setUsageOpen(false);
                    }}
                  >
                    Заданное количество
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full border",
                        usageMode === "quantity"
                          ? "bg-[#5AC800] border-[#5AC800]"
                          : "bg-white border-[#DCDCE6]",
                      )}
                    />
                  </button>
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => {
                      setUsageMode("infinite");
                      setUsageOpen(false);
                    }}
                  >
                    Бесконечный
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full border",
                        usageMode === "infinite"
                          ? "bg-[#5AC800] border-[#5AC800]"
                          : "bg-white border-[#DCDCE6]",
                      )}
                    />
                  </button>
                  <button
                    type="button"
                    className="w-full px-4 py-3 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => {
                      setUsageMode("temporary");
                      setUsageOpen(false);
                    }}
                  >
                    Временный
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full border",
                        usageMode === "temporary"
                          ? "bg-[#5AC800] border-[#5AC800]"
                          : "bg-white border-[#DCDCE6]",
                      )}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          className="h-px my-6"
          style={{ backgroundColor: "rgba(220, 220, 230, 0.6)" }}
        />

        <div className="grid grid-cols-2 gap-6 items-end">
          <div>
            <div className="text-xs text-[#8E8E93] mb-2">
              Минимальная сумма для активации промокода
            </div>
            <div className="relative">
              <Input
                type="number"
                value={String(minSum)}
                onChange={(e) => setMinSum(Number(e.target.value))}
                className="pr-16"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#8E8E93]">
                руб
              </div>
            </div>
          </div>

          <div>
            {validUntilEnabled && (
              <div>
                <div className="text-xs text-[#8E8E93] mb-2">
                  Дата окончания
                </div>
                <Input
                  type="datetime-local"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div
          className="h-px my-6"
          style={{ backgroundColor: "rgba(220, 220, 230, 0.6)" }}
        />

        <div className="flex flex-col gap-6">
          {isAdmin && (
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-[#111111]">
                  За счет магазина
                </div>
              </div>
              <Switch
                checked={payFromShop}
                onCheckedChange={(v) => setPayFromShop(Boolean(v))}
              />
            </div>
          )}
        </div>

        {submitError && (
          <div className="mt-6 text-sm text-red-600">{submitError}</div>
        )}
      </div>
    </div>
  );
}
