import React from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/theme";

interface UploadStatusProps {
  status: { type: "success" | "error"; msg: string } | null;
}

export function UploadStatus({ status }: UploadStatusProps) {
  if (!status) return null;

  return (
    <div
      className={cn(
        "p-4 rounded-2xl flex items-center gap-3",
        status.type === "success"
          ? "bg-green-50 text-green-700"
          : "bg-red-50 text-red-700"
      )}
    >
      {status.type === "success" ? <CheckCircle2 /> : <AlertCircle />}
      <span className="text-sm font-medium">{status.msg}</span>
    </div>
  );
}
