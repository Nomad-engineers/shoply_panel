import React, { useMemo, useState } from "react";
import { Plus, FileSpreadsheet } from "lucide-react";
import { cn } from "@/lib/theme";
import { Button } from "@/components/ui";
import { Category } from "@/types/category.types";
import { useApiData } from "../hooks/useApiData";

interface CategoryHeaderProps {
  archiveCount?: number;
  onImport?: () => void;
  onAdd?: () => void;
}

export const CategoryHeader = ({
  archiveCount = 0,
  onImport,
  onAdd,
}: CategoryHeaderProps) => {
  const [activeTab, setActiveTab] = useState<"all" | "archive">("all");
  const { data: categories = [], loading } = useApiData<Category>('category', {
    relations: ["photo", "subCategory", "subCategory.products"]
  })
  const totalAllProducts = useMemo(() => {
    return categories.reduce((globalTotal, cat) => {
      const totalProducts = cat.subCategory?.reduce(
        (sum, sub) => sum + (sub.products?.length || 0),
        0
      ) || 0;
      return globalTotal + totalProducts;
    }, 0);
  }, [categories]);

  return (
   <div className="flex flex-col gap-8 w-full mb-10 px-5">
         <div className="flex items-center justify-between">
           <div className="flex items-center gap-10">
             <h1 className="text-[32px] font-bold text-[#111111]">Товары</h1>
             
             {/* Табы */}
             <div className="flex gap-8  border-transparent">
               <button
                 onClick={() => setActiveTab("all")}
                 className={cn(
                   " text-lg font-medium transition-all relative",
                   activeTab === "all" 
                     ? "text-[#55CB00] border-b-2 border-[#55CB00]" 
                     : "text-gray-400 hover:text-gray-600"
                 )}
               >
                 Товары
                 <span className={cn(
                   "ml-2 text-xs px-2 py-0.5 rounded-full",
                   activeTab === "all" ? "bg-[#55CB00]/10 text-[#55CB00]" : "bg-gray-100 text-gray-500"
                 )}>
                   {totalAllProducts}
                 </span>
               </button>
   
               <button
                 onClick={() => setActiveTab("archive")}
                 className={cn(
                   " text-lg font-medium transition-all relative",
                   activeTab === "archive" 
                     ? "text-[#55CB00] border-b-2 border-[#55CB00]" 
                     : "text-gray-400 hover:text-gray-600"
                 )}
               >
                 Архив
                 <span className={cn(
                   "ml-2 text-xs px-2 py-0.5 rounded-full",
                   activeTab === "archive" ? "bg-[#55CB00]/10 text-[#55CB00]" : "bg-gray-100 text-gray-500"
                 )}>
                   {archiveCount}
                 </span>
               </button>
             </div>
           </div>
   
           {/* Кнопки действий */}
           <div className="flex items-center gap-3">
             <Button 
               variant="outline" 
               onClick={onImport}
               className="rounded-xl border-gray-200 h-11 px-4 text-sm font-bold flex gap-2"
             >
               <FileSpreadsheet className="w-5 h-5 text-[#55CB00]" />
               Импорт товаров
             </Button>
             <Button 
               onClick={onAdd}
               className="bg-[#55CB00] hover:bg-[#48ad00] text-white rounded-xl h-11 px-6 text-sm font-bold flex gap-2 border-none"
             >
               <Plus className="w-5 h-5" />
               Добавить товар
             </Button>
           </div>
         </div>
       </div>
  );
};