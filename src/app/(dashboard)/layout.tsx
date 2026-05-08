import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#0c0c12]">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col lg:ml-0">
        <DashboardHeader />
        <main className="relative flex-1 overflow-y-auto">
          <div className="relative mx-auto max-w-5xl px-5 py-8 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
