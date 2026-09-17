"use client";

import { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

import { cn } from "@/lib/theme";
import { Divider, InputV2 } from "@/components/ui";
import {
  createPush,
  usePushRecipients,
} from "@/components/hooks/usePushNotifications";
import { SelectRegionsModal } from "@/components/promotions/select-regions-modal";
import type { SelectedRegionOption } from "@/components/promotions/select-regions-modal";
import type { PushNotification } from "@/types/push-notification";
import {
  MarketingCheckIcon,
  MarketingCloseIcon,
} from "@/components/icons/marketing-icons";

type ScheduleMode = "now" | "scheduled";

interface CreatePushSheetProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (push: PushNotification) => void;
}

export const CreatePushSheet = ({
  open,
  onClose,
  onSuccess,
}: CreatePushSheetProps) => {
  const [region, setRegion] = useState<SelectedRegionOption | null>(null);
  const [regionModalOpen, setRegionModalOpen] = useState(false);

  const { total: recipientsCount } = usePushRecipients({
    regionId: region?.id,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technicalDescription, setTechnicalDescription] = useState("");
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("now");
  const [sendAt, setSendAt] = useState<Date | null>(null);

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [sheetMounted, setSheetMounted] = useState(open);
  const [sheetClosing, setSheetClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setRegion(null);
      setRegionModalOpen(false);
      setTitle("");
      setDescription("");
      setTechnicalDescription("");
      setScheduleMode("now");
      setSendAt(null);
      setSubmitError(null);
      setSheetMounted(true);
      setSheetClosing(false);
      return;
    }

    setSheetClosing(true);
    const timer = setTimeout(() => {
      setSheetMounted(false);
      setSheetClosing(false);
    }, 320);

    return () => clearTimeout(timer);
  }, [open]);

  const isSaveDisabled = useMemo(() => {
    if (!title.trim()) return true;
    if (!description.trim()) return true;
    if (scheduleMode === "scheduled" && !sendAt) return true;
    return false;
  }, [title, description, scheduleMode, sendAt]);

  const submit = async () => {
    setSubmitError(null);
    setSaving(true);

    try {
      const created = await createPush({
        title: title.trim(),
        description: description.trim(),
        technicalName: technicalDescription.trim() || undefined,
        scheduledAt:
          scheduleMode === "scheduled" && sendAt
            ? sendAt.toISOString()
            : undefined,
        regionId: region?.id,
      });

      if (created.status === "scheduled") {
        toast.success(
          `Push запланирован на ${formatDateTime(created.scheduledAt)} для ${created.totalRecipients.toLocaleString("ru-RU")} получателей`
        );
      } else {
        toast.success(
          `Push создан. Отправляется ${created.totalRecipients.toLocaleString("ru-RU")} получателям`
        );
      }

      onSuccess?.(created);
      onClose();
    } catch (e: any) {
      setSubmitError(e.message ?? "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  const formatDateTime = (iso: string | null) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
          transform: regionModalOpen ? "translateX(340px)" : "translateX(0)",
          transition: "transform 320ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#ECECF3] px-5 py-4">
          <div className="font-[Inter_Tight] text-center text-[20px] font-semibold leading-[22px] text-[var(--text-txt-main-100,#0E0F27)]">
            Создание Push
          </div>

          <div className="flex items-center gap-2">
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
              title="Создать push"
              className={cn(
                "inline-flex h-[36px] items-center gap-[8px] whitespace-nowrap rounded-[18px] py-[6px] pl-[12px] pr-[18px] font-[Inter_Tight] text-[16px] font-medium leading-[18px] text-white transition-colors",
                isSaveDisabled || saving
                  ? "cursor-default bg-[#D9D9DF]"
                  : "cursor-pointer bg-[#55CB00] hover:bg-[#4db800]"
              )}
            >
              <MarketingCheckIcon className="h-[24px] w-[24px] shrink-0" />
              Создать push
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
          {/* Регион */}
          <div className="space-y-2">
            <div className="text-[12px] font-medium leading-[13.5px] text-[var(--text-txt-main-50,#0E0F2780)]">
              Выберите регион для отправки
            </div>
            <button
              type="button"
              onClick={() => setRegionModalOpen(true)}
              className="flex h-[52px] w-full cursor-pointer items-center justify-between rounded-[12px] border border-[var(--stroke-100,#DCDCE6)] bg-[#F6F6FA] px-[14px] text-left transition-colors hover:bg-[#EFEFF5]"
            >
              <span className="text-[16px] font-medium text-[#0E0F27]">
                 {region?.name ?? "Все регионы"}
              </span>
              <Pencil className="h-[18px] w-[18px] text-[#0E0F27]" />
            </button>
          </div>

          {/* Заголовок */}
          <div className="space-y-2">
            <div className="text-[12px] font-medium leading-[13.5px] text-[var(--text-txt-main-50,#0E0F2780)]">
              Заголовок (Рекомендуем писать что-то среднего размера 15-20)
            </div>
            <InputV2
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Поле ввода"
            />
          </div>

          {/* Описание */}
          <div className="space-y-2">
            <div className="text-[12px] font-medium leading-[13.5px] text-[var(--text-txt-main-50,#0E0F2780)]">
              Описание (рекомендуем до 88 символов)
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Поле ввода"
              rows={4}
              className="w-full resize-none rounded-[12px] border border-[var(--stroke-100,#DCDCE6)] bg-[#EEEEF480] p-[14px] text-[16px] font-medium leading-[18px] text-[#0E0F27] outline-none ring-1 ring-transparent transition-shadow placeholder:text-[#0E0F2780] focus:ring-[#55CB00]"
            />
          </div>

          <Divider />

          {/* Техническое описание */}
          <div className="space-y-2">
            <div className="text-[12px] font-medium leading-[13.5px] text-[var(--text-txt-main-50,#0E0F2780)]">
              Техническое описание
            </div>
            <textarea
              value={technicalDescription}
              onChange={(e) => setTechnicalDescription(e.target.value)}
              placeholder="Поле ввода"
              rows={4}
              className="w-full resize-none rounded-[12px] border border-[var(--stroke-100,#DCDCE6)] bg-[#EEEEF480] p-[14px] text-[16px] font-medium leading-[18px] text-[#0E0F27] outline-none ring-1 ring-transparent transition-shadow placeholder:text-[#0E0F2780] focus:ring-[#55CB00]"
            />
          </div>

          <Divider />

          {/* Аудитория */}
          <div className="flex items-center justify-between rounded-[12px] bg-[#F6F6FA] px-[14px] py-[12px]">
            <div className="text-[14px] font-medium text-[#0E0F27]">
              Аудитория рассылки
            </div>
            <div className="text-[14px] font-semibold text-[#0E0F27]">
              {recipientsCount === null
                ? "—"
                : `${recipientsCount.toLocaleString("ru-RU")} чел.`}
            </div>
          </div>

          <Divider />

          {/* Отправка */}
          <div className="space-y-3">
            <div className="text-[12px] font-medium leading-[13.5px] text-[var(--text-txt-main-50,#0E0F2780)]">
              Активировать сразу с датой (переключение доступно только один
              раз)
            </div>

            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setScheduleMode("now")}
                className="flex items-center gap-2"
              >
                <span
                  className={cn(
                    "grid h-[20px] w-[20px] place-items-center rounded-full border bg-white transition-colors",
                    scheduleMode === "now"
                      ? "border-[#55CB00]"
                      : "border-[#09091D40]"
                  )}
                >
                  <span
                    className={cn(
                      "h-[10px] w-[10px] rounded-full transition-colors",
                      scheduleMode === "now"
                        ? "bg-[#55CB00]"
                        : "bg-transparent"
                    )}
                  />
                </span>
                <span className="text-[14px] font-medium text-[#0E0F27]">
                  Сейчас
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScheduleMode("scheduled")}
                className="flex items-center gap-2"
              >
                <span
                  className={cn(
                    "grid h-[20px] w-[20px] place-items-center rounded-full border bg-white transition-colors",
                    scheduleMode === "scheduled"
                      ? "border-[#55CB00]"
                      : "border-[#09091D40]"
                  )}
                >
                  <span
                    className={cn(
                      "h-[10px] w-[10px] rounded-full transition-colors",
                      scheduleMode === "scheduled"
                        ? "bg-[#55CB00]"
                        : "bg-transparent"
                    )}
                  />
                </span>
                <span className="text-[14px] font-medium text-[#0E0F27]">
                  Выбрать время
                </span>
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <div className="text-[12px] font-medium leading-[13.5px] text-[var(--text-txt-main-50,#0E0F2780)]">
                Время отправки
              </div>
              <DatePicker
                selected={sendAt}
                onChange={(date) => setSendAt(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={5}
                dateFormat="dd-MM-yyyy, HH:mm"
                placeholderText="ДД.ММ.ГГГГ, ЧЧ:мм"
                disabled={scheduleMode === "now"}
                wrapperClassName="w-full"
                className="h-[44px] w-full cursor-pointer rounded-[12px] border-0 bg-[#F6F6FA] px-[14px] text-[14px] font-medium text-[#0E0F27] outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          {submitError && (
            <div className="text-[13px] font-medium text-[#F5462C]">
              {submitError}
            </div>
          )}
        </div>
      </aside>

      <SelectRegionsModal
        open={regionModalOpen}
        selected={region ? [region] : []}
        onConfirm={(regions) => {
          setRegion(regions[0] ?? null);
          setRegionModalOpen(false);
        }}
        onClose={() => setRegionModalOpen(false)}
      />
    </>
  );
};
