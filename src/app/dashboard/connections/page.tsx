'use client';

import React, { useState } from 'react';
import {
    Globe, Instagram, Facebook, Linkedin, Youtube,
    Link as LinkIcon, CheckCircle2, Clock, ShieldCheck,
    ArrowRight, Loader2, Plus, AlertCircle,
    Zap, Sparkles, Smartphone, Share2,
    Lock, RefreshCw, ChevronRight, Activity
} from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase-client';

const iconMap: Record<string, React.ReactNode> = {
    Instagram: <Instagram size={24} />,
    Facebook: <Facebook size={24} />,
    Linkedin: <Linkedin size={24} />,
    Youtube: <Youtube size={24} />
};

interface Platform {
    id: string;
    name: string;
    icon: React.ReactNode;
    color: string;
    status: 'connected' | 'disconnected' | 'pending';
    handle?: string;
    lastSynced?: string;
    description: string;
}

export default function ConnectionsPage() {
    const mockPlatforms: Platform[] = [
        {
            id: 'insta',
            name: 'Instagram Business',
            icon: <Instagram size={24} />,
            color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600',
            status: 'connected',
            handle: '@auramarketing_official',
            lastSynced: '5 mins ago',
            description: 'Direct publishing & reel analytics integration.'
        },
        {
            id: 'fb',
            name: 'Facebook Ads',
            icon: <Facebook size={24} />,
            color: 'bg-[#1877F2]',
            status: 'connected',
            handle: 'Aura Marketing Page',
            lastSynced: '1h ago',
            description: 'Enterprise ad manager & lead sync.'
        },
        {
            id: 'li',
            name: 'LinkedIn Company',
            icon: <Linkedin size={24} />,
            color: 'bg-[#0A66C2]',
            status: 'disconnected',
            description: 'Professional networking & B2B reach.'
        },
        {
            id: 'yt',
            name: 'YouTube Enterprise',
            icon: <Youtube size={24} />,
            color: 'bg-[#FF0000]',
            status: 'pending',
            description: 'Video delivery & channel growth engine.'
        },
    ];

    const [platforms, setPlatforms] = useState<Platform[]>(mockPlatforms);
    const [isConnecting, setIsConnecting] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [sdkTooltip, setSdkTooltip] = useState(false);
    const supabase = createBrowserClient();

    const handleRefresh = () => {
        setIsRefreshing(true);
        setPlatforms(prev => prev.map(p => p.status === 'connected' ? { ...p, lastSynced: 'Syncing...' } : p));
        setTimeout(() => {
            setPlatforms(prev => prev.map(p => p.status === 'connected' ? { ...p, lastSynced: 'Just now' } : p));
            setIsRefreshing(false);
        }, 2000);
    };

    React.useEffect(() => {
        const fetchPlatforms = async () => {
            try {
                const { data, error } = await supabase.from('connections_platforms').select('*').order('id');
                if (error) throw error;
                if (data && data.length > 0) {
                    setPlatforms(data.map((row: any) => ({
                        id: row.platform_id,
                        name: row.name,
                        icon: iconMap[row.icon_name] || <LinkIcon size={24} />,
                        color: row.color,
                        status: row.status,
                        handle: row.handle,
                        lastSynced: row.last_synced,
                        description: row.description
                    })));
                }
            } catch (err) {
                console.warn('Supabase fetch failed, falling back to mock data', err);
            }
        };
        fetchPlatforms();
    }, []);

    const handleConnect = (id: string) => {
        setIsConnecting(id);
        setTimeout(() => {
            setPlatforms(prev => prev.map(p =>
                p.id === id ? { ...p, status: 'connected', handle: 'Verified Account', lastSynced: 'Just now' } : p
            ));
            setIsConnecting(null);
        }, 2000);
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
            {/* Header */}
            <header className="h-16 lg:h-20 border-b border-primary/10 flex items-center justify-between px-4 md:px-8 bg-background/50 backdrop-blur-md shrink-0 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Share2 size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-2xl font-black uppercase italic tracking-tight text-white leading-none">Connections Hub</h2>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-2 hidden sm:block">Neural Ecosystem Integration</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 py-2 px-5 rounded-2xl flex items-center gap-2">
                        <Lock size={14} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Secure OAuth 2.0</span>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className={`p-3 bg-primary/5 border border-primary/10 rounded-xl text-slate-400 hover:text-primary transition-all ${isRefreshing ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 no-scrollbar">
                <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">

                    {/* Hero Section */}
                    <section className="bg-slate-900 rounded-2xl md:rounded-[3rem] p-6 sm:p-8 md:p-12 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(140,43,238,0.3),transparent_70%)] opacity-50"></div>
                        <Globe className="absolute -right-20 -bottom-20 w-96 h-96 text-white/[0.03] group-hover:rotate-12 transition-transform duration-1000" />

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
                                    <Zap size={14} className="fill-primary" />
                                    Omnichannel Intelligence
                                </div>
                                <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black uppercase italic tracking-tighter leading-[0.9]">Architect Your Digital Flow</h1>
                                <p className="text-slate-400 text-sm sm:text-lg font-medium leading-relaxed">
                                    Forge direct links between Aura's neural engine and your business platforms. Real-time data ingestion enables autonomous optimization.
                                </p>
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <button
                                        onClick={() => document.getElementById('platforms-grid')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="px-5 sm:px-8 py-3 sm:py-4 bg-primary text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl sm:rounded-2xl shadow-2xl shadow-primary/30 hover:brightness-110 active:scale-95 transition-all"
                                    >
                                        Integrate New Core
                                    </button>
                                    <div className="relative">
                                        <button
                                            onClick={() => { setSdkTooltip(true); setTimeout(() => setSdkTooltip(false), 3000); }}
                                            className="px-5 sm:px-8 py-3 sm:py-4 bg-white/5 border border-white/10 text-white text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl sm:rounded-2xl hover:bg-white/10 transition-all"
                                        >
                                            Developer SDK
                                        </button>
                                        {sdkTooltip && (
                                            <div className="absolute top-full mt-2 left-0 px-4 py-2 bg-slate-800 border border-primary/20 rounded-xl text-[10px] font-bold text-primary whitespace-nowrap shadow-xl z-10">
                                                SDK v2.0 coming soon — API docs available
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="hidden lg:grid grid-cols-2 gap-4 relative">
                                {[Instagram, Facebook, Linkedin, Youtube].map((Icon, i) => (
                                    <div key={i} className={`p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm flex items-center justify-center hover:bg-primary/20 transition-all cursor-pointer ${i % 2 !== 0 ? 'translate-y-8' : ''}`}>
                                        <Icon size={40} className="text-white/40" />
                                    </div>
                                ))}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent pointer-events-none"></div>
                            </div>
                        </div>
                    </section>

                    {/* Platforms Grid */}
                    <section className="space-y-8">
                        <div id="platforms-grid" className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary"><Activity size={20} /></div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight">Active Interfaces</h3>
                            </div>
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity size={12} className="text-emerald-500" />
                                Status: Operational
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {platforms.map((platform) => (
                                <div key={platform.id} className="bg-primary/5 rounded-[2.5rem] border border-primary/10 p-10 flex flex-col gap-10 group hover:border-primary/30 transition-all shadow-sm relative overflow-hidden">
                                    <div className="flex justify-between items-start relative z-10">
                                        <div className={`w-16 h-16 ${platform.color} rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform`}>
                                            {platform.icon}
                                        </div>
                                        <div className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${platform.status === 'connected' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                            platform.status === 'pending' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                            }`}>
                                            {platform.status}
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <h3 className="text-2xl font-black uppercase italic tracking-tight text-white mb-2">{platform.name}</h3>
                                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">{platform.description}</p>
                                        {platform.handle && (
                                            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/10">
                                                <Smartphone size={12} className="text-primary" />
                                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{platform.handle}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-8 border-t border-primary/10 mt-auto flex items-center justify-between relative z-10">
                                        {platform.lastSynced ? (
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-emerald-500/10 rounded-full text-emerald-500">
                                                    <CheckCircle2 size={12} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Last Synced</span>
                                                    <span className="text-[10px] font-black italic text-white">{platform.lastSynced}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-orange-500/10 rounded-full text-orange-500">
                                                    <AlertCircle size={12} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                                                    <span className="text-[10px] font-black italic text-orange-500">Incomplete DNA</span>
                                                </div>
                                            </div>
                                        )}

                                        {platform.status !== 'connected' ? (
                                            <button
                                                onClick={() => handleConnect(platform.id)}
                                                disabled={isConnecting === platform.id}
                                                className="bg-primary text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                                            >
                                                {isConnecting === platform.id ? <Loader2 size={14} className="animate-spin" /> : <LinkIcon size={14} />}
                                                Initialize
                                            </button>
                                        ) : (
                                            <button className="p-3 bg-slate-50 dark:bg-white/5 border border-primary/5 rounded-2xl text-slate-400 hover:text-red-500 transition-all group/btn">
                                                <ChevronRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Decorative subtle gradient for cards */}
                                    <div className="absolute -right-20 -bottom-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Spacing */}
                <div className="h-20"></div>
            </div>

            {/* Quick Stats Footer */}
            <div className="h-12 border-t border-primary/10 bg-white/50 dark:bg-primary/5 backdrop-blur-md flex items-center justify-center px-8">
                <div className="flex items-center gap-12 overflow-hidden whitespace-nowrap">
                    {[
                        { label: "Uptime", val: "99.98%" },
                        { label: "Latency", val: "12ms" },
                        { label: "Data Flow", val: "2.4 GB/s" },
                        { label: "Neural Sync", val: "Verified" }
                    ].map((s, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</span>
                            <span className="text-[10px] font-black italic text-primary">{s.val}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
