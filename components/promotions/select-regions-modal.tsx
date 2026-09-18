"use client";

import { useEffect, useMemo, useState } from "react";

import { SelectListModal } from "@/components/promotions/select-list-modal";
import { usePanelRegions } from "@/components/hooks/usePanelRegions";
import type { PanelRegion } from "@/components/hooks/usePanelRegions";

export interface SelectedRegionOption {
  id: number;
  name: string;
}

interface SelectRegionsModalProps {
  open: boolean;
  selected: SelectedRegionOption[];
  onConfirm: (regions: SelectedRegionOption[]) => void;
  onClose: () => void;
  allowAllRegions?: boolean;
  singleSelect?: boolean;
}

const ALL_REGIONS_ID = 0;

export const SelectRegionsModal = ({
  open,
  selected,
  onConfirm,
  onClose,
  allowAllRegions = true,
  singleSelect = false,
}: SelectRegionsModalProps) => {
  const { data: regions, isLoading } = usePanelRegions();

  const [search, setSearch] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<
    Map<number, SelectedRegionOption>
  >(new Map());

  useEffect(() => {
    if (open) {
      const initial: SelectedRegionOption[] =
        selected.length > 0
          ? selected
          : allowAllRegions
            ? [{ id: ALL_REGIONS_ID, name: "Все регионы" }]
            : [];
      setSelectedRegions(new Map(initial.map((region) => [region.id, region])));
    }
  }, [open]);

  const allItems = useMemo<PanelRegion[]>(
    () =>
      allowAllRegions
        ? [{ id: ALL_REGIONS_ID, name: "Все регионы" }, ...(regions ?? [])]
        : regions ?? [],
    [allowAllRegions, regions]
  );

  const filteredRegions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allItems;
    return allItems.filter((region) => region.name.toLowerCase().includes(query));
  }, [allItems, search]);

  const toggleRegion = (region: PanelRegion) => {
    setSelectedRegions((prev) => {
      if (singleSelect) {
        return new Map([[region.id, { id: region.id, name: region.name }]]);
      }
      if (region.id === ALL_REGIONS_ID) {
        return prev.has(ALL_REGIONS_ID)
          ? new Map()
          : new Map([[ALL_REGIONS_ID, { id: region.id, name: region.name }]]);
      }
      const next = new Map(prev);
      next.delete(ALL_REGIONS_ID);
      if (next.has(region.id)) {
        next.delete(region.id);
      } else {
        next.set(region.id, { id: region.id, name: region.name });
      }
      return next;
    });
  };

  return (
    <SelectListModal<PanelRegion>
      open={open}
      title="Выберите регион"
      closeLabel="Закрыть"
      searchLabel="Поиск региона"
      searchPlaceholder="Название"
      infoColumnLabel="Регион"
      metaColumnLabel=""
      emptyText="Регионы не найдены"
      items={filteredRegions}
      loading={isLoading}
      error={null}
      selectedIds={new Set(selectedRegions.keys())}
      onSearchChange={setSearch}
      onToggle={toggleRegion}
      renderTitle={(region) => region.name}
      renderMeta={() => <div />}
      onClose={onClose}
      onConfirm={() => {
        const result = [...selectedRegions.values()].filter(
          (region) => region.id !== ALL_REGIONS_ID
        );
        onConfirm(result);
      }}
      confirmActive
    />
  );
};
