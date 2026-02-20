"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase-client";
import { LogOut, User } from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createBrowserClient();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    // Get user session
    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUserEmail(session?.user?.email || null);
        };
        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUserEmail(session?.user?.email || null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/auth/login");
    };

    // Close mobile sidebar on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [mobileOpen]);

    const navItems = [
        { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
        { name: "Advanced Analytics", href: "/dashboard/analytics", icon: "monitoring" },
        { name: "Audience Insights", href: "/dashboard/audience", icon: "group" },
        { name: "Studio Creator", href: "/dashboard/content", icon: "auto_fix_high" },
        { name: "AI Training Lab", href: "/dashboard/training", icon: "model_training" },
        { name: "Connections", href: "/dashboard/connections", icon: "link" },
    ];

    const sidebarContent = (
        <>
            <div className="p-5 lg:p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white p-2">
                    <img src="/sparkles.svg" alt="Aura Logo" className="w-full h-full filter invert brightness-0" />
                </div>
                <div>
                    <h1 className="text-lg font-bold tracking-tight">Aura Marketing</h1>
                </div>
                {/* Close button for mobile */}
                <button
                    onClick={() => setMobileOpen(false)}
                    className="lg:hidden ml-auto p-2 text-slate-400 hover:text-white transition-colors"
                    aria-label="Close menu"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>
            </div>
            <nav className="flex-1 px-3 lg:px-4 space-y-1 mt-2 lg:mt-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 lg:py-2 rounded-lg transition-colors ${isActive
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "text-slate-400 hover:bg-primary/10 hover:text-primary"
                                }`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="text-sm font-medium">{item.name}</span>
                        </Link>
                    );
                })}

                <div className="pt-4 pb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Configuration
                </div>
                <Link
                    href="/dashboard/settings"
                    className={`flex items-center gap-3 px-3 py-2.5 lg:py-2 rounded-lg transition-colors ${pathname === "/dashboard/settings"
                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                        : "text-slate-400 hover:bg-primary/10 hover:text-primary"
                        }`}
                >
                    <span className="material-symbols-outlined">settings</span>
                    <span className="text-sm font-medium">Settings</span>
                </Link>
            </nav>
            <div className="p-3 lg:p-4 mt-auto space-y-3">
                <div className="bg-slate-900/50 rounded-xl p-3 border border-primary/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <User size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Agent Node</p>
                        <p className="text-[11px] font-bold text-white truncate">{userEmail || "Guest Session"}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>

                <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                    <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-tighter">Pro Plan Active</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                        You have used 72% of your monthly AI credits.
                    </p>
                    <button
                        onClick={() => alert('Upgrade to Enterprise — Contact sales@auramarketing.io for custom pricing!')}
                        className="w-full py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all active:scale-95"
                    >
                        Upgrade Plan
                    </button>
                </div>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile hamburger button — fixed top-left */}
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-primary/90 backdrop-blur-md rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30 active:scale-90 transition-all"
                aria-label="Open menu"
            >
                <span className="material-symbols-outlined text-xl">menu</span>
            </button>

            {/* Mobile sidebar overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile sidebar drawer */}
            <aside
                className={`lg:hidden fixed top-0 left-0 w-72 h-full bg-background border-r border-primary/20 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {sidebarContent}
            </aside>

            {/* Desktop sidebar */}
            <aside className="w-64 flex-shrink-0 bg-background border-r border-primary/20 hidden lg:flex flex-col h-full">
                {sidebarContent}
            </aside>
        </>
    );
}
