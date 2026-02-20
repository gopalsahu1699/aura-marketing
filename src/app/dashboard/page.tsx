'use client';

import React, { useState, useEffect } from 'react';
import {
    Search, Bell, Plus, Calendar, Users2, Activity, Filter,
    ShoppingCart, Wallet, TrendingUp, TrendingDown, Brain, Zap, Clock,
    Loader2, Sparkles, Send, CheckCircle2
} from 'lucide-react';
import { generateChatContent } from '@/app/actions/ai';
import { createBrowserClient } from '@/lib/supabase-client';

interface Stat {
    label: string;
    value: string;
    change: string;
    trend: 'up' | 'down';
    icon: React.ReactNode;
}

const iconMap: Record<string, React.ReactNode> = {
    Users2: <Users2 size={20} />,
    Activity: <Activity size={20} />,
    Filter: <Filter size={20} />,
    ShoppingCart: <ShoppingCart size={20} />,
    Wallet: <Wallet size={20} />
};

export default function Dashboard() {
    const [isAnalysisRunning, setIsAnalysisRunning] = useState(false);
    const [aiInsight, setAiInsight] = useState<string | null>(null);
    const [showNotifications, setShowNotifications] = useState(false);
    const [dateRange, setDateRange] = useState('30 Days');
    const dateOptions = ['7 Days', '30 Days', '90 Days', '6 Months', '1 Year'];

    const [stats, setStats] = useState<Stat[]>([]);
    const [loadingStats, setLoadingStats] = useState(true);
    const supabase = createBrowserClient();

    useEffect(() => {
        const fetchDashboardStats = async () => {
            setLoadingStats(true);
            try {
                const { data, error } = await supabase.from('dashboard_stats').select('*').order('id');
                if (error) throw error;
                if (data && data.length > 0) {
                    setStats(data.map((row: any) => ({
                        label: row.label,
                        value: row.value,
                        change: row.change,
                        trend: row.trend as 'up' | 'down',
                        icon: iconMap[row.icon_name] || <Activity size={20} />
                    })));
                } else {
                    // Fallback to mock if empty
                    setStats([
                        { label: "Followers Growth", value: "24.5k", change: "+12.5%", trend: 'up', icon: iconMap['Users2'] },
                        { label: "Engagement Rate", value: "4.82%", change: "+0.4%", trend: 'up', icon: iconMap['Activity'] },
                        { label: "Leads Generated", value: "1,284", change: "-2.1%", trend: 'down', icon: iconMap['Filter'] },
                        { label: "Conversion Rate", value: "3.2%", change: "+0.8%", trend: 'up', icon: iconMap['ShoppingCart'] },
                        { label: "Total Revenue", value: "$12,450", change: "+15.2%", trend: 'up', icon: iconMap['Wallet'] },
                    ]);
                }
            } catch (err) {
                console.warn('Supabase fetch failed, falling back to mock data', err);
            } finally {
                setLoadingStats(false);
            }
        };
        fetchDashboardStats();
    }, [supabase]);

    const handleRunAnalysis = async () => {
        setIsAnalysisRunning(true);
        try {
            // Build prompt based on actual stats if available
            const statsContext = stats.length > 0
                ? stats.map(s => `${s.label}: ${s.value} (${s.change})`).join(', ')
                : "Followers Growth: +12.5%, Engagement: 4.82%, Leads: -2.1%";

            const prompt = `As a senior marketing analyst for Aura Marketing, analyze the following performance data: ${statsContext}. Provide 3 specific, actionable recommendations for the next 48 hours to optimize these results. Keep it professional and concise.`;

            const { success, content, error } = await generateChatContent(prompt);
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

    const handleNewCampaign = () => {
        alert("Campaign builder coming soon! Powered by Aura AI.");
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
            {/* Header */}
            <header className="h-16 lg:h-20 border-b border-primary/10 flex items-center justify-between px-4 md:px-8 bg-background/50 backdrop-blur-md sticky top-0 z-20 shrink-0">
                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        className="w-full bg-primary/5 border border-primary/10 rounded-full py-2 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-primary focus:bg-primary/10 transition-all font-medium"
                        placeholder="Search analytics or AI insights..."
                        type="text"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 relative cursor-pointer transition-colors hover:bg-primary/10"
                    >
                        <Bell size={20} />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background-dark"></span>
                    </button>
                    {showNotifications && (
                        <div className="absolute right-0 sm:right-24 top-12 sm:top-16 w-72 sm:w-80 bg-slate-900 border border-primary/20 rounded-2xl shadow-2xl z-50 overflow-hidden">
                            <div className="p-4 border-b border-primary/10 flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-widest text-white">Notifications</span>
                                <span className="text-[9px] font-bold text-primary uppercase">3 New</span>
                            </div>
                            {[
                                { title: "Campaign 'Summer Launch' reached 10K impressions", time: "2m ago", read: false },
                                { title: "Engagement rate increased by 12% this week", time: "1h ago", read: false },
                                { title: "New follower milestone: 25K followers!", time: "3h ago", read: false },
                                { title: "AI analysis completed for Q4 strategy", time: "1d ago", read: true },
                            ].map((n, i) => (
                                <div key={i} className={`p-4 border-b border-primary/5 hover:bg-primary/5 cursor-pointer transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                                    <p className="text-xs font-medium text-slate-300 leading-relaxed">{n.title}</p>
                                    <p className="text-[10px] text-slate-500 mt-1">{n.time}</p>
                                </div>
                            ))}
                            <div className="p-3 text-center">
                                <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors">View All</button>
                            </div>
                        </div>
                    )}
                    <div className="h-8 w-px bg-primary/10 mx-2"></div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold">Aura Marketing Team</p>
                            <p className="text-xs text-slate-500">Marketing Lead</p>
                        </div>
                        <div
                            className="w-10 h-10 rounded-full border-2 border-primary/20 bg-cover bg-center ring-2 ring-primary/5 shadow-inner"
                            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC4E0wQN2_laPnABIMg9cz6D6pIbfm98E5EcbNHB8T-hRz2CSSzWu5SkXD4UD6JCVCfBh2o-CD7fEG4fqCuEpPglMpzMDfWUJR0iqOO1VsF_2nZ4jZW4-R-kBICvdcBHvbEGja2hKigPyGppO40aGHRHjNSzu8p7WEqzGJnVdJFCJPtkBdQO8LB15pP3NbmXBbTsuY_2p-RRptsHupSIYVunVc1Q32O_yQQFtvd-1BvvaS3PTcM2SRARGlew-82ylWG9X09L-Lg8Kc')" }}
                        ></div>
                    </div>
                </div>
            </header>

            {/* Dashboard Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8">
                <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tighter text-white uppercase italic">Enterprise Dashboard</h2>
                        <p className="text-slate-500 text-sm font-medium">Real-time performance and predictive growth forecast.</p>
                    </div>
                    <div className="flex gap-2 sm:gap-3 flex-wrap">
                        <button
                            onClick={handleNewCampaign}
                            className="bg-primary hover:brightness-110 active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus size={18} /> New Campaign
                        </button>
                        <div className="relative">
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
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10 group hover:border-primary/30 transition-all cursor-pointer shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary flex group-hover:scale-110 transition-transform">{stat.icon}</div>
                                <div className={`text-xs font-black flex items-center gap-1 ${stat.trend === 'up' ? 'text-emerald-500' : 'text-orange-500 underline decoration-2 underline-offset-4'}`}>
                                    {stat.change} {stat.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                </div>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-3xl font-black mt-1 text-white tracking-tight">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Performance Forecast */}
                    <div className="lg:col-span-2 bg-primary/5 rounded-[2.5rem] border border-primary/10 p-8">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-xl font-black text-white uppercase italic">Performance Forecast</h3>
                                <p className="text-sm text-slate-500 font-medium">Predictive marketing analytics powered by NVIDIA Cosmos</p>
                            </div>
                            <div className="bg-primary/10 border border-primary/30 py-2 px-4 rounded-full flex items-center gap-3">
                                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse"></span>
                                <span className="text-xs font-black text-primary uppercase tracking-wider">94% Confidence</span>
                            </div>
                        </div>
                        <div className="h-80 relative group">
                            <img src="/dashboard-chart.svg" alt="Performance Forecast" className="w-full h-full object-contain" />
                            <div className="flex justify-between mt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-primary/5 pt-4">
                                <span>Day 1</span>
                                <span>Day 10</span>
                                <span>Day 20</span>
                                <span className="text-primary">Predicted (Day 30)</span>
                            </div>
                        </div>
                    </div>

                    {/* AI Insights Panel */}
                    <div className="space-y-6">
                        <div className="bg-primary rounded-[2.5rem] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                            <Sparkles className="absolute -right-4 -top-4 w-32 h-32 text-white/10 group-hover:scale-110 transition-transform" />
                            <div className="relative z-10 flex flex-col gap-6">
                                <div className="flex items-center gap-4 border-b border-white/20 pb-6">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center"><Brain size={32} /></div>
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
                                                Click the button below to perform a deep-dive analysis using NVIDIA Llama 3.1 70B.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={handleRunAnalysis}
                                    disabled={isAnalysisRunning}
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

                        <div className="bg-primary/5 rounded-[2.5rem] border border-primary/10 p-6">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center justify-between">
                                Live Network Activity
                                <span className="flex items-center gap-1.5 text-primary">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                    Live
                                </span>
                            </h4>
                            <div className="space-y-5">
                                <div className="flex gap-4">
                                    <div className="w-1 h-10 bg-emerald-500 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-bold text-white leading-none mb-1">Campaign 'Aura Alpha' Trending</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">2 mins ago • Instagram</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-1 h-10 bg-primary rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-bold text-white leading-none mb-1">High-Value Lead Identified</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">15 mins ago • CRM Link</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-1 h-10 bg-blue-500 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-bold text-white leading-none mb-1">Model Retraining Complete</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase">1h ago • Persona Engine</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
