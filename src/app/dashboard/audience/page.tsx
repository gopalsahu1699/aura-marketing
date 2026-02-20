'use client';

import React, { useState } from 'react';
import {
    Users, UserPlus, UserMinus, Zap,
    Download, Calendar, Globe, Target,
    TrendingUp, ArrowRight, Instagram,
    Facebook, Twitter, Info, BarChart3,
    Sparkles
} from 'lucide-react';

export default function AudienceInsightsPage() {
    const [activePlatform, setActivePlatform] = useState('All');
    const [dateRange, setDateRange] = useState('Oct 2023 - Current');
    const [showExportSuccess, setShowExportSuccess] = useState(false);
    const dateOptions = ['Oct 2023 - Current', 'Last 30 Days', 'Last 90 Days', 'This Year'];

    const handleExport = () => {
        setShowExportSuccess(true);
        setTimeout(() => setShowExportSuccess(false), 2500);
    };
    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
            {/* Header */}
            <header className="h-16 lg:h-20 border-b border-primary/10 flex items-center justify-between px-4 md:px-8 bg-background/50 backdrop-blur-md sticky top-0 z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                        <Users size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-2xl font-black uppercase italic tracking-tighter text-white leading-none">Audience Insights</h2>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-2 hidden sm:block">Behavioral Intelligence Engine</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <button
                        onClick={() => {
                            const idx = dateOptions.indexOf(dateRange);
                            setDateRange(dateOptions[(idx + 1) % dateOptions.length]);
                        }}
                        className="flex items-center bg-primary/10 border border-primary/20 rounded-xl px-4 py-2 cursor-pointer transition-all hover:border-primary/40"
                    >
                        <Calendar size={14} className="text-primary mr-2" />
                        <span className="text-xs font-bold uppercase tracking-wider">{dateRange}</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                    >
                        <Download size={14} />
                        {showExportSuccess ? '✓ Exported!' : 'Export'}
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 no-scrollbar">
                {/* Summary Stats */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: "Total Audience", value: "85,420", change: "+2.4%", icon: <Users size={20} />, color: "primary" },
                        { label: "New Followers", value: "+1,248", change: "+5.1%", icon: <UserPlus size={20} />, color: "primary" },
                        { label: "Churn Rate", value: "0.82%", change: "-0.2%", icon: <UserMinus size={20} />, color: "primary" },
                        { label: "Active Users", value: "12,504", change: "+1.8%", icon: <Zap size={20} />, color: "primary" },
                    ].map((stat, i) => (
                        <div key={i} className="bg-primary/5 border border-primary/10 p-6 rounded-[2rem] shadow-sm hover:border-primary/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-primary/10 transition-colors" />
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                    {stat.icon}
                                </div>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-full ${stat.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                    {stat.change}
                                </span>
                            </div>
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                                <h3 className="text-3xl font-black italic tracking-tighter text-white">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Main Growth Chart */}
                <section className="bg-primary/5 border border-primary/10 rounded-2xl md:rounded-[2.5rem] p-4 sm:p-6 md:p-10 flex flex-col shadow-sm">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                        <div>
                            <h3 className="text-xl font-black uppercase italic tracking-tight mb-1">Growth Dynamics</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cross-Channel Audience Velocity</p>
                        </div>
                        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-primary/5">
                            {['All', 'IG', 'FB', 'LI'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setActivePlatform(p)}
                                    className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activePlatform === p ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-64 w-full relative group flex items-end justify-between gap-3 px-2">
                        {[40, 55, 45, 65, 80, 70, 85].map((h, i) => (
                            <div key={i} className="flex-1 bg-white/5 rounded-2xl h-[100%] relative overflow-hidden group/bar border border-primary/5 hover:border-primary/20 transition-all">
                                <div
                                    style={{ height: `${h}%` }}
                                    className={`absolute inset-x-0 bottom-0 ${i === 4 ? 'bg-gradient-to-t from-primary to-purple-500' : 'bg-primary/10'} rounded-2xl transition-all duration-700 group-hover/bar:brightness-125 shadow-[0_0_20px_rgba(140,43,238,0.2)]`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover/bar:translate-x-full transition-transform duration-1000"></div>
                                </div>
                                {i === 4 && <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-white text-primary text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-[0.2em] shadow-xl">Peak Day</div>}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between mt-8 px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
                    </div>
                </section>

                {/* Demographics & Interests Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
                    {/* Demographics */}
                    <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm group hover:border-primary/20 transition-all">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Geographics</h3>
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Globe size={16} />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="relative h-40 rounded-3xl bg-slate-900 overflow-hidden group/map border border-primary/10">
                                <img
                                    src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop"
                                    className="w-full h-full object-cover opacity-20 group-hover/map:scale-110 transition-transform duration-1000 grayscale sepia brightness-50 contrast-125"
                                    alt="World Map"
                                />
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent"></div>
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-900 to-transparent"></div>
                                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary animate-pulse" size={24} />
                            </div>
                            <div className="space-y-5">
                                {[
                                    { country: "United States", val: 42 },
                                    { country: "United Kingdom", val: 28 },
                                    { country: "Germany", val: 15 }
                                ].map(c => (
                                    <div key={c.country} className="group/item">
                                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 group-hover/item:text-slate-300 transition-colors">
                                            <span>{c.country}</span>
                                            <span className="text-primary">{c.val}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-primary/5">
                                            <div className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(140,43,238,0.3)]" style={{ width: `${c.val}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Interests AI */}
                    <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
                        <Sparkles className="absolute -right-10 -top-10 w-48 h-48 text-white/5" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-8">
                                <h3 className="text-sm font-black uppercase tracking-[0.2em]">Interest Hub</h3>
                                <span className="bg-white/20 text-[9px] font-black px-2 py-0.5 rounded uppercase backdrop-blur-md">AI Analyzed</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-10">
                                {['Generative AI', 'SaaS Tech', 'Sustainability', 'UX Design', 'Digital Art', 'Remote Work'].map(tag => (
                                    <div key={tag} className="bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-default">
                                        {tag}
                                    </div>
                                ))}
                            </div>
                            <div className="p-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl">
                                <p className="text-xs font-medium leading-relaxed italic opacity-90">
                                    "AI identifies a 15% increase in affinity for #GreenTech among your newest followers this week."
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Platforms */}
                    <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 shadow-sm group hover:border-primary/20 transition-all">
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-white">Platforms</h3>
                        <div className="space-y-6">
                            {[
                                { name: "Instagram", val: 75, count: "45k", icon: <Instagram size={18} /> },
                                { name: "Facebook", val: 55, count: "28k", icon: <Facebook size={18} /> },
                                { name: "Twitter", val: 35, count: "12k", icon: <Twitter size={18} /> }
                            ].map(p => (
                                <div key={p.name} className="flex items-center gap-4 group/item">
                                    <div className="p-2.5 rounded-2xl bg-primary/10 text-primary group-hover/item:bg-primary group-hover/item:text-white transition-all">
                                        {p.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-[11px] font-black text-white uppercase tracking-widest group-hover/item:text-primary transition-colors">{p.name}</span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{p.count}</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-primary/5">
                                            <div className="h-full bg-gradient-to-r from-primary/50 to-primary rounded-full transition-all duration-1000" style={{ width: `${p.val}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* AI Targeting Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><Target size={20} /></div>
                        <h3 className="text-xl font-black uppercase italic tracking-tight">AI Smart Targeting</h3>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                        {[
                            { title: "Retarget London Tech", desc: "High engagement detected. Start video sequence.", btn: "Launch Campaign" },
                            { title: "FB Churn Recovery", desc: "Churn up 0.5%. AI recommends a carousel.", btn: "Create Content" }
                        ].map((card, i) => (
                            <div key={i} className="bg-gradient-to-br from-white dark:from-primary/10 to-transparent border border-primary/20 p-8 rounded-[2.5rem] flex items-start gap-6 group hover:translate-y-[-4px] transition-all">
                                <div className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                                    <Zap size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-black uppercase italic tracking-tight mb-2">{card.title}</h4>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed mb-6">{card.desc}</p>
                                    <button className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] group">
                                        {card.btn} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
            {/* Spacing */}
            <div className="h-10 shrink-0"></div>
        </div>
    );
}
