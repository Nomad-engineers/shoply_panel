"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

import { cn } from "@/lib/theme";
import { getImageUrl } from "@/lib/utils";
import type { Banner } from "@/types/banner";
import { Divider, InputV2 } from "@/components/ui";
import { useAuth } from "@/components/hooks/useLogin";
import {
  MarketingCheckIcon,
  MarketingCloseIcon,
  MarketingTrashIcon,
  MarketingUploadIcon,
} from "@/components/icons/marketing-icons";

export type BannerImage = {
  name: string;
  url: string;
} | null;

interface CreateBannerSheetProps {
  open: boolean;
  onClose: () => void;
  banner?: Banner | null;
  onSuccess?: () => void;
}

interface LocalBannerImage {
  name: string;
  url: string;
  file: File | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

const BannerImageField = ({
  label,
  recommended,
  aspect,
  value,
  onSelectFile,
  onRemove,
}: {
  label: string;
  recommended: string;
  aspect: "portrait" | "square";
  value: LocalBannerImage | null;
  onSelectFile: (file: File) => void;
  onRemove: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File | null | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Можно загрузить только изображение");
      return;
    }
    setError(null);
    onSelectFile(file);
  };

  return (
    <div className="space-y-2">
      <div className="text-[16px] font-medium leading-[18px] text-[var(--text-txt-main-100,#0E0F27)]">
        {label}
      </div>
      <div className="text-[12px] font-medium leading-[13.5px] text-[var(--text-txt-main-50,#0E0F2780)]">
        {recommended}
      </div>

      <div className="flex items-start gap-3 pt-1">
        {value ? (
          <div
            className={cn(
              "relative overflow-hidden rounded-[6.4px] border border-[#DCDCE6] bg-[#F6F6FA]",
              aspect === "portrait"
                ? "h-[153.6px] w-[102.4px]"
                : "h-[102.4px] w-[102.4px]"
            )}
          >
            <Image
              src={value.url}
              alt={value.name}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        ) : (
          <div
            className={cn(
              "grid place-items-center rounded-[6.4px] bg-[var(--sf-purple-25,#F9DCFF)] px-2 text-center text-[9.6px] font-normal leading-[11.2px] text-[var(--text-txt-purple-100,#8A30FF)]",
              aspect === "portrait"
                ? "h-[153.6px] w-[102.4px]"
                : "h-[102.4px] w-[102.4px]"
            )}
          >
            Нет
            <br />
            изображения
          </div>
        )}

        <div className="space-y-2 pt-1">
          {value && (
            <div className="max-w-[120px] truncate text-[12px] font-medium leading-[13.5px] text-[var(--text-txt-main-50,#0E0F2780)]">
              {value.name}
            </div>
          )}

          {value ? (
            <button
              type="button"
              onClick={() => {
                setError(null);
                onRemove();
              }}
              className="inline-flex h-[34px] cursor-pointer items-center gap-[8px] rounded-[17px] border border-[#DCDCE6] bg-white px-[12px] text-[13px] font-medium text-[#0E0F27] transition-colors hover:bg-[#F6F6FA]"
            >
              <MarketingTrashIcon className="h-[16px] w-[16px]" />
              Удалить
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="inline-flex h-[34px] cursor-pointer items-center gap-[8px] rounded-[17px] border border-[#DCDCE6] bg-white px-[12px] text-[13px] font-medium text-[#0E0F27] transition-colors hover:bg-[#F6F6FA]"
              >
                <MarketingUploadIcon className="h-[16px] w-[16px]" />
                Загрузить
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  handleFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="text-[12px] font-medium text-[#F5462C]">{error}</div>
      )}
    </div>
  );
};

const fileToImageState = (file: File): LocalBannerImage => ({
  name: file.name,
  url: URL.createObjectURL(file),
  file,
});

