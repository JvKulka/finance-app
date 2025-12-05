"use client";

import FinanceLayout from "@/components/FinanceLayout";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FinanceLayout>{children}</FinanceLayout>;
}

