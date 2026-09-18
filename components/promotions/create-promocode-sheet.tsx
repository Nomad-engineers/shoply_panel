"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import {
  type AllowedUserOption,
} from "@/components/promotions/allowed-users-field";
import { ToggleField } from "@/components/promotions/toggle-field";
import { SelectUsersModal } from "@/components/promotions/select-users-modal";
import {
  SelectShopsModal,
  type SelectedShopOption,
} from "@/components/promotions/select-shops-modal";
import { attachAllowedUsersToPromocode } from "@/lib/promocode-allowed-users";
import { cn } from "@/lib/theme";
import { useAuth } from "@/components/hooks/useLogin";
import type { Promocode } from "@/types/promocode";
import { InputV2, Divider } from "@/components/ui";
import {
  MarketingCheckIcon,
  MarketingCloseIcon,
  MarketingCopyIcon,
  MarketingTrashIcon,
  MarketingUserIcon,
} from "@/components/icons/marketing-icons";
import { formatPhone } from "@/lib/phone";

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

interface CreatePromocodeSheetProps {
  open: boolean;
  onClose: () => void;
  promocode?: Promocode | null;
}

const mapAllowedUsersFromPromocode = (p: Promocode): AllowedUserOption[] =>
  (p.allowedUsers ?? []).reduce<AllowedUserOption[]>((acc, user) => {
    const resolvedUserId = user.userId ?? user.id ?? null;

    if (resolvedUserId === null) {
      return acc;
    }

    acc.push({
      id: resolvedUserId,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone ?? null,
      email: user.email ?? null,
      photoId: user.photoId,
    });

    return acc;
  }, []);

