import { DashboardLayout } from '@/components/layout';
import React from 'react';

interface ProductLayoutProps {
  children: React.ReactNode;
}

export default function ProductLayout({ children }: ProductLayoutProps) {
  return (

      <div className="bg-white rounded-4xl p-8 shadow-sm border border-gray-50 mt-6 min-h-[calc(100vh-280px)]">
        {children}
       </div>
  );
}