export const CreateBannerSheet = ({
  open,
  onClose,
  banner,
  onSuccess,
}: CreateBannerSheetProps) => {
  const isEdit = banner != null;
  const { refreshSession } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [technicalDescription, setTechnicalDescription] = useState("");
  const [inArchive, setInArchive] = useState(false);
  const [cover, setCover] = useState<LocalBannerImage | null>(null);
  const [inlineImage, setInlineImage] = useState<LocalBannerImage | null>(null);

  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [sheetMounted, setSheetMounted] = useState(open);
  const [sheetClosing, setSheetClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(banner?.title ?? "");
      setDescription(banner?.description ?? "");
      setTechnicalDescription(banner?.technicalName ?? "");
      setInArchive(banner?.inArchive ?? false);
      setCover(
        banner?.cover
          ? {
              name: banner.cover.filenameDownload ?? "Название.png",
              url: getImageUrl(banner.cover),
              file: null,
            }
          : null
      );
      setInlineImage(
        banner?.image
          ? {
              name: banner.image.filenameDownload ?? "Название.png",
              url: getImageUrl(banner.image),
              file: null,
            }
          : null
      );
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
  }, [open, banner]);

  const isSaveDisabled = useMemo(
    () =>
      !title.trim() ||
      !description.trim() ||
      !cover ||
      !inlineImage ||
      saving,
    [title, description, cover, inlineImage, saving]
  );

  const uploadImage = async (file: File): Promise<string> => {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch(`${API_BASE}/files/upload`, {
      method: "POST",
      body: form,
    });

    if (!res.ok) throw new Error("Не удалось загрузить изображение");

    const json = await res.json().catch(() => null);
    const fileId = json?.data?.id ?? json?.id;
    if (!fileId) throw new Error("Не удалось загрузить изображение");

    return fileId;
  };

  const authorizedFetch = async (
    input: string,
    init: RequestInit
  ): Promise<Response> => {
    let token = localStorage.getItem("access_token");
    if (!token) throw new Error("Не авторизован");

    let res = await fetch(input, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.status === 401) {
      token = await refreshSession();
      res = await fetch(input, {
        ...init,
        headers: {
          ...init.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return res;
  };

  const submit = async () => {
    setSubmitError(null);
    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        technicalName: technicalDescription.trim() || undefined,
        inArchive,
      };

      if (cover?.file) payload.coverId = await uploadImage(cover.file);
      if (inlineImage?.file) payload.imageId = await uploadImage(inlineImage.file);

      if (isEdit && banner) {
        if (!payload.coverId && banner.cover)
          payload.coverId = banner.cover.id;
        if (!payload.imageId && banner.image)
          payload.imageId = banner.image.id;

        const res = await authorizedFetch(
          `${API_BASE}/v2/admin/banner/${banner.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          throw new Error(json?.message || "Не удалось сохранить баннер");
        }

        toast.success("Изменения сохранены");
      } else {
        if (!payload.coverId || !payload.imageId)
          throw new Error("Загрузите изображения баннера");

        const res = await authorizedFetch(`${API_BASE}/v2/admin/banner`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const json = await res.json().catch(() => null);
          throw new Error(json?.message || "Не удалось создать баннер");
        }

        toast.success("Баннер создан");
      }

      onSuccess?.();
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
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#ECECF3] px-5 py-4">
          <div className="font-[Inter_Tight] text-[20px] font-semibold leading-[22px] text-[var(--text-txt-main-100,#0E0F27)]">
            {isEdit ? "Редактирование баннера" : "Создание баннера"}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              title="Закрыть"
              className="inline-flex h-[36px] w-[48px] cursor-pointer items-center justify-center rounded-[18px] bg-[var(--sf-red-100,#F5462C)] text-white transition-colors hover:bg-[#e03d24]"
            >
              <MarketingCloseIcon className="h-[24px] w-[24px]" />
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={isSaveDisabled}
              title={isEdit ? "Сохранить" : "Создать баннер"}
              className={cn(
                "inline-flex h-[36px] items-center gap-[8px] whitespace-nowrap rounded-[18px] py-[6px] pl-[12px] pr-[18px] font-[Inter_Tight] text-[16px] font-medium leading-[18px] text-white transition-colors",
                isSaveDisabled
                  ? "cursor-default bg-[#D9D9DF]"
                  : "cursor-pointer bg-[#55CB00] hover:bg-[#4db800]"
              )}
            >
              <MarketingCheckIcon className="h-[24px] w-[24px] shrink-0" />
              {isEdit ? "Сохранить" : "Создать баннер"}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
          {/* Изображения */}
          <div className="grid grid-cols-2 gap-6">
            <BannerImageField
              label="Обложка"
              recommended="Рекомендуемое разрешение 640х960"
              aspect="portrait"
              value={cover}
              onSelectFile={(file) => setCover(fileToImageState(file))}
              onRemove={() => setCover(null)}
            />
            <BannerImageField
              label="Вложенная картинка"
              recommended="Рекомендуемое разрешение 640х640"
              aspect="square"
              value={inlineImage}
              onSelectFile={(file) => setInlineImage(fileToImageState(file))}
              onRemove={() => setInlineImage(null)}
            />
          </div>

          <Divider />

          {/* Заголовок */}
          <div className="space-y-2">
            <div className="text-[12px] font-medium leading-[13.5px] text-[var(--text-txt-main-50,#0E0F2780)]">
              Заголовок (Рекомендуемое кол-во символов 15-20)*
            </div>
            <InputV2
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Поле ввода"
              width={480}
            />
          </div>

          {/* Описание */}
          <div className="space-y-2">
            <div className="text-[12px] font-medium leading-[13.5px] text-[var(--text-txt-main-50,#0E0F2780)]">
              Описание (рекомендуем до 86 символов)*
            </div>
            <InputV2
              multiline
              rows={5}
              height={178}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Поле ввода"
              width={480}
            />
          </div>

          <Divider />

          {/* Техническое описание */}
          <div className="space-y-2">
            <div className="text-[12px] font-medium leading-[13.5px] text-[var(--text-txt-main-50,#0E0F2780)]">
              Техническое описание (не обязательно)
            </div>
            <InputV2
              multiline
              rows={5}
              height={178}
              value={technicalDescription}
              onChange={(e) => setTechnicalDescription(e.target.value)}
              placeholder="Поле ввода"
              width={480}
            />
          </div>

          <Divider />

          {/* Архивация */}
          <div className="space-y-3">
            <div className="text-[12px] font-medium leading-[13.5px] text-[var(--text-txt-main-50,#0E0F2780)]">
              Архивировать баннер (не будет отображаться на гл. экране)
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={inArchive}
              aria-label="В архив"
              onClick={() => setInArchive(!inArchive)}
              className="flex cursor-pointer items-center gap-3"
            >
              <span
                className={cn(
                  "inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full p-[2px] transition-colors",
                  inArchive ? "bg-[#55CB00]" : "bg-[#D9D9DF]"
                )}
              >
                <span
                  className={cn(
                    "h-[18px] w-[18px] rounded-full bg-white shadow transition-transform",
                    inArchive && "translate-x-[16px]"
                  )}
                />
              </span>
              <span className="text-[16px] font-medium text-[#0E0F27]">
                В архив
              </span>
            </button>
          </div>

          {submitError && (
            <div className="text-[13px] font-medium text-[#F5462C]">
              {submitError}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
