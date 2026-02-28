import React from "react";
import { useDropzone } from "react-dropzone";
import { FileSpreadsheet, X } from "lucide-react";
import { cn } from "@/lib/theme";

interface FileDropzoneProps {
  file: File | null;
  onFileDrop: (files: File[]) => void;
  onRemoveFile: () => void;
}

export function FileDropzone({ file, onFileDrop, onRemoveFile }: FileDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onFileDrop,
    multiple: false,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed rounded-[32px] p-16 transition-all flex flex-col items-center justify-center gap-4 cursor-pointer",
        isDragActive
          ? "border-primary-main bg-primary-main/5"
          : "border-gray-200 bg-white hover:border-primary-main/30",
        file && "border-solid border-primary-main/20 bg-primary-main/5"
      )}
    >
      <input {...getInputProps()} />
      <div className="p-5 bg-gray-50 rounded-2xl text-primary-main">
        <FileSpreadsheet className="w-12 h-20" />
      </div>
      <div className="text-center">
        {file ? (
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-gray-100">
            <span className="font-semibold text-gray-900">{file.name}</span>
            <X
              className="w-4 h-4 text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveFile();
              }}
            />
          </div>
        ) : (
          <p className="text-gray-900 font-semibold">Выберите .xlsx файл</p>
        )}
      </div>
    </div>
  );
}
