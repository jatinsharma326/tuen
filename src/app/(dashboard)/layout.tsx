import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#05050a]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(192,132,252,0.16),transparent_34%),radial-gradient(circle_at_92%_18%,rgba(6,182,212,0.12),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.035)_0,transparent_28%,rgba(255,255,255,0.02)_60%,transparent_100%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.055] [background-image:linear-gradient(rgba(255,255,255,0.75)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.75)_1px,transparent_1px)] [background-size:42px_42px]" />
      <DashboardSidebar />
      <div className="relative z-10 flex flex-1 flex-col lg:ml-0">
        <DashboardHeader />
        <main className="relative flex-1 overflow-y-auto">
          <div className="relative mx-auto max-w-7xl px-5 py-8 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
