'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search, Bell, Plus, Calendar, Users2, Activity, Filter,
    ShoppingCart, Wallet, TrendingUp, TrendingDown, Brain, Zap,
    Loader2, Sparkles, CheckCircle2
} from 'lucide-react';
import { getDashboardAIData, runMarketResearch } from '@/app/actions/ai';
import type { DashboardStat, ForecastPoint, ActivityEvent, DashboardNotification } from '@/app/actions/ai';

// ─── Icon Map ─────────────────────────────────────────────────────────────────

const iconMap: Record<string, React.ReactNode> = {
    Users2: <Users2 size={20} />,
    Activity: <Activity size={20} />,
    Filter: <Filter size={20} />,
    ShoppingCart: <ShoppingCart size={20} />,
    Wallet: <Wallet size={20} />,
};

// ─── Inline SVG Forecast Chart ────────────────────────────────────────────────

function ForecastChart({ data }: { data: ForecastPoint[] }) {
    if (!data || data.length === 0) return null;

    const W = 600, H = 200, PAD = 16;
    const minVal = Math.min(...data.map(d => d.value));
    const maxVal = Math.max(...data.map(d => d.value));
    const range = maxVal - minVal || 1;

    const toX = (i: number) => PAD + (i / (data.length - 1)) * (W - PAD * 2);
    const toY = (v: number) => H - PAD - ((v - minVal) / range) * (H - PAD * 2);

    const points = data.map((d, i) => `${toX(i)},${toY(d.value)}`).join(' ');
    const lastX = toX(data.length - 1);
    const lastY = toY(data[data.length - 1].value);

    // Area path: line + close bottom
    const areaPath = `M${PAD},${toY(data[0].value)} L${points.slice(points.indexOf(',') + 1).split(' ').map((p, i) => `${toX(i + 1)},${p.split(',')[1]}`).join(' L')} L${lastX},${H - PAD} L${PAD},${H - PAD} Z`;
    const linePath = `M${PAD},${toY(data[0].value)} ` + data.slice(1).map((d, i) => `L${toX(i + 1)},${toY(d.value)}`).join(' ');

    // Predicted split: last 7 days are "predicted"
    const splitIdx = data.length - 8;
    const splitX = toX(splitIdx);

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id="auraGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.6" />
                    <stop offset={`${(splitIdx / (data.length - 1)) * 100}%`} stopColor="hsl(var(--primary))" stopOpacity="1" />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>

            {/* Area fill */}
            <path d={areaPath} fill="url(#auraGrad)" />

            {/* Predicted zone */}
            <rect x={splitX} y={PAD} width={lastX - splitX} height={H - PAD * 2}
                fill="hsl(var(--primary))" fillOpacity="0.04"
                stroke="hsl(var(--primary))" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 3" />

            {/* Line */}
            <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />

            {/* Current endpoint dot */}
            <circle cx={toX(splitIdx)} cy={toY(data[splitIdx].value)} r="4"
                fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth="2" />

            {/* Predicted endpoint dot */}
            <circle cx={lastX} cy={lastY} r="6"
                fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth="2.5"
                filter="url(#glow)" />
            <circle cx={lastX} cy={lastY} r="10"
                fill="none" stroke="hsl(var(--primary))" strokeOpacity="0.3" strokeWidth="1.5" />
        </svg>
    );
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function StatSkeleton() {
    return (
        <div className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10 animate-pulse">
            <div className="flex justify-between items-start mb-4">
                <div className="w-11 h-11 bg-primary/10 rounded-xl" />
                <div className="w-12 h-4 bg-primary/10 rounded-full" />
            </div>
            <div className="w-24 h-3 bg-primary/10 rounded-full mb-3" />
            <div className="w-20 h-8 bg-primary/10 rounded-lg" />
        </div>
    );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
    const router = useRouter();

    // AI data state
    const [stats, setStats] = useState<DashboardStat[]>([]);
    const [forecast, setForecast] = useState<ForecastPoint[]>([]);
    const [activity, setActivity] = useState<ActivityEvent[]>([]);
    const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
    const [loadingAI, setLoadingAI] = useState(true);

    // UI state
    const [isAnalysisRunning, setIsAnalysisRunning] = useState(false);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [dateRange, setDateRange] = useState('30 Days');
    const [searchQuery, setSearchQuery] = useState('');
    const dateOptions = ['7 Days', '30 Days', '90 Days', '6 Months', '1 Year'];

    // Fetch session and deep real data
    useEffect(() => {
        const loadRealData = async () => {
            setLoadingAI(true);
            try {
                // 1. Get current logged in user
                const { createBrowserClient } = await import('@/lib/supabase-client');
                const supabase = createBrowserClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (!user) {
                    console.log("No authenticated user found for dashboard");
                    return;
                }

                // 2. Fetch real stats & forecast from DB based on selected dateRange
                const { getRealDashboardData } = await import('@/app/actions/dashboard');
                const res = await getRealDashboardData(user.id, dateRange);

                if (res.success && res.data) {
                    setStats(res.data.stats);
                    setForecast(res.data.forecast);
                } else {
                    console.error("Failed to load real dashboard stats:", res.error);
                }

                // 3. For Activity & Notifications, we'll keep the AI fallback until these tables exist
                const backupAI = await getDashboardAIData();
                setActivity(backupAI.data.activity);
                setNotifications(backupAI.data.notifications);

            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            } finally {
                setLoadingAI(false);
            }
        };

        loadRealData();
    }, [dateRange]); // <-- Re-run whenever dateRange dropdown changes

    // ── Run deep-dive AI analysis ─────────────────────────────────────────────
    const handleRunAnalysis = async () => {
        setIsAnalysisRunning(true);
        try {
            const statsContext = stats.length > 0
                ? stats.map(s => `${s.label}: ${s.value} (${s.change})`).join(', ')
                : "Followers Growth: +14.2%, Engagement: 5.10%, Leads: +4.1%, Conversion: 3.8%, Revenue: $15,890";

            const prompt = `As a senior marketing analyst for Aura Marketing, analyze the following 30-day performance data: ${statsContext}. Provide 3 specific, actionable recommendations for the next 48 hours to optimize these results. Keep it concise and professional, max 120 words.`;

            const { success, content, error } = await runMarketResearch(prompt);
            if (success && content) {
                setAiInsight(content);
            } else {
                throw new Error(error);
            }
        } catch (error) {
            console.error("AI Analysis failed:", error);
            setAiInsight("Unable to reach AI intelligence. Please check your system logs.");
        } finally {
            setIsAnalysisRunning(false);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">

            {/* ── Header ────────────────────────────────────────────────────── */}
            <header className="h-16 lg:h-20 border-b border-primary/10 flex items-center justify-between px-4 md:px-8 bg-background/50 backdrop-blur-md sticky top-0 z-20 shrink-0">
                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && searchQuery.trim()) router.push('/dashboard/analytics');
                        }}
                        className="w-full bg-primary/5 border border-primary/10 rounded-full py-2 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary focus:bg-primary/10 transition-all font-medium"
                        placeholder="Search analytics or AI insights..."
                        type="text"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => router.push('/dashboard/analytics')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-primary uppercase tracking-wider"
                        >
                            Go →
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* Notifications bell */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 relative cursor-pointer transition-colors hover:bg-primary/10"
                        >
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                            )}
                        </button>

                        {showNotifications && (
                            <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-primary/20 rounded-2xl shadow-2xl z-50 overflow-hidden">
                                <div className="p-4 border-b border-primary/10 flex items-center justify-between">
                                    <span className="text-xs font-black uppercase tracking-widest text-white">Notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="text-[9px] font-bold text-primary uppercase">{unreadCount} New</span>
                                    )}
                                </div>
                                {loadingAI ? (
                                    <div className="p-6 flex items-center justify-center gap-2">
                                        <Loader2 size={16} className="animate-spin text-primary" />
                                        <span className="text-xs text-slate-400 font-medium">Loading...</span>
                                    </div>
                                ) : (
                                    notifications.map((n, i) => (
                                        <div key={i} className={`p-4 border-b border-primary/5 hover:bg-primary/5 cursor-pointer transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                                            <p className="text-xs font-medium text-slate-300 leading-relaxed">{n.title}</p>
                                            <p className="text-[10px] text-slate-500 mt-1">{n.time}</p>
                                        </div>
                                    ))
                                )}
                                <div className="p-3 text-center">
                                    <button
                                        onClick={() => { setShowNotifications(false); router.push('/dashboard/analytics'); }}
                                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors"
                                    >
                                        View All
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="h-8 w-px bg-primary/10 mx-2" />

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold">Aura Marketing Team</p>
                            <p className="text-xs text-slate-500">Marketing Lead</p>
                        </div>
                        <div
                            className="w-10 h-10 rounded-full border-2 border-primary/20 bg-cover bg-center ring-2 ring-primary/5 shadow-inner"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC4E0wQN2_laPnABIMg9cz6D6pIbfm98E5EcbNHB8T-hRz2CSSzWu5SkXD4UD6JCVCfBh2o-CD7fEG4fqCuEpPglMpzMDfWUJR0iqOO1VsF_2nZ4jZW4-R-kBICvdcBHvbEGja2hKigPyGppO40aGHRHjNSzu8p7WEqzGJnVdJFCJPtkBdQO8LB15pP3NbmXBbTsuY_2p-RRptsHupSIYVunVc1Q32O_yQQFtvd-1BvvaS3PTcM2SRARGlew-82ylWG9X09L-Lg8Kc')" }}
                        />
                    </div>
                </div>
            </header>

            {/* ── Dashboard Body ────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8">

                {/* Title row */}
                <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter text-white uppercase italic">Enterprise Dashboard</h2>
                        <p className="text-slate-500 text-sm font-medium">Real-time performance and predictive growth forecast.</p>
                    </div>
                    <div className="flex gap-2 sm:gap-3 flex-wrap">
                        <button
                            onClick={() => router.push('/dashboard/campaigns')}
                            className="bg-primary hover:brightness-110 active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus size={18} /> New Campaign
                        </button>
                        <button
                            onClick={() => {
                                const idx = dateOptions.indexOf(dateRange);
                                setDateRange(dateOptions[(idx + 1) % dateOptions.length]);
                            }}
                            className="bg-primary/5 border border-primary/20 text-slate-300 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm hover:bg-primary/10 transition-colors"
                        >
                            <Calendar size={18} /> {dateRange}
                        </button>
                    </div>
                </div>

                {/* ── KPI Stats Grid ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {loadingAI
                        ? Array.from({ length: 5 }).map((_, i) => <StatSkeleton key={i} />)
                        : stats.map((stat, i) => (
                            <div key={i} className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10 group hover:border-primary/30 transition-all cursor-pointer shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-primary/10 rounded-xl text-primary flex group-hover:scale-110 transition-transform">
                                        {iconMap[stat.icon_name] || <Activity size={20} />}
                                    </div>
                                    <div className={`text-xs font-black flex items-center gap-1 ${stat.trend === 'up' ? 'text-emerald-500' : 'text-orange-500 underline decoration-2 underline-offset-4'}`}>
                                        {stat.change} {stat.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    </div>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-3xl font-black mt-1 text-white tracking-tight">{stat.value}</h3>
                            </div>
                        ))
                    }
                </div>

                {/* ── Forecast + AI Panel ────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Performance Forecast Chart */}
                    <div className="lg:col-span-2 bg-primary/5 rounded-[2.5rem] border border-primary/10 p-8">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase italic">Performance Forecast</h3>
                                <p className="text-sm text-slate-500 font-medium">Predictive marketing analytics powered by NVIDIA Cosmos</p>
                            </div>
                            <div className="bg-primary/10 border border-primary/30 py-2 px-4 rounded-full flex items-center gap-3">
                                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                                <span className="text-xs font-black text-primary uppercase tracking-wider">94% Confidence</span>
                            </div>
                        </div>

                        <div className="h-52 relative">
                            {loadingAI ? (
                                <div className="w-full h-full bg-primary/5 rounded-2xl animate-pulse flex items-center justify-center">
                                    <Loader2 size={24} className="animate-spin text-primary/40" />
                                </div>
                            ) : (
                                <ForecastChart data={forecast} />
                            )}
                        </div>

                        <div className="flex justify-between mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-primary/5 pt-4">
                            <span>Day 1</span>
                            <span>Day 10</span>
                            <span>Day 20</span>
                            <span className="text-primary">Predicted (Day 30)</span>
                        </div>
                    </div>

                    {/* AI Insights Panel + Live Activity */}
                    <div className="space-y-6">

                        {/* Aura Intelligence */}
                        <div className="bg-primary rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                            <Sparkles className="absolute -right-4 -top-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
                            <div className="relative z-10 flex flex-col gap-6">
                                <div className="flex items-center gap-4 border-b border-white/20 pb-6">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                        <Brain size={32} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight leading-none italic">Aura Intelligence</h3>
                                        <p className="text-xs text-white/70 font-bold mt-1">Real-time optimization engine</p>
                                    </div>
                                </div>

                                <div className="space-y-4 min-h-[140px]">
                                    {isAnalysisRunning ? (
                                        <div className="flex flex-col items-center justify-center gap-3 py-10 opacity-70">
                                            <Loader2 size={32} className="animate-spin" />
                                            <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Scanning Data Points...</p>
                                        </div>
                                    ) : aiInsight ? (
                                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                            <div className="flex items-start gap-3">
                                                <CheckCircle2 size={16} className="text-emerald-300 mt-1 shrink-0" />
                                                <p className="text-sm font-medium leading-relaxed">{aiInsight}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-4">
                                            <p className="text-sm font-medium text-white/80 leading-relaxed italic">
                                                Click the button below to perform a deep-dive analysis using NVIDIA Llama 3.3 70B.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleRunAnalysis}
                                    disabled={isAnalysisRunning || loadingAI}
                                    className="w-full py-4 bg-white text-primary rounded-xl font-black text-xs uppercase tracking-widest shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                                >
                                    {isAnalysisRunning ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Analyzing Performance...
                                        </>
                                    ) : (
                                        <>
                                            <Zap size={16} fill="currentColor" />
                                            Run AI Marketing Analysis
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Live Network Activity */}
                        <div className="bg-primary/5 rounded-[2.5rem] border border-primary/10 p-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center justify-between">
                                Live Network Activity
                                <span className="flex items-center gap-1.5 text-primary">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                    Live
                                </span>
                            </h4>
                            <div className="space-y-5">
                                {loadingAI ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex gap-4 animate-pulse">
                                            <div className="w-1 h-10 bg-primary/20 rounded-full" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-3 bg-primary/10 rounded-full w-4/5" />
                                                <div className="h-2.5 bg-primary/10 rounded-full w-2/5" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    activity.map((event, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className={`w-1 h-10 ${event.color} rounded-full shrink-0`} />
                                            <div>
                                                <p className="text-sm font-bold text-white leading-none mb-1">{event.title}</p>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase">{event.time} • {event.platform}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
