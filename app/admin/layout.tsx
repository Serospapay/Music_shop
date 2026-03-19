import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px,1fr]">
        <AdminSidebar />
        <section>{children}</section>
      </div>
    </div>
  );
}
