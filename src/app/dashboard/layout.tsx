import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-background text-slate-100 antialiased font-display">
            <Sidebar />
            <main className="flex-1 overflow-y-auto custom-scrollbar relative">
                {children}
            </main>
        </div>
    );
}