export const CreatePromocodeSheet = ({
  open,
  onClose,
  promocode,
}: CreatePromocodeSheetProps) => {
  const isEdit = promocode != null;
  const queryClient = useQueryClient();
  const { adminData, refreshSession, loading: authLoading } = useAuth();
  const isAdmin = adminData?.isAdmin ?? false;
  const derivedShopId = adminData?.shopId ?? null;

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [forShops, setForShops] = useState(false);
  const [selectedShops, setSelectedShops] = useState<SelectedShopOption[]>([]);
  const [shopsModalOpen, setShopsModalOpen] = useState(false);

  const [technicalName, setTechnicalName] = useState("");
  const [promocodeName, setPromocodeName] = useState("");

  const [type, setType] = useState<DiscountType>("fixed");
  const [valueForType, setValueForType] = useState<number>(0);

  const [usageMode, setUsageMode] = useState<UsageMode>("quantity");
  const [usageLimit, setUsageLimit] = useState<number>(0);

  const [minSum, setMinSum] = useState<number>(0);
  const [oneActivation, setOneActivation] = useState(false);
  const [allowedUsers, setAllowedUsers] = useState<AllowedUserOption[]>([]);
  const [usersModalOpen, setUsersModalOpen] = useState(false);

  const [initialAllowedUserIds, setInitialAllowedUserIds] = useState<number[]>(
    []
  );
  const [initialRegionIds, setInitialRegionIds] = useState<number[]>([]);
  const [initialPayFromShop, setInitialPayFromShop] = useState(false);

  const addedByName =
    adminData?.firstName?.trim() ||
    adminData?.lastName?.trim() ||
    "—";

  const [validUntil, setValidUntil] = useState<string>("");

  const [typeOpen, setTypeOpen] = useState(false);
  const [usageOpen, setUsageOpen] = useState(false);

  useEffect(() => {
    if (usageMode === "infinite") setUsageLimit(0);
  }, [usageMode]);

  const [sheetMounted, setSheetMounted] = useState(open);
  const [sheetClosing, setSheetClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setSheetMounted(true);
      setSheetClosing(false);
      return;
    }

    setSheetClosing(true);
    setUsersModalOpen(false);
    setShopsModalOpen(false);
    const timer = setTimeout(() => {
      setSheetMounted(false);
      setSheetClosing(false);
    }, 320);

    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setTypeOpen(false);
      setUsageOpen(false);
    }
  }, [open]);

  const promocodeId = promocode?.id ?? null;

  useEffect(() => {
    if (!open || !promocode) return;

    setTechnicalName(promocode.technicalName || "");
    setPromocodeName(promocode.name || "");
    setMinSum(promocode.minSum || 0);
    setType((promocode.type as DiscountType) || "fixed");
    setValueForType(promocode.valueForType || 0);
    setOneActivation(
      Boolean(
        promocode.onlyOneActivation ??
          promocode.oneActivation ??
          (typeof promocode.useMultiple === "boolean"
            ? !promocode.useMultiple
            : false)
      )
    );

    const mappedUsers = mapAllowedUsersFromPromocode(promocode);
    setAllowedUsers(mappedUsers);
    setInitialAllowedUserIds(mappedUsers.map((user) => user.id));
    setInitialRegionIds((promocode.regions ?? []).map((region) => region.id));
    setInitialPayFromShop(Boolean(promocode.payFromShop));

    const sid = promocode.shop?.id ?? promocode.shopId ?? null;
    if (isAdmin && sid != null) {
      setForShops(true);
      setSelectedShops([
        { id: sid, name: promocode.shop?.name || `ID ${sid}` },
      ]);
    } else {
      setForShops(false);
      setSelectedShops([]);
    }

    if (
      promocode.usageLimit === null ||
      promocode.usageLimit === undefined ||
      promocode.usageLimit === 0
    ) {
      if (promocode.validUntil) {
        setUsageMode("temporary");
        setValidUntil(new Date(promocode.validUntil).toISOString().slice(0, 16));
      } else {
        setUsageMode("infinite");
        setValidUntil("");
      }
      setUsageLimit(0);
    } else {
      setUsageMode("quantity");
      setUsageLimit(promocode.usageLimit);
      setValidUntil("");
    }

    setSubmitError(null);
  }, [open, promocodeId]);

  const isSaveDisabled = useMemo(() => {
    if (authLoading) return true;
    if (!forShops && !isAdmin && !derivedShopId) return true;
    if (!technicalName.trim()) return true;
    if (!promocodeName.trim()) return true;
    if (type === "fixed" && valueForType <= 0) return true;
    if (type === "percent" && (valueForType <= 0 || valueForType > 100))
      return true;
    if (usageMode === "quantity" && usageLimit <= 0) return true;
    if (usageMode === "temporary" && !validUntil) return true;
    return false;
  }, [
    authLoading,
    derivedShopId,
    forShops,
    isAdmin,
    promocodeName,
    technicalName,
    type,
    usageLimit,
    usageMode,
    validUntil,
    valueForType,
  ]);

  const buildBody = () => ({
    technicalName: technicalName.trim(),
    promocodeName: promocodeName.trim(),
    minSum: Number(minSum) || 0,
    usageLimit: usageMode === "quantity" ? Number(usageLimit) || 0 : null,
    valueForType: Number(valueForType) || 0,
    validUntil:
      usageMode === "temporary" && validUntil
        ? new Date(validUntil).toISOString()
        : null,
    type,
    regionIds: [1],
    payFromShop: false,
    onlyOneActivation: oneActivation,
  });

  const submitCreate = async () => {
    const targetShopIds: (number | null)[] = forShops
      ? selectedShops.map((shop) => shop.id)
      : derivedShopId != null
        ? [derivedShopId]
        : [];
    if (targetShopIds.length === 0) targetShopIds.push(null);

    const body = buildBody();

    const doPost = async (token: string, shopId: number | null) => {
      return fetch(`${process.env.NEXT_PUBLIC_API_URL}/v2/admin/promocode`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...body, shopId }),
      });
    };

    let token = localStorage.getItem("access_token");
    if (!token) throw new Error("Не авторизован");

    const createdPromocodeIds: number[] = [];

    for (const shopId of targetShopIds) {
      let postRes = await doPost(token, shopId);
      if (postRes.status === 401) {
        token = await refreshSession();
        postRes = await doPost(token, shopId);
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
      if (createdPromocodeId) createdPromocodeIds.push(createdPromocodeId);
    }

    if (isAdmin && allowedUsers.length > 0) {
      for (const createdPromocodeId of createdPromocodeIds) {
        await attachAllowedUsersToPromocode({
          promocodeId: createdPromocodeId,
          userIds: allowedUsers.map((user) => user.id),
          accessToken: token,
          refreshSession,
        });
      }
    }
  };

  const submitEdit = async (editing: Promocode) => {
    const shopId = forShops ? (selectedShops[0]?.id ?? null) : derivedShopId;
    const base = isAdmin
      ? `${process.env.NEXT_PUBLIC_API_URL}/v2/admin/promocode`
      : `${process.env.NEXT_PUBLIC_API_URL}/v2/shop/${derivedShopId}/promocode`;

    const body = {
      ...buildBody(),
      shopId,
      regionIds: initialRegionIds.length > 0 ? initialRegionIds : [1],
      payFromShop: initialPayFromShop,
    };

    const doPatch = async (token: string) => {
      return fetch(`${base}/${editing.id}`, {
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
      const errorJson = await patchRes.json().catch(() => null);
      throw new Error(errorJson?.message || "Не удалось обновить промокод");
    }

    const nextAllowedUserIds = allowedUsers.map((user) => user.id);
    const newAllowedUserIds = nextAllowedUserIds.filter(
      (userId) => !initialAllowedUserIds.includes(userId)
    );

    if (isAdmin && newAllowedUserIds.length > 0) {
      await attachAllowedUsersToPromocode({
        promocodeId: editing.id,
        userIds: newAllowedUserIds,
        accessToken: token,
        refreshSession,
      });
    }

    toast.success("Промокод обновлён");
  };

  const submit = async () => {
    setSubmitError(null);
    setSaving(true);

    try {
      if (isEdit && promocode) {
        await submitEdit(promocode);
      } else {
        await submitCreate();
      }

      queryClient.invalidateQueries({ queryKey: ["promocodes"] });
      onClose();
    } catch (e: any) {
      setSubmitError(e.message ?? "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  if (!sheetMounted) return null;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-[#09091D]/30",
          sheetClosing ? "animate-overlay-out" : "animate-overlay-in"
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-[640px] max-w-full flex-col bg-white shadow-[-20px_0_60px_rgba(15,23,42,0.15)]",
          sheetClosing ? "animate-sheet-out" : "animate-sheet-in"
        )}
        style={{
          transform:
            usersModalOpen || shopsModalOpen
              ? "translateX(340px)"
              : "translateX(0)",
          transition: "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#ECECF3] px-4 py-4 sm:px-5">
          <div className="min-w-0 font-[Inter_Tight] text-[18px] font-semibold leading-[22px] text-[var(--text-txt-main-100,#0E0F27)] sm:text-center sm:text-[20px]">
            {isEdit ? "Редактирование промокода" : "Создание промокода"}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              title="Закрыть"
              className="inline-flex h-[36px] w-[48px] cursor-pointer items-center justify-center gap-[8px] rounded-[18px] bg-[var(--sf-red-100,#F5462C)] px-[12px] py-[6px] text-white transition-colors hover:bg-[#e03d24]"
            >
              <MarketingCloseIcon className="h-[24px] w-[24px]" />
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={isSaveDisabled || saving}
              title={isEdit ? "Сохранить" : "Создать промокод"}
              className={cn(
                "inline-flex h-[36px] items-center gap-[8px] whitespace-nowrap rounded-[18px] px-[12px] py-[6px] font-[Inter_Tight] text-[16px] font-medium leading-[18px] text-white transition-colors max-sm:text-[14px]",
                isEdit ? "w-auto" : "w-[201px] max-lg:w-auto",
                isSaveDisabled || saving
                  ? "cursor-default bg-[#D9D9DF]"
                  : "cursor-pointer bg-[#55CB00] hover:bg-[#4db800]"
              )}
            >
              <MarketingCheckIcon className="h-[24px] w-[24px] shrink-0 max-sm:h-[18px] max-sm:w-[18px]" />
              <span className="max-sm:hidden">
                {isEdit ? "Сохранить" : "Создать промокод"}
              </span>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
          {/* Для магазинов */}
          <ToggleField
            label="Для магазинов"
            description="Выберите продавцов для промокода"
            checked={forShops}
            onChange={(checked) => {
              if (checked) {
                setForShops(true);
                setShopsModalOpen(true);
              } else {
                setForShops(false);
                setSelectedShops([]);
              }
            }}
            action={
              forShops ? (
                <button
                  type="button"
                  onClick={() => setShopsModalOpen(true)}
                  className="inline-flex h-[36px] cursor-pointer items-center gap-[8px] whitespace-nowrap rounded-full bg-[#EDEDF2] px-[18px] text-[14px] font-medium text-[#0E0F27] transition-colors hover:bg-[#e0e0e8]"
                >
                  <Pencil className="h-[16px] w-[16px]" />
                  Изменить список
                </button>
              ) : undefined
            }
          />

          {forShops && selectedShops.length > 0 && (
            <div className="space-y-2">
              {selectedShops.map((shop) => (
                <div
                  key={shop.id}
                  className="flex min-h-[48px] items-center gap-3 rounded-[12px] bg-[#F6F6FA] py-[6px] pl-[18px] pr-[6px]"
                >
                  <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-[#0E0F27]">
                    {shop.name}
                  </span>
                  <span className="shrink-0 text-[13px] text-[#8E8E93]">
                    ID {shop.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = selectedShops.filter((s) => s.id !== shop.id);
                      setSelectedShops(next);
                      if (next.length === 0) setForShops(false);
                    }}
                    title="Удалить магазин"
                    className="inline-flex h-[36px] w-[48px] shrink-0 cursor-pointer items-center justify-center gap-[8px] rounded-[18px] bg-[#F5462C] px-[12px] py-[6px] text-white transition-colors hover:bg-[#e03d24]"
                  >
                    <MarketingTrashIcon className="h-[24px] w-[24px]" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Divider />

          {/* Техническое название */}
          <div className="space-y-2">
            <div className="text-[12px] font-medium leading-[13.5px] text-[var(--text-txt-main-50,#0E0F2780)]">
              Техническое название
            </div>
            <InputV2
              value={technicalName}
              onChange={(e) => setTechnicalName(e.target.value)}
              placeholder="Поле ввода"
              className="w-full max-w-[354px]"
            />
          </div>

          {/* Промокод */}
          <div className="space-y-2">
            <div className="text-[12px] font-medium leading-[13.5px] text-[var(--text-txt-main-50,#0E0F2780)]">Промокод</div>
            <div className="flex items-center gap-3">
              <InputV2
                value={promocodeName}
                onChange={(e) => setPromocodeName(e.target.value)}
                placeholder="Поле ввода"
                className="w-full max-w-[354px]"
              />
              <button
                type="button"
                onClick={() => {
                  const code = generateCode();
                  setPromocodeName(code);
                  if (!technicalName) setTechnicalName(code);
                }}
                className="shrink-0 cursor-pointer text-[13px] font-semibold text-[#2F80ED] hover:underline"
              >
                Сгенерировать
              </button>
            </div>
          </div>

          <Divider />

          {/* Содержание */}
          <div className="space-y-2">
            <div className="text-[12px] font-medium text-[#8E8E93]">Содержание</div>
            <div className="flex items-center gap-3">
              <InputV2
                type="number"
                min={0}
                value={String(valueForType)}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setValueForType(Number.isNaN(v) ? 0 : Math.max(0, v));
                }}
                disabled={type === "freeDelivery"}
                suffix={type === "percent" ? "%" : type === "fixed" ? "руб" : ""}
                className="w-full max-w-[354px]"
              />

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setTypeOpen(!typeOpen);
                    setUsageOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-[#0E0F27]"
                >
                  {type === "fixed"
                    ? "Фиксированный"
                    : type === "percent"
                      ? "Процент"
                      : "Бесплатная доставка"}
                  <ChevronDown className="h-[14px] w-[14px] text-[#8E8E93]" />
                </button>

                {typeOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setTypeOpen(false)}
                    />
                    <div className="absolute right-0 top-8 z-20 w-[200px] rounded-[14px] border border-border bg-white py-1 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
                      {(
                        [
                          ["fixed", "Фиксированный"],
                          ["percent", "Процент"],
                          ["freeDelivery", "Бесплатная доставка"],
                        ] as [DiscountType, string][]
                      ).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setType(value);
                            setTypeOpen(false);
                          }}
                          className="flex h-[40px] w-full cursor-pointer items-center justify-between gap-2 px-3 text-left text-[13px] text-[#0E0F27] transition-colors hover:bg-[#FAFAFC]"
                        >
                          {label}
                          <span
                            className={cn(
                              "grid h-[16px] w-[16px] shrink-0 place-items-center rounded-full border transition-colors",
                              type === value
                                ? "border-[#55CB00] bg-[#55CB00] text-white"
                                : "border-[#09091D40] bg-white"
                            )}
                          >
                            {type === value && (
                              <Check className="h-[10px] w-[10px]" strokeWidth={3} />
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <Divider />

          {/* Условия */}
          <div className="space-y-2">
            <div className="text-[12px] font-medium text-[#8E8E93]">Условия</div>
            <div className="flex items-center gap-3">
              <InputV2
                type="number"
                min={0}
                value={String(usageLimit)}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setUsageLimit(Number.isNaN(v) ? 0 : Math.max(0, v));
                }}
                disabled={usageMode !== "quantity"}
                suffix="шт."
                className="w-full max-w-[354px]"
              />

              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setUsageOpen(!usageOpen);
                    setTypeOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-[#0E0F27]"
                >
                  {usageMode === "quantity"
                    ? "Количество"
                    : usageMode === "infinite"
                      ? "Бесконечный"
                      : "Временный"}
                  <ChevronDown className="h-[14px] w-[14px] text-[#8E8E93]" />
                </button>

                {usageOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10 cursor-default"
                      onClick={() => setUsageOpen(false)}
                    />
                    <div className="absolute right-0 top-8 z-20 w-[200px] rounded-[14px] border border-border bg-white py-1 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
                      {(
                        [
                          ["quantity", "Количество"],
                          ["infinite", "Бесконечный"],
                          ["temporary", "Временный"],
                        ] as [UsageMode, string][]
                      ).map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => {
                            setUsageMode(value);
                            setUsageOpen(false);
                          }}
                          className="flex h-[40px] w-full cursor-pointer items-center justify-between gap-2 px-3 text-left text-[13px] text-[#0E0F27] transition-colors hover:bg-[#FAFAFC]"
                        >
                          {label}
                          <span
                            className={cn(
                              "grid h-[16px] w-[16px] shrink-0 place-items-center rounded-full border transition-colors",
                              usageMode === value
                                ? "border-[#55CB00] bg-[#55CB00] text-white"
                                : "border-[#09091D40] bg-white"
                            )}
                          >
                            {usageMode === value && (
                              <Check className="h-[10px] w-[10px]" strokeWidth={3} />
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <Divider />

          {/* Минимальная сумма */}
          <div className="space-y-2">
            <div className="text-[12px] font-medium leading-snug text-[#8E8E93]">
              Минимальная сумма для активации промокода
            </div>
            <InputV2
              type="number"
              min={0}
              value={String(minSum)}
              onChange={(e) => {
                const v = Number(e.target.value);
                setMinSum(Number.isNaN(v) ? 0 : Math.max(0, v));
              }}
              suffix="руб"
              className="w-full max-w-[354px]"
            />
          </div>

          <Divider />

          {/* Дата окончания */}
          {usageMode === "temporary" && (
            <>
              <div className="space-y-2">
                <div className="text-[12px] font-medium text-[#8E8E93]">
                  Дата окончания
                </div>
                <input
                  type="datetime-local"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="h-[44px] w-full rounded-[12px] border-0 bg-[#F6F6FA] px-[14px] text-[14px] font-medium text-[#0E0F27] outline-none"
                />
              </div>
              <Divider />
            </>
          )}

          {/* Одна активация */}
          <ToggleField
            label="Одна активация"
            description="Активировать можно одному пользователю только один раз"
            checked={oneActivation}
            onChange={setOneActivation}
          />

          <Divider />

          {/* Пользователи */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[16px] font-medium leading-[18px] text-[var(--text-txt-main-100,#0E0F27)]">
                Пользователи
              </div>
              <button
                type="button"
                onClick={() => setUsersModalOpen(true)}
                title="Добавить пользователей"
                className="inline-flex h-[36px] w-[72px] cursor-pointer items-center justify-center rounded-[18px] bg-[#478EFF] px-[12px] py-[6px] text-white transition-colors hover:bg-[#3b7de6]"
              >
                <MarketingUserIcon className="h-[24px] w-[24px]" />
                <Plus className="h-[24px] w-[24px]" strokeWidth={3} />
              </button>
            </div>

            {allowedUsers.map((user) => {
              const fullName =
                `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() ||
                "Без имени";

              return (
                <div
                  key={user.id}
                  className="grid min-h-[48px] items-center gap-x-3 gap-y-1 py-2 max-lg:grid-cols-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_48px] lg:gap-3"
                >
                  <span className="min-w-0 truncate text-[14px] font-medium text-[#0E0F27] max-lg:col-start-1 max-lg:row-start-1">
                    {fullName}
                  </span>
                  <div
                    onClick={() => {
                      if (!user.phone) return;
                      navigator.clipboard.writeText(formatPhone(user.phone));
                      toast.success("Номер скопирован");
                    }}
                    className="flex cursor-pointer items-center gap-2 whitespace-nowrap text-[14px] font-medium text-[#478EFF] transition-opacity hover:opacity-70 max-lg:col-start-1 max-lg:row-start-2 max-lg:justify-self-start"
                  >
                    <MarketingCopyIcon className="h-[18px] w-[18px] shrink-0" />
                    {formatPhone(user.phone)}
                  </div>
                  <span className="whitespace-nowrap text-[13px] text-[#8E8E93] max-lg:col-start-1 max-lg:row-start-3 max-lg:whitespace-normal max-lg:break-words">
                    Добавил: {addedByName}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setAllowedUsers((prev) =>
                        prev.filter((u) => u.id !== user.id)
                      )
                    }
                    title="Удалить пользователя"
                    className="inline-flex h-[36px] w-[48px] cursor-pointer items-center justify-center gap-[8px] rounded-[18px] bg-[#F5462C] px-[12px] py-[6px] text-white transition-colors hover:bg-[#e03d24] max-lg:col-start-2 max-lg:row-start-1 max-lg:row-span-3"
                  >
                    <MarketingTrashIcon className="h-[24px] w-[24px]" />
                  </button>
                </div>
              );
            })}
          </div>

          {submitError && (
            <div className="text-[13px] font-medium text-[#F5462C]">
              {submitError}
            </div>
          )}
        </div>
      </aside>

      <SelectUsersModal
        open={usersModalOpen}
        selected={allowedUsers}
        onClose={() => setUsersModalOpen(false)}
        onConfirm={(users) => {
          setAllowedUsers(users);
          setUsersModalOpen(false);
        }}
      />

      <SelectShopsModal
        open={shopsModalOpen}
        selected={selectedShops}
        single={isEdit}
        onClose={() => {
          setShopsModalOpen(false);
          if (selectedShops.length === 0) setForShops(false);
        }}
        onConfirm={(shops) => {
          setSelectedShops(shops);
          setShopsModalOpen(false);
          if (shops.length === 0) setForShops(false);
        }}
      />
    </>
  );
};
