'use client';

import React, { useState } from 'react';
import {
    Megaphone, Plus, Search, BarChart3, Target,
    Calendar, Eye, TrendingUp, Sparkles, CheckCircle2,
    Clock, PlayCircle, PauseCircle, Loader2, Zap, Globe
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const MOCK_CAMPAIGNS = [
    {
        id: 1, name: "Summer Launch 2024", status: "active", platform: "Instagram",
        budget: "$2,400", spent: "$1,284", reach: "45.2k", engagement: "6.8%", progress: 54
    },
    {
        id: 2, name: "Brand Awareness Drive", status: "scheduled", platform: "Facebook",
        budget: "$1,800", spent: "$0", reach: "--", engagement: "--", progress: 0
    },
    {
        id: 3, name: "Product Launch Q4", status: "paused", platform: "LinkedIn",
        budget: "$3,200", spent: "$2,900", reach: "12.1k", engagement: "4.2%", progress: 90
    },
    {
        id: 4, name: "Holiday Special Campaign", status: "completed", platform: "All",
        budget: "$5,000", spent: "$4,978", reach: "112k", engagement: "8.1%", progress: 100
    },
];

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    active: { label: "Active", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: <PlayCircle size={12} /> },
    scheduled: { label: "Scheduled", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: <Clock size={12} /> },
    paused: { label: "Paused", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: <PauseCircle size={12} /> },
    completed: { label: "Completed", color: "bg-slate-500/10 text-slate-400 border-slate-500/20", icon: <CheckCircle2 size={12} /> },
};

export default function CampaignsPage() {
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const router = useRouter();

    const filtered = MOCK_CAMPAIGNS.filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const matchFilter = activeFilter === 'all' || c.status === activeFilter;
        return matchSearch && matchFilter;
    });

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
                    onClick={() => document.getElementById('campaigns-list')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                >
                    <Plus size={16} /> New Campaign
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 no-scrollbar">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "Total Campaigns", value: "4", icon: <Megaphone size={20} />, color: "text-primary" },
                        { label: "Active Now", value: "1", icon: <PlayCircle size={20} />, color: "text-emerald-400" },
                        { label: "Total Reach", value: "169.3k", icon: <Eye size={20} />, color: "text-blue-400" },
                        { label: "Avg Engagement", value: "6.4%", icon: <TrendingUp size={20} />, color: "text-amber-400" },
                    ].map((s, i) => (
                        <div key={i} className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 group hover:border-primary/30 transition-all">
                            <div className={`mb-3 ${s.color}`}>{s.icon}</div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
                            <h3 className="text-2xl font-black italic tracking-tighter text-white">{s.value}</h3>
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
                <div className="space-y-4">
                    {filtered.length === 0 ? (
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
