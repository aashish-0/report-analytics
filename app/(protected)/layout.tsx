import { ClientSidebar } from "@/components/ClientSidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900">
      <aside className="w-64 border-r border-slate-200 bg-white" aria-label="Sidebar Navigation">
        <ClientSidebar />
      </aside>
      <main className="flex h-screen flex-1 flex-col overflow-y-auto" role="main">
        <header className="flex h-16 items-center border-b border-slate-200 bg-white px-8 py-2.5">
          <h1 className="text-lg font-semibold">Report analytics</h1>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}