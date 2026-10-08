import { ClientSidebar } from '@/components/ClientSidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        // Implementing strict ARIA landmarks (role="main", <aside>) 
        // to ensure screen readers and automated accessibility tests pass instantly.
        <div className="flex h-screen w-full bg-slate-50 text-slate-900">
            <aside className="w-64 border-r border-slate-200 bg-white" aria-label="Sidebar Navigation">
                <ClientSidebar />
            </aside>

            <main role="main" className="flex-1 flex flex-col h-screen overflow-y-auto">
                <header className="h-16 border-b border-slate-200 bg-white flex items-center px-8">
                    <h1 className="text-lg font-semibold">Reporting Configuration</h1>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}