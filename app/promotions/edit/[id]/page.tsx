"use client";

import { useEffect, useMemo, useState } from "react";
import { mutate } from "swr";
import { useParams, useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronLeft, Trash2 } from "lucide-react";

import { DashboardLayout } from "@/components/layout";
import { AllowedUsersField, type AllowedUserOption } from "@/components/promotions/allowed-users-field";
import { Button, Input, Switch, Spinner } from "@/components/ui";
import { cn } from "@/lib/theme";
import { attachAllowedUsersToPromocode } from "@/lib/promocode-allowed-users";
import { useAuth } from "@/components/hooks/useLogin";
import { useShops } from "@/components/hooks/useShops";
import type { Shop } from "@/types/shop";
import type { Promocode } from "@/types/promocode";
import { getImageUrl } from "@/lib/utils";
import { toast } from "sonner";

type DiscountType = "fixed" | "percent" | "freeDelivery";
type UsageMode = "quantity" | "infinite" | "temporary";

interface PromocodeAllowedUserResponseItem {
  userId: number;
  firstName: string | null;
  lastName: string | null;
  phone?: string | null;
  email?: string | null;
  photoId?: string | null;
}

export default function EditPromocodePage() {
  const router = useRouter();
  const params = useParams();
  const promocodeId = params?.id;
  const detailCacheKey = `shoply:promocode-detail:${promocodeId}`;

  const {
    adminData,
    refreshSession,
    fetchWithSession,
    loading: authLoading,
  } = useAuth();

  const isAdmin = adminData?.isAdmin ?? false;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [initialShop, setInitialShop] = useState<Shop | null>(null);
  const [shopId, setShopId] = useState<number | null>(null);

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
  const [initialAllowedUserIds, setInitialAllowedUserIds] = useState<number[]>([]);

  const [validUntilEnabled, setValidUntilEnabled] = useState(false);
  const [validUntil, setValidUntil] = useState<string>("");

  const [typeOpen, setTypeOpen] = useState(false);
  const [usageOpen, setUsageOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  const {
    shops,
    loading: shopsLoading,
    error: shopsError,
  } = useShops({
    isAdmin,
    dateFrom: new Date().toISOString().split("T")[0],
    dateTo: new Date(new Date().getTime() + 86400000).toISOString().split("T")[0],
    skip: authLoading || !adminData,
  });

  const selectedShop = useMemo(() => {
    if (shopId === -1) return null;
    const found = shops.find((s) => s.id === shopId);
    return found || initialShop;
  }, [shopId, shops, initialShop]);

  useEffect(() => {
    const loadFromSession = () => {
      try {
        const raw = sessionStorage.getItem(detailCacheKey);
        if (raw) {
          return JSON.parse(raw) as Promocode;
        }
      } catch {
      }
      return null;
    };

    const mapAllowedUsers = (
      users: PromocodeAllowedUserResponseItem[] | null | undefined,
    ) => {
      const mappedUsers = (users ?? []).map((user) => ({
        id: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone ?? null,
        email: user.email ?? null,
        photoId: user.photoId ?? null,
      }));

      setAllowedUsers(mappedUsers);
      setInitialAllowedUserIds(mappedUsers.map((user) => user.id));
    };

    const mapPromocodeToState = (p: Promocode) => {
      setTechnicalName(p.technicalName || "");
      setPromocodeName(p.name || "");
      setMinSum(p.minSum || 0);
      setType(p.type as DiscountType);
      setValueForType(p.valueForType || 0);
      setPayFromShop(Boolean(p.payFromShop));
      setOneActivation(
        Boolean(
          p.onlyOneActivation ??
            p.oneActivation ??
            (typeof p.useMultiple === "boolean" ? !p.useMultiple : false),
        ),
      );
      setAllowedUsers(
        (p.allowedUsers ?? []).map((user) => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          email: user.email,
          photoId: user.photoId,
        })),
      );
      setInitialAllowedUserIds((p.allowedUsers ?? []).map((user) => user.id));

      const sid = p.shop?.id ?? p.shopId ?? -1; // -1 for Regional
      setShopId(sid);

      if (p.usageLimit === null || p.usageLimit === undefined || p.usageLimit === 0) {
        if (p.validUntil) {
          setUsageMode("temporary");
          setValidUntil(new Date(p.validUntil).toISOString().slice(0, 16));
          setValidUntilEnabled(true);
        } else {
          setUsageMode("infinite");
        }
        setUsageLimit(0);
      } else {
        setUsageMode("quantity");
        setUsageLimit(p.usageLimit);
      }

      if (p.shop?.id) {
        setInitialShop(p.shop as any);
      } else {
        setInitialShop(null);
      }
    };

    const loadPromocode = async () => {
      const cachedPromocode = loadFromSession();

      if (cachedPromocode) {
        mapPromocodeToState(cachedPromocode);
        setLoading(false);
      } else {
        setLoading(true);
      }

      if (!promocodeId) return;

      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/v2/admin/promocode/${promocodeId}`;
        const [promocodeRes, allowedUsersRes] = await Promise.all([
          fetchWithSession(
            url,
            () => localStorage.getItem("access_token"),
            refreshSession,
          ),
          fetchWithSession(
            `${process.env.NEXT_PUBLIC_API_URL}/v2/admin/promocode/${promocodeId}/allowed-users`,
            () => localStorage.getItem("access_token"),
            refreshSession,
          ),
        ]);

        let fetchedAllowedUsers:
          | PromocodeAllowedUserResponseItem[]
          | null = null;

        if (allowedUsersRes.ok) {
          const allowedUsersJson = await allowedUsersRes.json();
          fetchedAllowedUsers = (allowedUsersJson.data ??
            []) as PromocodeAllowedUserResponseItem[];
          mapAllowedUsers(fetchedAllowedUsers);
        }

        if (promocodeRes.ok) {
          const json = await promocodeRes.json();
          const p: Promocode = json.data ?? json;

          if (fetchedAllowedUsers) {
            p.allowedUsers = fetchedAllowedUsers.map((user) => ({
              id: user.userId,
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone ?? null,
              email: user.email ?? null,
              photoId: user.photoId ?? null,
            }));
          }

          mapPromocodeToState(p);
          sessionStorage.setItem(detailCacheKey, JSON.stringify(p));
          setSubmitError(null);
        } else if (cachedPromocode) {
          mapPromocodeToState({
            ...cachedPromocode,
            allowedUsers: fetchedAllowedUsers
              ? fetchedAllowedUsers.map((user) => ({
                  id: user.userId,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  phone: user.phone ?? null,
                  email: user.email ?? null,
                  photoId: user.photoId ?? null,
                }))
              : cachedPromocode.allowedUsers,
          });
        } else {
          throw new Error("Не удалось загрузить данные промокода");
        }
      } catch (e: any) {
        if (cachedPromocode) {
          mapPromocodeToState(cachedPromocode);
        } else {
          setSubmitError(e.message);
        }
      } finally {
        setLoading(false);
      }
    };

    loadPromocode();
  }, [detailCacheKey, fetchWithSession, refreshSession, promocodeId]);

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
        shopId: shopId === -1 ? null : shopId,
        payFromShop: isAdmin ? payFromShop : false,
        useMultiple: !oneActivation,
        onlyOneActivation: oneActivation,
        oneActivation,
      };

      const doPatch = async (token: string) => {
        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/v2/admin/promocode/${promocodeId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        });
      };

      let token = localStorage.getItem("access_token");
      if (!token) throw new Error("Не авторизован");

      let patchRes = await doPatch(token);
      if (patchRes.status === 401) {
        token = await refreshSession();
        patchRes = await doPatch(token);
      }

      if (!patchRes.ok) {
        const errorJson = await patchRes.json();
        throw new Error(errorJson.message || "Не удалось обновить промокод");
      }

      sessionStorage.removeItem(detailCacheKey);

      const nextAllowedUserIds = allowedUsers.map((user) => user.id);
      const newAllowedUserIds = nextAllowedUserIds.filter(
        (userId) => !initialAllowedUserIds.includes(userId),
      );

      if (isAdmin && newAllowedUserIds.length > 0) {
        await attachAllowedUsersToPromocode({
          promocodeId: Number(promocodeId),
          userIds: newAllowedUserIds,
          accessToken: token,
          refreshSession,
        });
        setInitialAllowedUserIds(nextAllowedUserIds);
      }

      toast.success("Промокод обновлен");
      // Clear SWR cache for promocodes list
      mutate((key) => typeof key === "string" && key.includes("/v2/admin/promocode"));
      
      router.push("/promotions");
    } catch (e: any) {
      setSubmitError(e.message ?? "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Вы уверены, что хотите удалить этот промокод?")) return;
    setDeleting(true);
    try {
      const doDelete = async (token: string) => {
        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/v2/admin/promocode/${promocodeId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      };

      let token = localStorage.getItem("access_token");
      if (!token) throw new Error("Не авторизован");

      let delRes = await doDelete(token);
      if (delRes.status === 401) {
        token = await refreshSession();
        delRes = await doDelete(token);
      }

      if (!delRes.ok) throw new Error("Не удалось удалить промокод");

      sessionStorage.removeItem(detailCacheKey);

      toast.success("Промокод удален");
      // Clear SWR cache for promocodes list
      mutate((key) => typeof key === "string" && key.includes("/v2/admin/promocode"));
      
      router.push("/promotions");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const header = (
    <div className="flex w-full items-center gap-8">
      <h1 className="text-[28px] font-bold leading-none tracking-[-0.03em] text-[#111322]">
        Акции и промокоды
      </h1>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout header={header}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      header={header}
      headerClassName="pl-4 pr-8"
      contentClassName="min-h-0 p-0"
    >
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto rounded-[24px] border border-border bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
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
              Редактирование промокода
            </div>

            <div className="h-4 w-px bg-[#DCDCE6] mx-2" />

            <div className="relative">
              <button
                type="button"
                onClick={() => setShopOpen(!shopOpen)}
                className="flex items-center gap-2 text-[15px] font-medium text-[#111111]"
                disabled={shopsLoading || Boolean(shopsError)}
              >
                {shopId === -1 ? (
                  <div className="w-6 h-6 rounded-full bg-[#5AC800] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ) : selectedShop?.photo?.url ? (
                  <img
                    src={getImageUrl(selectedShop.photo, {
                      width: 40,
                      height: 40,
                      fit: "cover",
                    })}
                    alt={selectedShop.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold border border-gray-200">
                    {selectedShop?.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                )}
                <span className="max-w-[150px] truncate">
                  {shopId === -1 ? "Региональный" : selectedShop?.name || "Загрузка..."}
                </span>
                <ChevronDown className="w-4 h-4 text-[#8E8E93]" />
              </button>

              {shopOpen && !shopsLoading && !shopsError && (
                <>
                  <div
                    className="fixed inset-0 z-10 cursor-default"
                    onClick={() => setShopOpen(false)}
                  />
                  <div className="absolute z-20 top-[40px] left-0 w-80 bg-white rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] py-2 overflow-hidden max-h-[400px] overflow-y-auto no-scrollbar border border-border">
                    <button
                      type="button"
                      className="w-full px-5 py-3.5 text-left text-[15px] hover:bg-gray-50/50 flex items-center justify-between transition-colors whitespace-nowrap"
                      onClick={() => {
                        setShopId(-1);
                        setShopOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#5AC800] flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-[#111111] font-medium">Региональный</span>
                      </div>
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full transition-all",
                          shopId === -1
                            ? "bg-[#5AC800] border-[1px] border-white ring-[2.5px] ring-[#5AC800]"
                            : "bg-[#F2F2F7]",
                        )}
                      />
                    </button>

                    {(shops || []).map((s) => (
                      <div key={s.id}>
                        <div className="mx-5 h-px bg-[#F2F2F7]" />
                        <button
                          type="button"
                          className="w-full px-5 py-3.5 text-left text-[15px] hover:bg-gray-50/50 flex items-center justify-between transition-colors"
                          onClick={() => {
                            setShopId(s.id);
                            setShopOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            {s.photo ? (
                              <img
                                src={getImageUrl(s.photo, {
                                  width: 40,
                                  height: 40,
                                  fit: "cover",
                                })}
                                alt={s.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[#F6F6FA] flex items-center justify-center text-[#111111] font-bold text-sm">
                                {s.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-[#111111] font-medium truncate max-w-[140px]">
                                {s.name}
                              </span>
                              <span className="text-[11px] text-[#8E8E93]">
                                ID {s.id}
                              </span>
                            </div>
                          </div>
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full transition-all",
                              shopId === s.id
                                ? "bg-[#5AC800] border-[1px] border-white ring-[2.5px] ring-[#5AC800]"
                                : "bg-[#F2F2F7]",
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 text-[14px] font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
            >
              {deleting ? <Spinner size={16} /> : <Trash2 className="w-4 h-4" />}
              Удалить
            </button>
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
        </div>

        <div className="px-6 py-6 space-y-6">
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
              <Input
                placeholder="Поле ввода"
                value={promocodeName}
                onChange={(e) => setPromocodeName(e.target.value)}
                className="bg-[#F6F6FA] border-none rounded-xl h-[46px] px-4 font-medium"
              />
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
                  className="bg-[#F6F6FA] border-none rounded-xl h-[46px] px-4 font-medium pr-12 focus:ring-1 focus:ring-[#5AC800]"
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
        </div>
      </div>
    </DashboardLayout>
  );
}
