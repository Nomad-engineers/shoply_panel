import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface CategoryBaseDropdownProps<T> {
  label: string;
  value: T | "" | null;
  options: { label: string; value: T; subLabel?: string }[];
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (val: T) => void; // Изменено с string на T
  placeholder?: string;
  disabled?: boolean;
}

export const CategoryBaseDropdown = <T extends string | boolean | number>({
  label,
  value,
  options,
  isOpen,
  onToggle,
  onSelect,
  placeholder = "Выберите значение",
  disabled = false,
}: CategoryBaseDropdownProps<T>) => {
  const selectedLabel = options.find((o) => o.value === value)?.label;
  const hasValue = value !== "" && value !== null && !!selectedLabel;

  return (
    <div className="relative">
      <label className="text-xs text-gray-400 mb-1.5 block mt-3 uppercase font-bold">
        {label}
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={onToggle}
        className={cn(
          "w-full rounded-2xl p-4 text-sm border flex justify-between items-center transition-all outline-none",
          disabled
            ? "border-gray-100 bg-gray-50/50 cursor-not-allowed"
            : hasValue
              ? "border-blue-400 bg-blue-50/20"
              : "border-gray-100 bg-gray-50 hover:border-gray-200"
        )}
      >
        <span
          className={cn(
            "font-bold",
            hasValue ? "text-gray-600" : "text-gray-400"
          )}
        >
          {selectedLabel || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "transition-transform duration-200",
            disabled ? "text-gray-200" : "text-gray-400",
            isOpen && !disabled && "rotate-180"
          )}
        />
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden max-h-[220px] overflow-y-auto custom-scrollbar">
          {options.length > 0 ? (
            options.map((opt, index) => (
              <button
                key={`${opt.value}-${index}`}
                type="button"
                onClick={() => onSelect(opt.value)}
                className="w-full px-4 py-3 text-left text-sm hover:bg-blue-50 flex justify-between items-center transition-colors border-b border-gray-50 last:border-none"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-gray-700">{opt.label}</span>
                  {opt.subLabel && (
                    <span className="text-[9px] text-gray-400 uppercase">
                      {opt.subLabel}
                    </span>
                  )}
                </div>
                {value === opt.value && (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                )}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-400">
              Нет доступных вариантов
            </div>
          )}
        </div>
      )}
    </div>
  );
};
