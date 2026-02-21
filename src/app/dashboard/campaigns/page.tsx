'use client';

import React, { useState, useEffect } from 'react';
import {
    Megaphone, Plus, Search, BarChart3, Target,
    Calendar, Eye, TrendingUp, Sparkles, CheckCircle2,
    Clock, PlayCircle, PauseCircle, Loader2, Zap, Globe, Brain
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CampaignsAIData, CampaignItem } from '@/app/actions/ai';
import { getRealCampaignsData } from '@/app/actions/analytics';
import { createBrowserClient } from '@supabase/ssr';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    active: { label: "Active", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: <PlayCircle size={12} /> },
    scheduled: { label: "Scheduled", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: <Clock size={12} /> },
    paused: { label: "Paused", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: <PauseCircle size={12} /> },
    completed: { label: "Completed", color: "bg-slate-500/10 text-slate-400 border-slate-500/20", icon: <CheckCircle2 size={12} /> },
};


export default function CampaignsPage() {
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [loadingAI, setLoadingAI] = useState(true);
    const [aiData, setAiData] = useState<CampaignsAIData | null>(null);
    const router = useRouter();

    useEffect(() => {
        const load = async () => {
            setLoadingAI(true);
            try {
                // Get user
                const supabase = createBrowserClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const result = await getRealCampaignsData(user.id);
                setAiData(result.data);
            } catch (err) {
                console.warn('Campaigns AI fetch failed', err);
            } finally {
                setLoadingAI(false);
            }
        };
        load();
    }, []);

    const campaigns = aiData?.campaigns ?? [];
    const filtered = campaigns.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const matchFilter = activeFilter === 'all' || c.status === activeFilter;
        return matchSearch && matchFilter;
    });

    const summary = aiData?.summary;

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
            {/* Header */}
            <header className="h-16 lg:h-20 border-b border-primary/10 flex items-center justify-between px-4 md:px-8 bg-background/50 backdrop-blur-md sticky top-0 z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                        <Megaphone size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-2xl font-black uppercase italic tracking-tight text-white leading-none">Campaigns</h2>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1 hidden sm:block">Campaign Management Hub</p>
                    </div>
                </div>
                <button
                    onClick={() => router.push('/dashboard/campaigns/new')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                >
                    <Plus size={16} /> New Campaign
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 no-scrollbar">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Total Campaigns", value: summary?.total?.toString() ?? "—", icon: <Megaphone size={20} />, color: "text-primary" },
                        { label: "Active Now", value: summary?.active?.toString() ?? "—", icon: <PlayCircle size={20} />, color: "text-emerald-400" },
                        { label: "Total Reach", value: summary?.total_reach ?? "—", icon: <Eye size={20} />, color: "text-blue-400" },
                        { label: "Avg Engagement", value: summary?.avg_engagement ?? "—", icon: <TrendingUp size={20} />, color: "text-amber-400" },
                    ].map((s, i) => (
                        <div key={i} className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 group hover:border-primary/30 transition-all">
                            {loadingAI ? (
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-5 w-5 bg-primary/20 rounded" />
                                    <div className="h-3 bg-white/5 rounded w-3/4" />
                                    <div className="h-7 bg-white/5 rounded w-1/2" />
                                </div>
                            ) : (
                                <>
                                    <div className={`mb-3 ${s.color}`}>{s.icon}</div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                                    <h3 className="text-2xl font-black italic tracking-tighter text-white">{s.value}</h3>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="flex bg-white/5 p-1 rounded-2xl border border-primary/5 gap-1">
                        {['all', 'active', 'scheduled', 'paused', 'completed'].map(f => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${activeFilter === f ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-primary/5 border border-primary/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-200 focus:outline-none focus:border-primary w-64"
                            placeholder="Search campaigns..."
                        />
                    </div>
                </div>

                {/* Campaign List */}
                <div id="campaigns-list" className="space-y-4">
                    {loadingAI ? (
                        [1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 md:p-8 animate-pulse">
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex gap-3 flex-wrap">
                                            <div className="h-5 bg-white/5 rounded w-48" />
                                            <div className="h-5 bg-primary/10 rounded w-20" />
                                        </div>
                                        <div className="h-3 bg-white/5 rounded w-56" />
                                        <div className="h-1.5 bg-white/5 rounded-full w-full" />
                                    </div>
                                    <div className="flex gap-6">
                                        {[1, 2, 3].map(j => (
                                            <div key={j} className="text-center space-y-1">
                                                <div className="h-2 bg-white/5 rounded w-12 mx-auto" />
                                                <div className="h-5 bg-white/5 rounded w-16 mx-auto" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <Megaphone size={40} className="mx-auto mb-4 opacity-20" />
                            <p className="font-bold uppercase tracking-widest text-sm">No campaigns found</p>
                        </div>
                    ) : filtered.map(c => {
                        const st = statusConfig[c.status];
                        return (
                            <div key={c.id} className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 md:p-8 hover:border-primary/30 transition-all group">
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <h3 className="font-black text-white text-base uppercase italic tracking-tight">{c.name}</h3>
                                            <span className={`flex items-center gap-1.5 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full border ${st.color}`}>
                                                {st.icon} {st.label}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">{c.platform} · Budget: {c.budget}</p>
                                        {/* Progress bar */}
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${c.progress}%` }} />
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1.5">{c.progress}% budget utilized</p>
                                        {/* AI insight badge */}
                                        {c.insight && (
                                            <div className="flex items-start gap-2 mt-4 p-3 bg-primary/5 border border-primary/10 rounded-2xl">
                                                <Brain size={12} className="text-primary shrink-0 mt-0.5" />
                                                <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">{c.insight}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-6 shrink-0">
                                        <div className="text-center">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Reach</p>
                                            <p className="text-lg font-black italic text-white">{c.reach}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Engagement</p>
                                            <p className="text-lg font-black italic text-emerald-400">{c.engagement}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Spent</p>
                                            <p className="text-lg font-black italic text-white">{c.spent}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
