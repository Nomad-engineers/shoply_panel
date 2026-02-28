import React, { useRef } from "react";
import Image from "next/image";
import { Plus, Trash2 } from "lucide-react";

interface Photo {
  url: string;
  file?: File;
}

interface ProductPhotoUploadProps {
  photos: Photo[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeletePhoto: (index: number) => void;
}

export function ProductPhotoUpload({
  photos,
  onFileChange,
  onDeletePhoto,
}: ProductPhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex gap-4 flex-wrap">
      {photos.map((p, i) => (
        <div key={i} className="relative w-38 h-38 group rounded-2xl border-3 border-transparent">
          <Image src={p.url} alt="product" fill className="object-cover rounded-xl" />
          <button
            type="button"
            onClick={() => onDeletePhoto(i)}
            className="absolute top-2 left-2 p-1.5 bg-white/90 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      <input
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={onFileChange}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="w-38 h-38 border-2 border-dashed border-blue-200 rounded-2xl flex flex-col items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors"
      >
        <Plus size={24} />
        <span className="font-bold text-[10px] uppercase">Добавить фото</span>
      </button>
    </div>
  );
}
