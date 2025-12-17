"use client"; 

import React, { useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { LoginForm } from "@/components/layout/login-form";
const LoginPage: React.FC = () => {
  return (
    <DashboardLayout hideSidebar header={<h1 className="text-2xl font-bold text-green-700">Вход</h1>}>
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-10 mt-16">
        <LoginForm />
      </div>
    </DashboardLayout>
  );
};

export default LoginPage;
