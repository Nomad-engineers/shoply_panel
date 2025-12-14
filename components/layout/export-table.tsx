'use client';

import React from 'react';
import * as XLSX from 'xlsx';

interface TableData {
  [key: string]: string | number;
}

interface ExportTableProps {
  data: TableData[];
  fileName?: string;
}

const ExportTable: React.FC<ExportTableProps> = ({ data, fileName = 'table' }) => {
  // Скачать CSV
  const downloadCSV = () => {
    console.log(data)
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvContent =
      [headers.join(',')]
        .concat(data.map(row => headers.map(h => row[h]).join(',')))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Скачать Excel
  const downloadExcel = () => {
    if (!data.length) return;

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return (
    <div className="flex gap-2 mt-10">
      <button
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        onClick={downloadExcel}
      >
        Скачать Excel
      </button>
      <button
        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        onClick={downloadCSV}
      >
        Скачать CSV
      </button>
    </div>
  );
};

export default ExportTable;
