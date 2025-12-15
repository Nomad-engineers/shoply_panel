'use client';

import React from 'react';
import { useTableExport } from '../hooks/useExport';
import { Button } from '@/components/ui/button'; // путь к твоему Button

interface TableData {
  [key: string]: string | number;
}

interface ExportTableProps {
  data: TableData[];
  fileName?: string;
}

const ExportTable: React.FC<ExportTableProps> = ({ data, fileName }) => {
  const { downloadCSV, downloadExcel } = useTableExport(data, fileName);

  return (
    <div className="flex gap-2 mt-10">
      <Button variant="outline" size="default" onClick={downloadExcel}>
        Скачать Excel
      </Button>

      <Button variant="outline" size="default" onClick={downloadCSV}>
        Скачать CSV
      </Button>
    </div>
  );
};

export default ExportTable;
