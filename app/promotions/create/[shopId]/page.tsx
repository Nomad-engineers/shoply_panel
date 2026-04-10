"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronLeft } from "lucide-react";

import {
  AllowedUsersField,
  type AllowedUserOption,
} from "@/components/promotions/allowed-users-field";
import { DashboardLayout } from "@/components/layout";
import { Button, Input, Switch, Spinner } from "@/components/ui";
import { attachAllowedUsersToPromocode } from "@/lib/promocode-allowed-users";
import { cn } from "@/lib/theme";
import { useAuth } from "@/components/hooks/useLogin";
import type { Promocode } from "@/types/promocode";
import type { Shop } from "@/types/shop";
import { getImageUrl } from "@/lib/utils";

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

export default function CreatePromocodePage() {
  const router = useRouter();
  const params = useParams();

  const shopId = Number((params as any)?.shopId);

  const {
    adminData,
    refreshSession,
    fetchWithSession,
  } = useAuth();

  const isAdmin = adminData?.isAdmin ?? false;

  const [shop, setShop] = useState<Shop | null>(null);
  const [shopLoading, setShopLoading] = useState(false);

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
  const [oneActivation, setOneActivation] = useState(false);
  const [allowedUsers, setAllowedUsers] = useState<AllowedUserOption[]>([]);

  const [validUntilEnabled, setValidUntilEnabled] = useState(false);
  const [validUntil, setValidUntil] = useState<string>("");

  const [typeOpen, setTypeOpen] = useState(false);
  const [usageOpen, setUsageOpen] = useState(false);

  useEffect(() => {
    const loadShop = async () => {
      if (!shopId || Number.isNaN(shopId)) return;
      setShopLoading(true);
      try {
        const query = new URLSearchParams();
        query.set("relations", "photo");
        if (!isAdmin) {
          query.set("isPublic", "true");
        }
        query.set("dateFrom", new Date().toISOString().split("T")[0]);
        query.set("dateTo", new Date(new Date().getTime() + 86400000).toISOString().split("T")[0]);
        const url = `${process.env.NEXT_PUBLIC_API_URL}${isAdmin ? "/admin" : ""}/shops/${shopId}?${query.toString()}`;
        const res = await fetchWithSession(
          url,
          () => localStorage.getItem("access_token"),
          refreshSession,
        );
        if (!res.ok) throw new Error();
        const json = await res.json();
        setShop((json.data ?? json) as Shop);
      } catch {
        setShop(null);
      } finally {
        setShopLoading(false);
      }
    };

    loadShop();
  }, [fetchWithSession, refreshSession, shopId, isAdmin]);

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

  const isSaveDisabled = useMemo(() => {
    if (!shopId || Number.isNaN(shopId)) return true;
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
    shopId,
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
        onlyOneActivation: oneActivation,
      };

      const doPost = async (token: string) => {
        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/v2/admin/promocode`, {
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
        if (postRes.status === 400) {
          const errorJson = await postRes.json();
          if (errorJson.message === "promocode with this name already exist") {
            throw new Error("Такой промокод уже существует");
          }
        }
        throw new Error("Не удалось создать промокод");
      }

      const postJson = (await postRes.json().catch(() => null)) as
        | { data?: Promocode }
        | Promocode
        | null;
      const createdPromocodeId =
        postJson && typeof postJson === "object" && "id" in postJson
          ? postJson.id
          : postJson?.data?.id ?? null;

      if (isAdmin && createdPromocodeId && allowedUsers.length > 0) {
        await attachAllowedUsersToPromocode({
          promocodeId: createdPromocodeId,
          userIds: allowedUsers.map((user) => user.id),
          accessToken: token,
          refreshSession,
        });
      }

      router.push("/promotions");
    } catch (e: any) {
      setSubmitError(e.message ?? "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  const header = (
    <div className="flex w-full items-center gap-8">
      <h1 className="text-[28px] font-bold leading-none tracking-[-0.03em] text-[#111322]">
        Акции и промокоды
      </h1>
    </div>
  );

  return (
    <DashboardLayout
      header={header}
      headerClassName="pl-4 pr-8"
      contentClassName="min-h-0 p-0"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-border bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
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

            <div className="h-4 w-px bg-[#DCDCE6] mx-2" />

            <div className="flex items-center gap-2">
              {shop?.photo?.url ? (
                <img
                  src={getImageUrl(shop.photo, {
                    width: 40,
                    height: 40,
                    fit: "cover",
                  })}
                  alt={shop.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#5AC800] flex items-center justify-center">
                  <div className="w-3 h-1.5 border-b-2 border-l-2 border-white -rotate-45 mb-0.5" />
                </div>
              )}
              <div className="text-sm text-[#111111] font-medium">
                {shopLoading ? "..." : (shop?.name ?? "Региональный")}
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            className={cn("rounded-xl gap-2", isSaveDisabled && "opacity-60")}
            disabled={isSaveDisabled || saving}
            onClick={submit}
          >
            Сохранить
            {saving ? <Spinner size={16} /> : <Check className="w-4 h-4" />}
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="text-[13px] text-[#8E8E93] font-medium">
                Техническое название
              </div>
              <Input
                placeholder="Поле ввода"
                value={technicalName}
                onChange={(e) => setTechnicalName(e.target.value)}
                className="bg-[#F6F6FA] border-none rounded-xl h-[46px] px-4 font-medium"
              />
            </div>

            <div className="space-y-2">
              <div className="text-[13px] text-[#8E8E93] font-medium">
                Промокод
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Поле ввода"
                    value={promocodeName}
                    onChange={(e) => setPromocodeName(e.target.value)}
                    className="bg-[#F6F6FA] border-none rounded-xl h-[46px] px-4 font-medium"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const code = generateCode();
                    setPromocodeName(code);
                    if (!technicalName) setTechnicalName(code);
                  }}
                  className="text-[15px] text-[#2F80ED] font-semibold"
                >
                  Сгенерировать
                </button>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#DCDCE6]/60" />

          <div className="space-y-2">
            <div className="text-[13px] text-[#8E8E93] font-medium">
              Содержание
            </div>
            <div className="flex items-center gap-6">
              <div className="relative w-[340px]">
                <Input
                  type="number"
                  value={String(valueForType)}
                  onChange={(e) => setValueForType(Number(e.target.value))}
                  className="bg-[#F6F6FA] border-none rounded-xl h-[46px] px-4 font-medium pr-12"
                  disabled={type === "freeDelivery"}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8E8E93]">
                  {type === "percent" ? "%" : type === "fixed" ? "руб" : ""}
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setTypeOpen(!typeOpen);
                    setUsageOpen(false);
                  }}
                  className="flex items-center gap-2 text-[15px] font-normal text-[#111111]"
                >
                  {type === "fixed"
                    ? "Фиксированный"
                    : type === "percent"
                      ? "Процент"
                      : "Бесплатная доставка"}
                  <ChevronDown className="w-4 h-4 text-[#8E8E93]" />
                </button>

                {typeOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setTypeOpen(false)}
                    />
                    <div className="absolute z-20 top-[-8px] left-[-8px] w-64 bg-white rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] py-2 overflow-hidden no-scrollbar">
                    <button
                      type="button"
                      className="w-full px-5 py-3.5 text-left text-[15px] hover:bg-gray-50/50 flex items-center justify-between transition-colors whitespace-nowrap"
                      onClick={() => {
                        setType("fixed");
                        setTypeOpen(false);
                      }}
                    >
                      <span className="text-[#111111] font-normal">Фиксированный</span>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full transition-all",
                          type === "fixed"
                            ? "bg-[#5AC800] border-[1px] border-white ring-[2.5px] ring-[#5AC800]"
                            : "bg-[#F2F2F7]",
                        )}
                      />
                    </button>
                    <div className="mx-5 h-px bg-[#F2F2F7]" />
                    <button
                      type="button"
                      className="w-full px-5 py-3.5 text-left text-[15px] hover:bg-gray-50/50 flex items-center justify-between transition-colors whitespace-nowrap"
                      onClick={() => {
                        setType("percent");
                        setTypeOpen(false);
                      }}
                    >
                      <span className="text-[#111111] font-normal">Процент</span>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full transition-all",
                          type === "percent"
                            ? "bg-[#5AC800] border-[1px] border-white ring-[2.5px] ring-[#5AC800]"
                            : "bg-[#F2F2F7]",
                        )}
                      />
                    </button>
                    <div className="mx-5 h-px bg-[#F2F2F7]" />
                    <button
                      type="button"
                      className="w-full px-5 py-3.5 text-left text-[15px] hover:bg-gray-50/50 flex items-center justify-between transition-colors whitespace-nowrap"
                      onClick={() => {
                        setType("freeDelivery");
                        setTypeOpen(false);
                      }}
                    >
                      <span className="text-[#111111] font-normal">Бесплатная доставка</span>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full transition-all",
                          type === "freeDelivery"
                            ? "bg-[#5AC800] border-[1px] border-white ring-[2.5px] ring-[#5AC800]"
                            : "bg-[#F2F2F7]",
                        )}
                      />
                    </button>
                  </div>
                </>
              )}
              </div>
            </div>
          </div>

          <div className="h-px bg-[#DCDCE6]/60" />

          <div className="space-y-2">
            <div className="text-[13px] text-[#8E8E93] font-medium">
              Условия
            </div>
            <div className="flex items-center gap-6">
              <div className="relative w-[340px]">
                <Input
                  type="number"
                  value={String(usageLimit)}
                  onChange={(e) => setUsageLimit(Number(e.target.value))}
                  className="bg-[#F6F6FA] border-none rounded-xl h-[46px] px-4 font-medium pr-12 focus:ring-1 focus:ring-[#5AC800]"
                  disabled={usageMode !== "quantity"}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8E8E93]">
                  шт.
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setUsageOpen(!usageOpen);
                    setTypeOpen(false);
                  }}
                  className="flex items-center gap-2 text-[15px] font-normal text-[#111111]"
                >
                  {usageMode === "quantity"
                    ? "Количество"
                    : usageMode === "infinite"
                      ? "Бесконечный"
                      : "Временный"}
                  <ChevronDown className="w-4 h-4 text-[#8E8E93]" />
                </button>

                {usageOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setUsageOpen(false)}
                    />
                    <div className="absolute z-20 top-[-8px] left-[-8px] w-64 bg-white rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] py-2 overflow-hidden no-scrollbar">
                    <button
                      type="button"
                      className="w-full px-5 py-3.5 text-left text-[15px] hover:bg-gray-50/50 flex items-center justify-between transition-colors whitespace-nowrap"
                      onClick={() => {
                        setUsageMode("quantity");
                        setUsageOpen(false);
                      }}
                    >
                      <span className="text-[#111111] font-normal">Заданное количество</span>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full transition-all",
                          usageMode === "quantity"
                            ? "bg-[#5AC800] border-[1px] border-white ring-[2.5px] ring-[#5AC800]"
                            : "bg-[#F2F2F7]",
                        )}
                      />
                    </button>
                    <div className="mx-5 h-px bg-[#F2F2F7]" />
                    <button
                      type="button"
                      className="w-full px-5 py-3.5 text-left text-[15px] hover:bg-gray-50/50 flex items-center justify-between transition-colors whitespace-nowrap"
                      onClick={() => {
                        setUsageMode("infinite");
                        setUsageOpen(false);
                      }}
                    >
                      <span className="text-[#111111] font-normal">Бесконечный</span>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full transition-all",
                          usageMode === "infinite"
                            ? "bg-[#5AC800] border-[1px] border-white ring-[2.5px] ring-[#5AC800]"
                            : "bg-[#F2F2F7]",
                        )}
                      />
                    </button>
                    <div className="mx-5 h-px bg-[#F2F2F7]" />
                    <button
                      type="button"
                      className="w-full px-5 py-3.5 text-left text-[15px] hover:bg-gray-50/50 flex items-center justify-between transition-colors whitespace-nowrap"
                      onClick={() => {
                        setUsageMode("temporary");
                        setUsageOpen(false);
                      }}
                    >
                      <span className="text-[#111111] font-normal">Временный</span>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full transition-all",
                          usageMode === "temporary"
                            ? "bg-[#5AC800] border-[1px] border-white ring-[2.5px] ring-[#5AC800]"
                            : "bg-[#F2F2F7]",
                        )}
                      />
                    </button>
                  </div>
                </>
              )}
              </div>
            </div>
          </div>

          <div className="h-px bg-[#DCDCE6]/60" />

          <div className="grid grid-cols-2 gap-8 items-end">
            <div className="space-y-2">
              <div className="text-[13px] text-[#8E8E93] font-medium leading-tight max-w-[280px]">
                Минимальная сумма для активации промокода
              </div>
              <div className="relative">
                <Input
                  type="number"
                  value={String(minSum)}
                  onChange={(e) => setMinSum(Number(e.target.value))}
                  className="bg-[#F6F6FA] border-none rounded-xl h-[46px] px-4 font-medium pr-12"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#8E8E93]">
                  руб
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {validUntilEnabled && (
                <>
                  <div className="text-[13px] text-[#8E8E93] font-medium">
                    Дата окончания
                  </div>
                  <Input
                    type="datetime-local"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="bg-[#F6F6FA] border-none rounded-xl h-[46px] px-4 font-medium"
                  />
                </>
              )}
            </div>
          </div>

          <div className="h-px bg-[#DCDCE6]/60" />

          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <Switch
                checked={oneActivation}
                onCheckedChange={(v) => setOneActivation(Boolean(v))}
                className="mt-1"
              />
              <div className="space-y-0.5">
                <div className="text-[16px] font-semibold text-[#111111]">
                  Одна активация
                </div>
                <div className="text-[14px] text-[#8E8E93]">
                  Активировать можно одному пользователю только один раз
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={payFromShop}
                    onCheckedChange={(v) => setPayFromShop(Boolean(v))}
                  />
                  <div className="text-[16px] font-semibold text-[#111111]">
                    За счет магазина
                  </div>
                </div>

                <AllowedUsersField
                  value={allowedUsers}
                  onChange={setAllowedUsers}
                />
              </div>
            )}
          </div>

          {submitError && (
            <div className="mt-6 text-sm text-red-600 font-medium">
              {submitError}
            </div>
          )}

          {!shopId || Number.isNaN(shopId) ? (
            <div className="mt-6 text-sm text-red-600 font-medium">
              Не передан корректный shopId в URL
            </div>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
