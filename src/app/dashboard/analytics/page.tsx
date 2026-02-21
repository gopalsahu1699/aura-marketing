'use client';

import React, { useState, useEffect } from 'react';
import {
    TrendingUp, TrendingDown, Download, BarChart3,
    Calendar, Users, Heart, MessageSquare, Share2,
    Eye, Sparkles, Loader2, Smile, AlertCircle,
    Smartphone, Monitor, Globe, Languages,
    ShoppingCart, Clock, RotateCcw, MousePointerClick,
    Search, ThumbsDown, HelpCircle, ShieldAlert,
    MapPin, UserCheck, DollarSign, Target,
    Flame, Sun, CloudRain, Leaf, Snowflake, Zap,
    ArrowUpRight, Hash, Building2, Shield, Megaphone,
    Tag, FileText, Video, Users2, Percent, Package,
    CircleDot, Crown, Crosshair, Brain, Lightbulb, Activity
} from 'lucide-react';
import { generateChatContent, AnalyticsAIData } from '@/app/actions/ai';
import { getRealAnalyticsData } from '@/app/actions/analytics';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';


type InsightsTab = 'audience' | 'behavior' | 'painpoints' | 'demand' | 'geo' | 'competitors' | 'predictive';

export default function AnalyticsReportingPage() {
    const router = useRouter();
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiSentiment, setAiSentiment] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState("Last 30 Days");
    const [insightsTab, setInsightsTab] = useState<InsightsTab>('audience');
    const [exportSuccess, setExportSuccess] = useState(false);
    const [loadingAI, setLoadingAI] = useState(true);
    const [aiData, setAiData] = useState<AnalyticsAIData | null>(null);

    const timeOptions = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'This Year'];


    const handleRunAiAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const score = aiData?.sentiment.score ?? 82;
            const label = aiData?.sentiment.label ?? 'Positive';
            const prompt = `Analyze the recent marketing sentiment for Aura Marketing. Current data: ${score}% ${label} engagement. Key themes: 'Innovation' and 'Speed'. Provide a 2-sentence summary and one strategic recommendation.`;
            const { success, content, error } = await generateChatContent(prompt);
            if (success && content) {
                setAiSentiment(content);
            } else throw new Error(error);
        } catch {
            setAiSentiment(aiData?.sentiment_insight ?? "Sentiment analysis unavailable. Please check system logs.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {

        const loadData = async () => {
            setLoadingAI(true);
            try {
                // Get user
                const supabase = createBrowserClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const result = await getRealAnalyticsData(user.id);
                setAiData(result.data);
                setAiSentiment(result.data.sentiment_insight);
            } catch (err) {
                console.warn('Analytics AI fetch failed', err);
            } finally {
                setLoadingAI(false);
            }
        };
        loadData();
    }, []);

    // Re-fetch when time range changes
    useEffect(() => {
        if (!loadingAI) {

            setLoadingAI(true);

            // Need user for refetch
            const supabase = createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user) {
                    getRealAnalyticsData(user.id).then(r => {
                        setAiData(r.data);
                        setAiSentiment(r.data.sentiment_insight);

                    }).finally(() => setLoadingAI(false));
                } else {
                    setLoadingAI(false);
                }
            });
        }
    }, [timeRange]);

    // Real CSV export using actual AI growth data
    const handleExport = () => {
        const rows = [
            ['Period', 'Growth Value', 'Engagement', 'Time Range'],
            ...(aiData?.growthBars ?? []).map((d) => [d.label, d.value, d.engage, timeRange])
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aura-analytics-${timeRange.replace(/\s+/g, '-').toLowerCase()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 2500);
    };

    const ai = aiData;
    const stats = [
        { label: "Marketing ROI", value: ai?.roi.marketing_roi ?? "$15,200", change: ai?.roi.roi_change ?? "+18.5%", positive: true, icon: <TrendingUp size={20} /> },
        { label: "Attributed Revenue", value: ai?.roi.attributed_revenue ?? "$52,400", change: ai?.roi.revenue_change ?? "+11.2%", positive: true, icon: <BarChart3 size={20} /> },
        { label: "AI Efficiency Gain", value: ai?.roi.ai_efficiency ?? "+28%", change: ai?.roi.efficiency_change ?? "+6.1%", positive: true, icon: <Sparkles size={20} /> },
    ];

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
            {/* Header */}
            <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-primary/10 bg-background/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                        <BarChart3 size={20} />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-xl font-black uppercase italic tracking-tight text-white leading-none">Analytics Hub</h2>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1 hidden sm:block">Intelligence Dashboard</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={() => {
                            const idx = timeOptions.indexOf(timeRange);
                            setTimeRange(timeOptions[(idx + 1) % timeOptions.length]);
                        }}
                        className="flex items-center bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 cursor-pointer transition-all hover:border-primary/40"
                    >
                        <Calendar size={14} className="text-primary mr-2" />
                        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">{timeRange}</span>
                        <span className="text-xs font-bold uppercase tracking-wider sm:hidden">{timeRange.replace('Last ', '')}</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-black/10"
                    >
                        <Download size={14} />
                        <span className="hidden sm:inline">{exportSuccess ? '✓ Downloaded!' : 'Export CSV'}</span>
                        <span className="sm:hidden">{exportSuccess ? '✓' : 'Export'}</span>
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 no-scrollbar">
                {/* ROI Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, idx) => (
                        <div key={idx} className={`${idx === 0 ? 'bg-primary text-white' : 'bg-primary/5 text-white'} rounded-[2rem] border border-primary/10 p-8 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all`}>
                            {idx === 0 && <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-white/10" />}
                            <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${idx === 0 ? 'text-white/70' : 'text-slate-500'}`}>{stat.label}</p>
                            <h3 className="text-3xl font-black italic tracking-tighter mb-4">{stat.value}</h3>
                            <div className="flex items-center gap-2">
                                <span className={`flex items-center text-[10px] font-black px-2.5 py-1 rounded-full ${idx === 0 ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                    {stat.change}
                                </span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${idx === 0 ? 'text-white/50' : 'text-slate-400'}`}>vs previous</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Charts Area */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div className="xl:col-span-2 bg-primary/5 rounded-[2.5rem] border border-primary/10 p-10 flex flex-col shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight mb-1">Growth Velocity</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Followers vs Engagement Trends</p>
                            </div>
                            <div className="flex gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-sm"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Growth</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 opacity-30"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Engage</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 min-h-[300px] flex items-end gap-3 px-2 mt-4">
                            {loadingAI ? (
                                <div className="w-full h-full bg-primary/5 rounded-2xl animate-pulse flex items-center justify-center">
                                    <Loader2 size={24} className="animate-spin text-primary/40" />
                                </div>
                            ) : (aiData?.growthBars ?? []).map((d, i) => (
                                <div key={i} className="flex-1 relative group cursor-pointer">
                                    <div className="absolute inset-x-0 bottom-0 bg-primary/10 rounded-2xl h-[100%]"></div>
                                    <div
                                        style={{ height: `${d.value}%` }}
                                        className="absolute inset-x-0 bottom-0 bg-primary rounded-2xl transition-all duration-700 group-hover:brightness-110 shadow-lg shadow-primary/10"
                                    ></div>
                                    <div
                                        style={{ height: `${d.engage}%`, opacity: 0.35 }}
                                        className="absolute inset-x-0 bottom-0 bg-indigo-500 rounded-2xl transition-all duration-700"
                                    ></div>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] px-2 py-1 rounded font-black whitespace-nowrap">
                                        +{d.value}%
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">
                            {(aiData?.growthBars ?? []).map((d, i) => <span key={`${d.label}-${i}`}>{d.label}</span>)}
                        </div>
                    </div>

                    <div className="bg-primary rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-primary/30">
                        <Sparkles className="absolute -right-20 -top-20 w-80 h-80 text-white/5" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                                    <Sparkles size={20} />
                                </div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight">AI Insights</h3>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3">Sentiment Score</p>
                                    {loadingAI ? (
                                        <div className="h-8 bg-white/10 rounded-xl animate-pulse" />
                                    ) : (
                                        <div className="flex items-center gap-4">
                                            <div className="text-4xl font-black italic">{ai?.sentiment.score ?? 82}%</div>
                                            <div className="px-3 py-1 bg-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest">{ai?.sentiment.label ?? 'Positive'}</div>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 relative">
                                    {isAnalyzing ? (
                                        <div className="flex flex-col items-center justify-center py-4 gap-3">
                                            <Loader2 className="animate-spin text-white/60" size={24} />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Analyzing Data...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3">NVIDIA Llama Intelligence</p>
                                            <p className="text-sm font-medium leading-relaxed italic opacity-90">
                                                {aiSentiment || "Click refresh to generate deep intelligence analysis of your campaign performance."}
                                            </p>
                                        </>
                                    )}
                                </div>

                                <button
                                    onClick={handleRunAiAnalysis}
                                    className="w-full py-4 bg-white text-primary rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Refresh Analysis
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Performance Gallery */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tight mb-1">Top Performers</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">High Conversion Content Hub</p>
                        </div>
                        <button
                            onClick={() => router.push('/dashboard/campaigns?filter=completed')}
                            className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b-2 border-primary/20 hover:border-primary transition-all pb-1"
                        >
                            View All
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loadingAI ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-primary/5 rounded-3xl border border-primary/10 overflow-hidden animate-pulse">
                                    <div className="aspect-video bg-primary/10" />
                                    <div className="p-6 space-y-2">
                                        <div className="h-3 bg-white/5 rounded w-1/2" />
                                        <div className="h-4 bg-white/5 rounded w-3/4" />
                                    </div>
                                </div>
                            ))
                        ) : (ai?.campaigns ?? []).map((c) => (
                            <div key={c.id} className="bg-primary/5 rounded-3xl border border-primary/10 overflow-hidden group hover:border-primary/30 transition-all shadow-sm">
                                <div className="relative aspect-video overflow-hidden bg-primary/10">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 transition-opacity group-hover:opacity-40"></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-primary/20">
                                        <Sparkles size={48} />
                                    </div>
                                    <div className="absolute top-4 left-4 z-20 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
                                        <p className="text-[9px] font-black text-white uppercase tracking-widest">{c.platform} / {c.format}</p>
                                    </div>
                                    <div className="absolute bottom-4 right-4 z-20 text-white flex items-center gap-1">
                                        <TrendingUp size={14} className="text-emerald-400" />
                                        <span className="text-xs font-black italic">{c.change}</span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{c.platform} / {c.format}</p>
                                    <h4 className="font-bold text-sm truncate mb-4">{c.title}</h4>
                                    <div className="flex items-center justify-between text-slate-500 pt-4 border-t border-primary/5">
                                        <div className="flex items-center gap-1.5">
                                            <Heart size={14} />
                                            <span className="text-[10px] font-bold">{c.likes}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Share2 size={14} />
                                            <span className="text-[10px] font-bold">{c.shares}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Eye size={14} />
                                            <span className="text-[10px] font-bold">{c.views}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* =====================================================
                    CUSTOMER INSIGHTS SECTION
                ====================================================== */}
                <section className="space-y-8">
                    {/* Section Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                                <Target size={22} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">Customer Insights</h3>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">AI-Powered Deep Analysis</p>
                            </div>
                        </div>
                        {/* Tab Switcher */}
                        <div className="flex flex-wrap bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-primary/5 gap-0.5">
                            {([
                                { key: 'audience' as InsightsTab, label: 'Audience' },
                                { key: 'behavior' as InsightsTab, label: 'Behavior' },
                                { key: 'painpoints' as InsightsTab, label: 'Pain Points' },
                                { key: 'demand' as InsightsTab, label: 'Demand' },
                                { key: 'geo' as InsightsTab, label: 'Geo & Local' },
                                { key: 'competitors' as InsightsTab, label: 'Competitors' },
                                { key: 'predictive' as InsightsTab, label: 'AI Predict' },
                            ]).map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setInsightsTab(tab.key)}
                                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${insightsTab === tab.key
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ========== TAB: TARGET AUDIENCE ANALYSIS ========== */}
                    {insightsTab === 'audience' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* Audience Stat Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[
                                    { label: "Ideal Age Range", value: ai?.audienceStats.age_range ?? "25–34", icon: <UserCheck size={20} />, badge: "Primary" },
                                    { label: "Top Gender", value: ai?.audienceStats.top_gender ?? "62% Female", icon: <Users size={20} />, badge: "Dominant" },
                                    { label: "Income Level", value: ai?.audienceStats.income_level ?? "$45k–$75k", icon: <DollarSign size={20} />, badge: "Mid-High" },
                                    { label: "Primary Language", value: "English", icon: <Languages size={20} />, badge: ai?.audienceStats.language_pct ?? "89%" },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-primary/5 border border-primary/10 p-6 rounded-[2rem] shadow-sm hover:border-primary/30 transition-all group">
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">{stat.icon}</div>
                                            <span className="text-[9px] font-black px-2 py-1 rounded-full bg-primary/10 text-primary">{stat.badge}</span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                                        <h3 className="text-2xl font-black italic tracking-tighter text-white">{stat.value}</h3>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Device Usage */}
                                <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-8">
                                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Device Usage</h4>
                                        <Monitor size={16} className="text-primary" />
                                    </div>
                                    <div className="flex items-center justify-center gap-8 mb-8">
                                        {/* Donut chart visual */}
                                        <div className="relative w-36 h-36">
                                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/5" />
                                                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${ai?.audienceStats.mobile_pct ?? 68} ${100 - (ai?.audienceStats.mobile_pct ?? 68)}`} strokeLinecap="round" className="text-primary" />
                                                <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${ai?.audienceStats.desktop_pct ?? 32} ${100 - (ai?.audienceStats.desktop_pct ?? 32)}`} strokeDashoffset={`-${ai?.audienceStats.mobile_pct ?? 68}`} strokeLinecap="round" className="text-indigo-500" />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-2xl font-black italic text-white">{ai?.audienceStats.mobile_pct ?? 68}%</span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Mobile</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Smartphone size={16} className="text-primary" />
                                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Mobile</span>
                                            </div>
                                            <span className="text-[11px] font-black text-primary">{ai?.audienceStats.mobile_pct ?? 68}%</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Monitor size={16} className="text-indigo-500" />
                                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-300">Desktop</span>
                                            </div>
                                            <span className="text-[11px] font-black text-indigo-500">{ai?.audienceStats.desktop_pct ?? 32}%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Top Locations */}
                                <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-8">
                                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Top Locations</h4>
                                        <MapPin size={16} className="text-primary" />
                                    </div>
                                    <div className="space-y-5">
                                        {(ai?.audienceStats.locations ?? []).map(c => (
                                            <div key={c.city}>
                                                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                                                    <span>{c.city}</span>
                                                    <span className="text-primary">{c.val}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${c.val}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Language Distribution */}
                                <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                                    <Sparkles className="absolute -right-10 -top-10 w-48 h-48 text-white/5" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-8">
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em]">Languages</h4>
                                            <span className="bg-white/20 text-[9px] font-black px-2 py-0.5 rounded uppercase backdrop-blur-md">AI Detected</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {(ai?.audienceStats.languages ?? []).map(l => (
                                                <div key={l.lang} className="bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-default flex items-center gap-2">
                                                    <span>{l.lang}</span>
                                                    <span className="text-white/60">{l.pct}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
                                            <p className="text-xs font-medium leading-relaxed italic opacity-90">
                                                &quot;{ai?.audienceStats.language_insight ?? '89% of your audience prefers English content. Consider creating Hindi variations to capture 42% of bilingual users.'}&quot;
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========== TAB: CUSTOMER BEHAVIOR INSIGHTS ========== */}
                    {insightsTab === 'behavior' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* Behavior Stat Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {([] as any[]).map((stat, i) => (
                                    <div key={i} className="bg-primary/5 border border-primary/10 p-6 rounded-[2rem] shadow-sm hover:border-primary/30 transition-all group">
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">{stat.icon}</div>
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : stat.change.startsWith('-') ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'}`}>
                                                {stat.change}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                                        <h3 className="text-2xl font-black italic tracking-tighter text-white">{stat.value}</h3>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* Purchase Funnel */}
                                <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-1">Pages Before Purchase</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Journey Funnel</p>
                                        </div>
                                        <MousePointerClick size={16} className="text-primary" />
                                    </div>
                                    <div className="space-y-4">
                                        {([] as any[]).map((step, i) => (
                                            <div key={step.page} className="group">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                                    <span className="text-slate-300 flex items-center gap-2">
                                                        <span className="w-5 h-5 bg-primary/20 rounded-lg flex items-center justify-center text-primary text-[9px]">{i + 1}</span>
                                                        {step.page}
                                                    </span>
                                                    <span className="text-slate-500">{step.visitors}</span>
                                                </div>
                                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full transition-all duration-1000"
                                                        style={{
                                                            width: `${step.pct}%`,
                                                            background: `linear-gradient(90deg, var(--color-primary), ${i > 3 ? '#f59e0b' : 'var(--color-primary)'})`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Purchase Timing Heatmap */}
                                <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-1">Purchase Timing</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">When Customers Buy</p>
                                        </div>
                                        <Calendar size={16} className="text-primary" />
                                    </div>
                                    <div className="space-y-3">
                                        {/* Time labels */}
                                        <div className="flex gap-1 ml-16">
                                            {['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'].map(t => (
                                                <div key={t} className="flex-1 text-center text-[8px] font-black text-slate-500 uppercase tracking-wider">{t}</div>
                                            ))}
                                        </div>
                                        {/* Heatmap rows */}
                                        {([] as { day: string, vals: number[] }[]).map(row => (
                                            <div key={row.day} className="flex items-center gap-1">
                                                <span className="w-16 text-[9px] font-black text-slate-500 uppercase tracking-widest text-right pr-2 shrink-0">{row.day.slice(0, 3)}</span>
                                                {row.vals.map((v, vi) => (
                                                    <div
                                                        key={vi}
                                                        className="flex-1 h-8 rounded-lg transition-all hover:scale-110 cursor-default group relative"
                                                        style={{ backgroundColor: `hsl(var(--primary-hsl, 259 100% 65%) / ${v / 100})` }}
                                                        title={`${row.day} ${['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'][vi]}: ${v}%`}
                                                    >
                                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                            {v}%
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex items-center justify-end gap-2 mt-6">
                                        <span className="text-[8px] font-black text-slate-500 uppercase">Low</span>
                                        <div className="flex gap-0.5">
                                            {[10, 30, 50, 70, 90].map(v => (
                                                <div key={v} className="w-4 h-2 rounded-sm" style={{ backgroundColor: `hsl(259 100% 65% / ${v / 100})` }}></div>
                                            ))}
                                        </div>
                                        <span className="text-[8px] font-black text-slate-500 uppercase">High</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========== TAB: CUSTOMER PAIN POINTS ========== */}
                    {insightsTab === 'painpoints' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Top Search Problems */}
                                <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-8">
                                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Search Problems</h4>
                                        <Search size={16} className="text-primary" />
                                    </div>
                                    <div className="space-y-4">
                                        {([] as any[]).map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group cursor-default">
                                                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-[10px] font-black">
                                                    #{i + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-bold text-slate-200 truncate">{item.query}</p>
                                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.count} searches/mo</p>
                                                </div>
                                                {item.trend === 'up' ? (
                                                    <TrendingUp size={14} className="text-orange-500 shrink-0" />
                                                ) : (
                                                    <TrendingDown size={14} className="text-emerald-500 shrink-0" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Negative Review Sentiment */}
                                <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                    <div className="flex items-center gap-2 mb-8">
                                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Review Sentiment</h4>
                                        <span className="bg-orange-500/10 text-orange-500 text-[9px] font-black px-2 py-0.5 rounded uppercase">AI Analyzed</span>
                                    </div>
                                    <div className="space-y-6">
                                        {/* Sentiment breakdown */}
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden flex">
                                                <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: '62%' }}></div>
                                                <div className="h-full bg-amber-500" style={{ width: '23%' }}></div>
                                                <div className="h-full bg-red-500 rounded-r-full" style={{ width: '15%' }}></div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            {([] as any[]).map(s => (
                                                <div key={s.label} className="text-center">
                                                    <p className={`text-lg font-black italic ${s.color}`}>{s.val}</p>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-primary/10 pt-5 space-y-3">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Top Negative Themes</p>
                                            {([] as any[]).map(t => (
                                                <div key={t.theme} className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                                                    <span className="text-[11px] font-bold text-slate-300">{t.theme}</span>
                                                    <span className="text-[9px] font-black text-red-400">{t.mentions} mentions</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* FAQ Sentiment & Objections */}
                                <div className="space-y-8">
                                    {/* FAQ Sentiment */}
                                    <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">FAQ Sentiment</h4>
                                            <HelpCircle size={16} className="text-primary" />
                                        </div>
                                        <div className="space-y-4">
                                            {([] as any[]).map(faq => (
                                                <div key={faq.topic}>
                                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                                        <span className="text-slate-300">{faq.topic}</span>
                                                        <span className={faq.negative ? 'text-orange-500' : 'text-emerald-500'}>{faq.sentiment}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-1000 ${faq.negative ? 'bg-orange-500' : 'bg-emerald-500'}`}
                                                            style={{ width: `${faq.sentiment}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Common Objections */}
                                    <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                                        <ShieldAlert className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5" />
                                        <div className="relative z-10">
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] mb-6">Buying Objections</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    { text: "Too expensive", size: "large" },
                                                    { text: "Not sure about quality", size: "medium" },
                                                    { text: "Shipping too slow", size: "large" },
                                                    { text: "No free trial", size: "small" },
                                                    { text: "Complex setup", size: "medium" },
                                                    { text: "Better alternatives", size: "small" },
                                                    { text: "Privacy concerns", size: "medium" },
                                                    { text: "No phone support", size: "small" },
                                                ].map(obj => (
                                                    <div
                                                        key={obj.text}
                                                        className={`bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl font-black uppercase tracking-wider transition-all cursor-default ${obj.size === 'large' ? 'px-4 py-2 text-[11px]' : obj.size === 'medium' ? 'px-3 py-1.5 text-[10px]' : 'px-2.5 py-1 text-[9px]'
                                                            }`}
                                                    >
                                                        {obj.text}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========== TAB: MARKET DEMAND INSIGHTS ========== */}
                    {insightsTab === 'demand' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* Search Demand Trends */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {([] as any[]).map((stat, i) => (
                                    <div key={i} className="bg-primary/5 border border-primary/10 p-6 rounded-[2rem] shadow-sm hover:border-primary/30 transition-all group">
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">{stat.icon}</div>
                                            <span className="text-[9px] font-black px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500">{stat.change}</span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                                        <h3 className="text-2xl font-black italic tracking-tighter text-white">{stat.value}</h3>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Monthly Search Volume Trend */}
                                <div className="xl:col-span-2 bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-1">Monthly Search Volume</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">12-Month Demand Trend</p>
                                        </div>
                                        <BarChart3 size={16} className="text-primary" />
                                    </div>
                                    <div className="h-56 flex items-end gap-2 px-1">
                                        {([] as any[]).map((m, i) => (
                                            <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group cursor-default">
                                                <div className="relative w-full flex-1 flex items-end">
                                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                        {Math.round(m.vol * 1.5)}k
                                                    </div>
                                                    <div
                                                        className={`w-full rounded-xl transition-all duration-700 group-hover:brightness-125 ${m.vol >= 90 ? 'bg-primary shadow-lg shadow-primary/30' : m.vol >= 70 ? 'bg-primary/70' : 'bg-primary/30'
                                                            }`}
                                                        style={{ height: `${m.vol}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">{m.month}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Rising Keywords */}
                                <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                                    <Sparkles className="absolute -right-10 -top-10 w-48 h-48 text-white/5" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-6">
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em]">Rising Keywords</h4>
                                            <span className="bg-white/20 text-[9px] font-black px-2 py-0.5 rounded uppercase backdrop-blur-md">Trending</span>
                                        </div>
                                        <div className="space-y-3">
                                            {([] as any[]).map((kw, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/15 rounded-xl transition-all cursor-default">
                                                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-[9px] font-black">{i + 1}</div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-bold truncate">{kw.keyword}</p>
                                                        <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">{kw.vol}/mo</p>
                                                    </div>
                                                    <span className="text-[10px] font-black text-emerald-300 shrink-0">{kw.growth}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Seasonal & Time-Based Insights + Regional Demand */}
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Best Months to Sell */}
                                <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-1">Best Months</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Seasonal Demand Peaks</p>
                                        </div>
                                        <Calendar size={16} className="text-primary" />
                                    </div>
                                    <div className="space-y-4">
                                        {([] as any[]).map(m => (
                                            <div key={m.month} className="group">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-2">
                                                    <span className="text-slate-300 flex items-center gap-2">
                                                        {m.icon} {m.month}
                                                    </span>
                                                    <span className="text-primary">{m.score}%</span>
                                                </div>
                                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${m.score >= 90 ? 'bg-primary' : m.score >= 75 ? 'bg-primary/70' : 'bg-primary/40'}`}
                                                        style={{ width: `${m.score}%` }}
                                                    ></div>
                                                </div>
                                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">{m.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Best Day & Time */}
                                <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-1">Best Day & Time</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optimal Selling Windows</p>
                                        </div>
                                        <Clock size={16} className="text-primary" />
                                    </div>

                                    {/* Best Day */}
                                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 mb-6">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Best Day of Week</p>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-3xl font-black italic text-primary">Friday</span>
                                            <span className="text-[10px] font-black text-emerald-500">+28% conv.</span>
                                        </div>
                                    </div>

                                    {/* Day breakdown */}
                                    <div className="space-y-3 mb-6">
                                        {([] as any[]).map(d => (
                                            <div key={d.day} className="flex items-center gap-3">
                                                <span className="w-8 text-[9px] font-black text-slate-500 uppercase tracking-widest">{d.day}</span>
                                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${d.val >= 85 ? 'bg-primary' : 'bg-primary/30'}`}
                                                        style={{ width: `${d.val}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-[9px] font-black text-slate-500 w-8 text-right">{d.val}%</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Best Time */}
                                    <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Best Time of Day</p>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-3xl font-black italic text-primary">7–10 PM</span>
                                            <span className="text-[10px] font-black text-emerald-500">+34% orders</span>
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Evening prime window</p>
                                    </div>
                                </div>

                                {/* Regional Demand */}
                                <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-1">Regional Demand</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Markets by Search Volume</p>
                                        </div>
                                        <MapPin size={16} className="text-primary" />
                                    </div>
                                    <div className="space-y-5">
                                        {([] as any[]).map(r => (
                                            <div key={r.region}>
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-2">
                                                    <span className="text-slate-300 flex items-center gap-2">
                                                        <span className="text-sm">{r.flag}</span> {r.region}
                                                    </span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-slate-500">{r.volume}</span>
                                                        <span className="text-primary">{r.pct}%</span>
                                                    </div>
                                                </div>
                                                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${r.pct}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========== TAB: GEOGRAPHIC & LOCAL MARKET ========== */}
                    {insightsTab === 'geo' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* Stat Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {([] as any[]).map((stat, i) => (
                                    <div key={i} className="bg-primary/5 border border-primary/10 p-6 rounded-[2rem] shadow-sm hover:border-primary/30 transition-all group">
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">{stat.icon}</div>
                                            <span className="text-[9px] font-black px-2 py-1 rounded-full bg-primary/10 text-primary">{stat.change}</span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                                        <h3 className="text-2xl font-black italic tracking-tighter text-white">{stat.value}</h3>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* High-Demand Cities */}
                                <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-1">High-Demand Cities</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Revenue Markets</p>
                                        </div>
                                        <Building2 size={16} className="text-primary" />
                                    </div>
                                    <div className="space-y-4">
                                        {([] as any[]).map(c => (
                                            <div key={c.city} className="group">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest mb-2">
                                                    <span className="text-slate-300">{c.city}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-slate-500">{c.revenue}</span>
                                                        <span className="text-emerald-500">{c.growth}</span>
                                                    </div>
                                                </div>
                                                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full transition-all duration-1000 ${c.demand >= 90 ? 'bg-primary' : c.demand >= 75 ? 'bg-primary/70' : 'bg-primary/40'}`} style={{ width: `${c.demand}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Low-Competition Regions */}
                                <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                                    <Sparkles className="absolute -right-10 -top-10 w-48 h-48 text-white/5" />
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-2 mb-6">
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em]">Untapped Markets</h4>
                                            <span className="bg-white/20 text-[9px] font-black px-2 py-0.5 rounded uppercase backdrop-blur-md">Opportunity</span>
                                        </div>
                                        <div className="space-y-3">
                                            {([] as any[]).map((r, i) => (
                                                <div key={i} className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/15 rounded-xl transition-all cursor-default">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[9px] font-black ${r.score >= 90 ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/20'}`}>
                                                        {r.score}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-bold truncate">{r.region}</p>
                                                        <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">{r.competitors} competitors</p>
                                                    </div>
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${r.potential === 'Very High' ? 'bg-emerald-500/30 text-emerald-300' : r.potential === 'High' ? 'bg-amber-500/30 text-amber-300' : 'bg-white/20 text-white/70'}`}>
                                                        {r.potential}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Regional Pricing & Competitor Density */}
                                <div className="space-y-8">
                                    {/* Pricing Variation */}
                                    <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Regional Pricing</h4>
                                            <Tag size={16} className="text-primary" />
                                        </div>
                                        <div className="space-y-4">
                                            {([] as any[]).map(p => (
                                                <div key={p.region} className="p-4 bg-white/5 rounded-2xl border border-primary/10">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{p.region}</span>
                                                        <span className="text-lg font-black italic text-primary">{p.avg}</span>
                                                    </div>
                                                    <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                                        <span>Range: {p.range}</span>
                                                        <span>Index: {p.idx}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Competitor Density */}
                                    <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Competitor Density</h4>
                                            <Users size={16} className="text-primary" />
                                        </div>
                                        <div className="space-y-3">
                                            {([] as any[]).map(z => (
                                                <div key={z.zone} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{z.zone}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-slate-500">{z.count} brands</span>
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${z.color}`}>{z.density}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========== TAB: COMPETITOR INTELLIGENCE ========== */}
                    {insightsTab === 'competitors' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* Competitor Overview Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {([] as any[]).map((stat, i) => (
                                    <div key={i} className="bg-primary/5 border border-primary/10 p-6 rounded-[2rem] shadow-sm hover:border-primary/30 transition-all group">
                                        <div className="flex justify-between items-start mb-5">
                                            <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">{stat.icon}</div>
                                            <span className="text-[9px] font-black px-2 py-1 rounded-full bg-primary/10 text-primary">{stat.change}</span>
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                                        <h3 className="text-2xl font-black italic tracking-tighter text-white">{stat.value}</h3>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Competitor Ads Analysis */}
                                <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                    <div className="flex items-center gap-2 mb-6">
                                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Competitor Ads</h4>
                                        <span className="bg-orange-500/10 text-orange-500 text-[9px] font-black px-2 py-0.5 rounded uppercase">Live</span>
                                    </div>
                                    <div className="space-y-4">
                                        {([] as any[]).map((ad, i) => (
                                            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-primary/10 hover:border-primary/25 transition-all group cursor-default">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{ad.brand}</span>
                                                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">{ad.platform}</span>
                                                </div>
                                                <p className="text-[11px] font-bold text-slate-200 mb-2">&quot;{ad.headline}&quot;</p>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">CTA: {ad.cta}</span>
                                                    <span className="text-[9px] font-bold text-slate-500">{ad.spend}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Content Strategy */}
                                <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-1">Content Strategy</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Competitor Activity</p>
                                        </div>
                                        <FileText size={16} className="text-primary" />
                                    </div>
                                    <div className="space-y-5">
                                        {/* Blog Topics */}
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2"><FileText size={12} /> Top Blog Topics</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {([] as string[]).map(t => (
                                                    <span key={t} className="px-2.5 py-1 bg-white/5 border border-primary/10 rounded-lg text-[9px] font-black text-slate-300 uppercase tracking-wider">{t}</span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Post Frequency */}
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2"><Hash size={12} /> Posting Frequency</p>
                                            <div className="space-y-3">
                                                {([] as any[]).map(b => (
                                                    <div key={b.brand}>
                                                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1">
                                                            <span className={b.brand.includes('Aura') ? 'text-primary' : 'text-slate-400'}>{b.brand}</span>
                                                            <span className="text-slate-500">{b.posts}</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full transition-all duration-1000 ${b.brand.includes('Aura') ? 'bg-primary' : 'bg-primary/30'}`} style={{ width: `${b.pct}%` }}></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Video Engagement */}
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2"><Video size={12} /> Video Engagement</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                {([] as any[]).map(v => (
                                                    <div key={v.brand} className={`p-3 rounded-xl text-center ${v.brand.includes('Aura') ? 'bg-primary/20 border border-primary/30' : 'bg-white/5'}`}>
                                                        <p className="text-lg font-black italic text-white">{v.rate}</p>
                                                        <p className={`text-[8px] font-black uppercase tracking-widest ${v.brand.includes('Aura') ? 'text-primary' : 'text-slate-500'}`}>{v.brand}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing Intelligence */}
                                <div className="space-y-8">
                                    <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                                        <Crown className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5" />
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-6">
                                                <h4 className="text-sm font-black uppercase tracking-[0.2em]">Pricing Intel</h4>
                                                <span className="bg-white/20 text-[9px] font-black px-2 py-0.5 rounded uppercase backdrop-blur-md">AI Monitored</span>
                                            </div>

                                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 mb-4">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-2">Market Average</p>
                                                <div className="flex items-baseline gap-3">
                                                    <span className="text-3xl font-black italic">$84.50</span>
                                                    <span className="text-[10px] font-black text-emerald-300">Your: $79.00</span>
                                                </div>
                                                <p className="text-[9px] font-bold text-white/50 mt-1 uppercase tracking-widest">6.5% below market — competitive</p>
                                            </div>

                                            <div className="space-y-3">
                                                {([] as any[]).map(p => (
                                                    <div key={p.brand} className="flex items-center justify-between p-2.5 bg-white/10 rounded-xl">
                                                        <span className="text-[10px] font-bold">{p.brand}</span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-[11px] font-black italic">{p.price}</span>
                                                            <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">{p.position}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Discount Patterns */}
                                    <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Discount Patterns</h4>
                                            <Percent size={16} className="text-primary" />
                                        </div>
                                        <div className="space-y-3">
                                            {([] as any[]).map(d => (
                                                <div key={d.type} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{d.type}</p>
                                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{d.freq} · {d.avg} off</p>
                                                    </div>
                                                    {d.trend === 'up' ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-orange-500" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ========== TAB: AI PREDICTIVE INSIGHTS ========== */}
                    {insightsTab === 'predictive' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {/* Hero Predictive Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {([] as any[]).map((stat, i) => (
                                    <div key={i} className={`${i === 3 ? 'bg-primary text-white' : 'bg-primary/5 text-white'} border border-primary/10 p-6 rounded-[2rem] shadow-sm hover:border-primary/30 transition-all group relative overflow-hidden`}>
                                        {i === 3 && <Sparkles className="absolute -right-4 -top-4 w-20 h-20 text-white/10" />}
                                        <div className="flex justify-between items-start mb-5 relative z-10">
                                            <div className={`p-3 rounded-2xl ${i === 3 ? 'bg-white/20' : 'bg-primary/10'} text-${i === 3 ? 'white' : 'primary'} group-hover:scale-110 transition-transform`}>{stat.icon}</div>
                                            <span className={`text-[9px] font-black px-2 py-1 rounded-full ${i === 3 ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'}`}>{stat.sub}</span>
                                        </div>
                                        <p className={`text-[10px] font-black uppercase tracking-widest mb-1 relative z-10 ${i === 3 ? 'text-white/70' : 'text-slate-400'}`}>{stat.label}</p>
                                        <h3 className="text-2xl font-black italic tracking-tighter text-white relative z-10">{stat.value}</h3>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Demand Forecasting Chart */}
                                <div className="xl:col-span-2 bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-8">
                                        <div>
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-1">Demand Forecast</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI-Predicted 6-Month Trajectory</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Actual</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Predicted</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-56 flex items-end gap-2 px-1">
                                        {([] as any[]).map((m) => (
                                            <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group cursor-default">
                                                <div className="relative w-full flex-1 flex items-end">
                                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                        {(m.actual || m.predicted)}k
                                                    </div>
                                                    <div
                                                        className={`w-full rounded-xl transition-all duration-700 group-hover:brightness-125 ${m.predicted ? 'bg-emerald-500/60 border-2 border-dashed border-emerald-500/40' : 'bg-primary shadow-lg shadow-primary/20'
                                                            }`}
                                                        style={{ height: `${m.actual || m.predicted}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-[8px] font-black uppercase tracking-wider ${m.predicted ? 'text-emerald-500' : 'text-slate-500'}`}>{m.month}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                        <p className="text-[10px] font-bold text-emerald-400 leading-relaxed italic">
                                            &quot;AI forecasts a 34% increase in demand over the next quarter driven by seasonal trends and rising keyword volume in your core segments.&quot;
                                        </p>
                                    </div>
                                </div>

                                {/* Revenue & Churn Prediction */}
                                <div className="space-y-8">
                                    {/* Revenue Prediction */}
                                    <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                                        <Brain className="absolute -right-8 -top-8 w-40 h-40 text-white/5" />
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-6">
                                                <h4 className="text-sm font-black uppercase tracking-[0.2em]">Revenue Prediction</h4>
                                                <span className="bg-white/20 text-[9px] font-black px-2 py-0.5 rounded uppercase backdrop-blur-md">AI</span>
                                            </div>
                                            <div className="space-y-4">
                                                {([] as any[]).map(r => (
                                                    <div key={r.period} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-white/60">{r.period}</span>
                                                            <span className="text-[9px] font-black text-emerald-300">{r.confidence} conf.</span>
                                                        </div>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-xl font-black italic">{r.predicted}</span>
                                                            <TrendingUp size={14} className="text-emerald-300" />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Churn Prediction */}
                                    <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Churn Prediction</h4>
                                            <Activity size={16} className="text-orange-500" />
                                        </div>
                                        <div className="flex items-center justify-center mb-6">
                                            <div className="relative w-28 h-28">
                                                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/5" />
                                                    <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="8.4 91.6" strokeLinecap="round" className="text-orange-500" />
                                                </svg>
                                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                    <span className="text-2xl font-black italic text-orange-500">8.4%</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">At Risk</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            {([] as any[]).map(s => (
                                                <div key={s.segment} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                                    <span className="text-[10px] font-bold text-slate-300">{s.segment}</span>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[9px] font-bold text-slate-500">{s.count}</span>
                                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${s.color}`}>{s.risk}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Creative Prediction + Optimal Pricing */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* Best Performing Creative Prediction */}
                                <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                    <div className="flex items-center gap-2 mb-6">
                                        <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Creative Predictions</h4>
                                        <span className="bg-primary/10 text-primary text-[9px] font-black px-2 py-0.5 rounded uppercase">AI Ranked</span>
                                    </div>
                                    <div className="space-y-4">
                                        {([] as any[]).map(c => (
                                            <div key={c.type} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group cursor-default">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0 ${c.rank === 1 ? 'bg-primary text-white shadow-lg shadow-primary/30' : c.rank <= 3 ? 'bg-primary/20 text-primary' : 'bg-white/10 text-slate-400'
                                                    }`}>
                                                    #{c.rank}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-black text-slate-200 uppercase tracking-wider">{c.type}</p>
                                                    <p className="text-[9px] font-bold text-slate-500 truncate">{c.prediction}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className={`text-sm font-black italic ${c.score >= 80 ? 'text-emerald-500' : c.score >= 60 ? 'text-amber-500' : 'text-slate-500'}`}>{c.score}%</p>
                                                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{c.roi}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Optimal Pricing Suggestion */}
                                <div className="space-y-8">
                                    <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                                        <Lightbulb className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5" />
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-6">
                                                <h4 className="text-sm font-black uppercase tracking-[0.2em]">Pricing Optimizer</h4>
                                                <span className="bg-white/20 text-[9px] font-black px-2 py-0.5 rounded uppercase backdrop-blur-md">AI Powered</span>
                                            </div>

                                            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 mb-4">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-2">Recommended Price Point</p>
                                                <div className="flex items-baseline gap-3">
                                                    <span className="text-4xl font-black italic">$82.00</span>
                                                    <span className="text-[10px] font-black text-emerald-300">+6.5% revenue</span>
                                                </div>
                                                <p className="text-[9px] font-bold text-white/50 mt-2 uppercase tracking-widest">Optimized for max revenue × conversion balance</p>
                                            </div>

                                            <div className="space-y-3">
                                                {([] as any[]).map(s => (
                                                    <div key={s.strategy} className={`flex items-center justify-between p-3 rounded-xl ${s.score >= 90 ? 'bg-white/20 border border-white/30' : 'bg-white/10'}`}>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest">{s.strategy}</p>
                                                            <p className="text-[8px] font-bold text-white/50">{s.impact}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-sm font-black italic">{s.price}</span>
                                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${s.score >= 90 ? 'bg-emerald-500/30 text-emerald-300' : 'bg-white/20 text-white/60'}`}>{s.score}%</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Model Status */}
                                    <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm">
                                        <div className="flex justify-between items-center mb-6">
                                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">AI Model Status</h4>
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            {([] as any[]).map(m => (
                                                <div key={m.model} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{m.model}</p>
                                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Updated {m.updated}</p>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-[10px] font-black text-primary">{m.accuracy}</span>
                                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${m.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{m.status}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </div>
            {/* Spacing */}
            <div className="h-10 shrink-0"></div>
        </div>
    );
}
