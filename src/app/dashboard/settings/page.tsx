'use client';

import React, { useState } from 'react';
import {
    Palette, User, Users, Shield,
    Save, X, Upload, Image as LucideImage,
    Layers, Plus, Brain, Sparkles,
    Check, MessageSquare, Target, Type,
    Smartphone, Briefcase, Smile, Zap,
    ArrowRight, AlertCircle
} from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase-client';

export default function SettingsBrandKitPage() {
    const supabase = createBrowserClient();
    const [activeTab, setActiveTab] = useState('Brand Kit');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    // Unified Brand Settings State
    const [brandSettings, setBrandSettings] = useState({
        brand_name: 'Aura Marketing',
        business_email: 'hello@auramarketing.io',
        industry: 'Marketing & Advertising',
        timezone: 'Asia/Kolkata',
        description: '',
        primary_logo: '',
        secondary_mark: '',
        palette: { primary: "#8C2BEE", secondary: "#0F0814", accent: "#AD92C9", surface: "#362348" },
        ai_persona: 'Professional',
        voice_directives: '',
        target_audience: 'Digital Creators',
        brand_font: 'Inter Display'
    });

    // Unified Preferences State
    const [prefs, setPrefs] = useState({
        email_notifications: true,
        push_notifications: true,
        weekly_digest: false,
        ai_suggestions: true
    });

    React.useEffect(() => {
        const fetchSettings = async () => {
            const { data: brandData } = await supabase.from('brand_settings').select('*').single();
            if (brandData) setBrandSettings(brandData);

            const { data: prefData } = await supabase.from('user_preferences').select('*').single();
            if (prefData) setPrefs(prefData);
        };
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaveStatus('saving');
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("You must be logged in to save settings.");
                setSaveStatus('error');
                return;
            }

            // Upsert Brand Settings
            const { error: brandError } = await supabase.from('brand_settings').upsert({
                ...brandSettings,
                user_id: user.id,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

            if (brandError) throw brandError;

            // Upsert Preferences
            const { error: prefError } = await supabase.from('user_preferences').upsert({
                ...prefs,
                user_id: user.id,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });

            if (prefError) throw prefError;

            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 2000);
        } catch (error) {
            console.error('Save failed', error);
            setSaveStatus('error');
            setTimeout(() => setSaveStatus('idle'), 3000);
        }
    };

    const handleDiscard = () => {
        window.location.reload();
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
            {/* Header */}
            <header className="h-16 lg:h-20 border-b border-primary/10 flex items-center justify-between px-4 md:px-8 bg-background/50 backdrop-blur-md shrink-0 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Palette size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-2xl font-black uppercase italic tracking-tight text-white leading-none">Identity Studio</h2>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-2 hidden sm:block">Brand Kit & Governance</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    {saveStatus === 'saved' && (
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-[10px] font-black uppercase tracking-widest">
                            <Check size={14} />
                            <span>Saved!</span>
                        </div>
                    )}
                    {saveStatus === 'error' && (
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-[10px] font-black uppercase tracking-widest">
                            <AlertCircle size={14} />
                            <span>Failed</span>
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saveStatus === 'saving'}
                        className="px-4 sm:px-8 py-2.5 bg-primary hover:brightness-110 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                    >
                        {saveStatus === 'saving' ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={14} />
                        )}
                        <span className="hidden sm:inline">{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved!' : 'Save Evolution'}</span>
                        <span className="sm:hidden">{saveStatus === 'saving' ? '...' : saveStatus === 'saved' ? '✓' : 'Save'}</span>
                    </button>
                </div>
            </header>

            {/* Tabs Navigation */}
            <div className="bg-background/30 px-4 md:px-8 shrink-0 border-b border-primary/5 overflow-x-auto no-scrollbar">
                <div className="flex gap-4 md:gap-8 min-w-max">
                    {['Brand Kit', 'General Settings', 'Team & Access'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-2 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-4px_10px_rgba(140,43,238,0.4)]"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 no-scrollbar">
                <div className="max-w-6xl mx-auto space-y-8 md:space-y-12">

                    {/* ========== GENERAL SETTINGS TAB ========== */}
                    {activeTab === 'General Settings' && (
                        <div className="space-y-12">
                            <section className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><User size={20} /></div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tight">Business Profile</h3>
                                </div>
                                <div className="bg-primary/5 border border-primary/10 rounded-2xl md:rounded-[2.5rem] p-5 sm:p-8 md:p-10 shadow-sm space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-white">Brand Name</label>
                                            <input
                                                type="text"
                                                value={brandSettings.brand_name}
                                                onChange={(e) => setBrandSettings({ ...brandSettings, brand_name: e.target.value })}
                                                className="w-full bg-white/5 border border-primary/10 rounded-2xl p-4 text-sm font-medium text-slate-200 focus:ring-primary focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-white">Business Email</label>
                                            <input
                                                type="email"
                                                value={brandSettings.business_email}
                                                onChange={(e) => setBrandSettings({ ...brandSettings, business_email: e.target.value })}
                                                className="w-full bg-white/5 border border-primary/10 rounded-2xl p-4 text-sm font-medium text-slate-200 focus:ring-primary focus:border-primary outline-none"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-white">Industry</label>
                                            <select
                                                value={brandSettings.industry}
                                                onChange={(e) => setBrandSettings({ ...brandSettings, industry: e.target.value })}
                                                className="w-full bg-white/5 border border-primary/10 rounded-2xl p-4 text-sm font-bold text-slate-300 focus:ring-primary outline-none appearance-none"
                                            >
                                                <option>Marketing & Advertising</option>
                                                <option>Technology</option>
                                                <option>E-Commerce</option>
                                                <option>Healthcare</option>
                                                <option>Finance</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-white">Timezone</label>
                                            <select
                                                value={brandSettings.timezone}
                                                onChange={(e) => setBrandSettings({ ...brandSettings, timezone: e.target.value })}
                                                className="w-full bg-white/5 border border-primary/10 rounded-2xl p-4 text-sm font-bold text-slate-300 focus:ring-primary outline-none appearance-none"
                                            >
                                                <option>Asia/Kolkata</option>
                                                <option>America/New_York</option>
                                                <option>Europe/London</option>
                                                <option>Asia/Tokyo</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black uppercase tracking-widest text-white">Business Description</label>
                                        <textarea
                                            value={brandSettings.description || ''}
                                            onChange={(e) => setBrandSettings({ ...brandSettings, description: e.target.value })}
                                            className="w-full bg-white/5 border border-primary/10 rounded-2xl p-4 text-sm font-medium text-slate-200 focus:ring-primary focus:border-primary outline-none h-28 resize-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><Shield size={20} /></div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tight">Notifications & Preferences</h3>
                                </div>
                                <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-10 shadow-sm space-y-6">
                                    {[
                                        { key: 'email_notifications', label: "Email Notifications", desc: "Receive campaign performance reports via email" },
                                        { key: 'push_notifications', label: "Push Notifications", desc: "Get real-time alerts for high-priority events" },
                                        { key: 'weekly_digest', label: "Weekly Digest", desc: "Automated weekly summary of all platform activity" },
                                        { key: 'ai_suggestions', label: "AI Suggestions", desc: "Receive AI-generated optimization recommendations" },
                                    ].map((pref) => (
                                        <div key={pref.label} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-primary/5 hover:border-primary/20 transition-all">
                                            <div>
                                                <p className="text-sm font-bold text-white">{pref.label}</p>
                                                <p className="text-[11px] text-slate-400 mt-1">{pref.desc}</p>
                                            </div>
                                            <div
                                                onClick={() => setPrefs(p => ({ ...p, [pref.key]: !p[pref.key as keyof typeof p] }))}
                                                className={`w-12 h-7 rounded-full flex items-center px-1 cursor-pointer transition-colors ${prefs[pref.key as keyof typeof prefs] ? 'bg-primary justify-end' : 'bg-white/10 justify-start'}`}
                                            >
                                                <div className="w-5 h-5 bg-white rounded-full shadow-md" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}

                    {/* ========== TEAM & ACCESS TAB ========== */}
                    {activeTab === 'Team & Access' && (
                        <div className="space-y-12">
                            <section className="space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><Users size={20} /></div>
                                        <h3 className="text-xl font-black uppercase italic tracking-tight">Team Members</h3>
                                    </div>
                                    <button className="px-6 py-3 bg-primary hover:brightness-110 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center gap-2">
                                        <Plus size={14} />
                                        Invite Member
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { name: "Gopal Kumar", email: "gopal@auramarketing.io", role: "Owner", avatar: "GK", color: "bg-primary" },
                                        { name: "Marketing Bot", email: "bot@auramarketing.io", role: "Admin", avatar: "MB", color: "bg-emerald-500" },
                                        { name: "Content Team", email: "content@auramarketing.io", role: "Editor", avatar: "CT", color: "bg-indigo-500" },
                                    ].map((member) => (
                                        <div key={member.email} className="flex items-center justify-between p-6 bg-primary/5 border border-primary/10 rounded-[2rem] hover:border-primary/30 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 ${member.color} rounded-2xl flex items-center justify-center text-white text-sm font-black shadow-lg`}>
                                                    {member.avatar}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white">{member.name}</p>
                                                    <p className="text-[11px] text-slate-400">{member.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full ${member.role === 'Owner' ? 'bg-primary/20 text-primary' :
                                                    member.role === 'Admin' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        'bg-indigo-500/20 text-indigo-400'
                                                    }`}>{member.role}</span>
                                                <button className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><Shield size={20} /></div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tight">Role Permissions</h3>
                                </div>
                                <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-10 shadow-sm">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-primary/10">
                                                    <th className="text-left text-[10px] font-black uppercase tracking-widest text-slate-400 pb-4">Permission</th>
                                                    <th className="text-center text-[10px] font-black uppercase tracking-widest text-primary pb-4">Owner</th>
                                                    <th className="text-center text-[10px] font-black uppercase tracking-widest text-emerald-400 pb-4">Admin</th>
                                                    <th className="text-center text-[10px] font-black uppercase tracking-widest text-indigo-400 pb-4">Editor</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-primary/5">
                                                {[
                                                    { perm: "Manage Billing", owner: true, admin: false, editor: false },
                                                    { perm: "Invite Members", owner: true, admin: true, editor: false },
                                                    { perm: "Create Campaigns", owner: true, admin: true, editor: true },
                                                    { perm: "Publish Content", owner: true, admin: true, editor: true },
                                                    { perm: "View Analytics", owner: true, admin: true, editor: true },
                                                    { perm: "Edit Brand Kit", owner: true, admin: true, editor: false },
                                                    { perm: "Delete Data", owner: true, admin: false, editor: false },
                                                ].map((row) => (
                                                    <tr key={row.perm}>
                                                        <td className="py-4 text-xs font-medium text-slate-300">{row.perm}</td>
                                                        <td className="py-4 text-center">{row.owner ? <Check size={16} className="text-primary mx-auto" /> : <X size={16} className="text-slate-600 mx-auto" />}</td>
                                                        <td className="py-4 text-center">{row.admin ? <Check size={16} className="text-emerald-400 mx-auto" /> : <X size={16} className="text-slate-600 mx-auto" />}</td>
                                                        <td className="py-4 text-center">{row.editor ? <Check size={16} className="text-indigo-400 mx-auto" /> : <X size={16} className="text-slate-600 mx-auto" />}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* ========== BRAND KIT TAB ========== */}
                    {activeTab === 'Brand Kit' && (
                        <>
                            <section className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><Layers size={20} /></div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tight">Visonary Assets</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Logo Uploads */}
                                    <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-10 shadow-sm group hover:border-primary/30 transition-all">
                                        <label className="block space-y-6 cursor-pointer">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[11px] font-black uppercase tracking-widest text-white">Primary Logo</span>
                                                <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5"><Upload size={14} /></div>
                                            </div>
                                            <div className="relative border-2 border-dashed border-primary/10 group-hover:border-primary/40 bg-slate-50 dark:bg-white/5 rounded-[2rem] p-12 flex flex-col items-center justify-center transition-all">
                                                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-6 group-hover:scale-110 transition-transform">
                                                    <LucideImage size={32} className="text-slate-300" />
                                                </div>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Drop evolution here</p>
                                                <p className="text-[10px] text-slate-400 mt-2">SVG | PNG | MAX 10MB</p>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-10 shadow-sm group hover:border-primary/30 transition-all">
                                        <label className="block space-y-6 cursor-pointer">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[11px] font-black uppercase tracking-widest text-white">Secondary Mark</span>
                                                <div className="p-2 rounded-xl bg-slate-100 dark:bg-white/5"><Upload size={14} /></div>
                                            </div>
                                            <div className="relative border-2 border-dashed border-primary/10 group-hover:border-primary/40 bg-slate-50 dark:bg-white/5 rounded-[2rem] p-12 flex flex-col items-center justify-center transition-all">
                                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 mb-6 group-hover:rotate-12 transition-transform">
                                                    <Sparkles size={32} className="text-primary" />
                                                </div>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Favicon / Icon variant</p>
                                                <p className="text-[10px] text-slate-400 mt-2">Best for small scale apps</p>
                                            </div>
                                        </label>
                                    </div>

                                    {/* Brand Colors */}
                                    <div className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-10 shadow-sm md:col-span-2 space-y-8">
                                        <div className="flex justify-between items-center">
                                            <h4 className="text-[11px] font-black uppercase tracking-widest text-white">Aura Core Palette</h4>
                                            <button className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                                                <Plus size={14} />
                                                Expand Spectrum
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
                                            {[
                                                { label: "Primary", hex: "#8C2BEE", color: "bg-primary" },
                                                { label: "Secondary", hex: "#0F0814", color: "bg-slate-900" },
                                                { label: "Accent", hex: "#AD92C9", color: "bg-[#AD92C9]" },
                                                { label: "Surface", hex: "#362348", color: "bg-[#362348]" },
                                            ].map((c) => (
                                                <div key={c.label} className="group">
                                                    <div className={`h-20 w-full rounded-2xl ${c.color} border border-white/10 shadow-2xl mb-4 relative overflow-hidden`}>
                                                        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-black/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <span className="text-[9px] font-black text-white">SELECT</span>
                                                        </div>
                                                    </div>
                                                    <input
                                                        className="w-full bg-white/5 border border-primary/10 text-[10px] font-black text-slate-300 text-center py-2.5 rounded-xl focus:ring-1 focus:ring-primary focus:border-primary outline-none uppercase tracking-widest transition-all hover:bg-white/10"
                                                        type="text"
                                                        defaultValue={c.hex}
                                                    />
                                                    <p className="text-[9px] text-center text-slate-500 uppercase font-black tracking-widest mt-2">{c.label}</p>
                                                </div>
                                            ))}
                                            <div className="flex flex-col">
                                                <div className="h-20 w-full rounded-2xl border-2 border-dashed border-primary/10 flex items-center justify-center text-primary/40 hover:text-primary hover:bg-primary/5 hover:border-primary/30 cursor-pointer transition-all">
                                                    <Plus size={24} />
                                                </div>
                                                <p className="text-[9px] text-center text-slate-500 uppercase font-black tracking-widest mt-6">Add Tone</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* AI Persona Section */}
                            <section className="space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><Brain size={20} /></div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tight">Cognitive Persona</h3>
                                </div>

                                <div className="bg-primary/5 border border-primary/10 rounded-[3rem] p-10 shadow-sm space-y-10">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {[
                                            { label: "Professional", desc: "Formal, authoritative, data-driven.", icon: <Briefcase size={20} /> },
                                            { label: "Visionary", desc: "Creative, bold, provocative.", icon: <Zap size={20} /> },
                                            { label: "Empathetic", desc: "Approachable, warm, human.", icon: <Smile size={20} /> },
                                        ].map((type) => (
                                            <div
                                                key={type.label}
                                                onClick={() => setBrandSettings({ ...brandSettings, ai_persona: type.label })}
                                                className={`relative p-8 rounded-[2rem] border-2 transition-all cursor-pointer group ${brandSettings.ai_persona === type.label ? 'border-primary bg-primary/5' : 'border-primary/5 hover:border-primary/20 bg-background dark:bg-white/5'}`}
                                            >
                                                <div className="flex items-start justify-between mb-6">
                                                    <div className={`p-4 rounded-2xl ${brandSettings.ai_persona === type.label ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:text-primary transition-colors'}`}>
                                                        {type.icon}
                                                    </div>
                                                    {brandSettings.ai_persona === type.label && (
                                                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
                                                            <Check size={12} className="text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <h4 className="text-white font-black uppercase italic tracking-tight mb-2">{type.label}</h4>
                                                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{type.desc}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white">
                                                <MessageSquare size={14} className="text-primary" />
                                                Advanced Voice Directives
                                            </label>
                                            <textarea
                                                value={brandSettings.voice_directives || ''}
                                                onChange={(e) => setBrandSettings({ ...brandSettings, voice_directives: e.target.value })}
                                                className="w-full bg-white/5 border border-primary/10 rounded-[2rem] p-6 text-xs font-medium text-slate-300 focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-slate-600 outline-none transition-all h-32 hover:bg-white/10"
                                                placeholder="E.g. Always use Oxford commas. Avoid marketing jargon like 'synergy'. Be concise but authoritative..."
                                            ></textarea>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white">
                                                    <Target size={14} className="text-primary" />
                                                    Primary Target Core
                                                </label>
                                                <select
                                                    value={brandSettings.target_audience}
                                                    onChange={(e) => setBrandSettings({ ...brandSettings, target_audience: e.target.value })}
                                                    className="w-full bg-white/5 border border-primary/10 rounded-2xl p-4 text-xs font-bold text-slate-300 focus:ring-1 focus:ring-primary outline-none appearance-none hover:bg-white/10 transition-all cursor-pointer"
                                                >
                                                    <option className="bg-slate-900 text-white">C-Level Strategy</option>
                                                    <option className="bg-slate-900 text-white">Growth Hackers</option>
                                                    <option className="bg-slate-900 text-white">Digital Creators</option>
                                                    <option className="bg-slate-900 text-white">Technical Leads</option>
                                                </select>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-white">
                                                    <Type size={14} className="text-primary" />
                                                    Universal Font DNA
                                                </label>
                                                <select
                                                    value={brandSettings.brand_font}
                                                    onChange={(e) => setBrandSettings({ ...brandSettings, brand_font: e.target.value })}
                                                    className="w-full bg-white/5 border border-primary/10 rounded-2xl p-4 text-xs font-bold text-slate-300 focus:ring-1 focus:ring-primary outline-none appearance-none hover:bg-white/10 transition-all cursor-pointer"
                                                >
                                                    <option className="bg-slate-900 text-white">Inter Display</option>
                                                    <option className="bg-slate-900 text-white">Playfair Modern</option>
                                                    <option className="bg-slate-900 text-white">JetBrains Mono</option>
                                                    <option className="bg-slate-900 text-white">Montserrat Gothic</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Preview Section */}
                            <section className="bg-gradient-to-br from-primary to-purple-800 rounded-[3rem] p-12 text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
                                <Sparkles className="absolute -right-20 -top-20 w-80 h-80 text-white/5 group-hover:rotate-45 transition-transform duration-1000" />
                                <div className="relative z-10 flex flex-col xl:flex-row items-center gap-12">
                                    <div className="flex-1 space-y-6">
                                        <h3 className="text-3xl font-black italic tracking-tighter uppercase">Evolution Preview</h3>
                                        <p className="text-white/70 text-sm font-medium leading-relaxed max-w-md">
                                            Visualize how your DNA permeates generated content. Real-time mapping of colors, voice, and assets.
                                        </p>
                                        <div className="space-y-4 pt-4">
                                            {[
                                                "DNA Integrated Successfully",
                                                "Primary Spectrum Applied",
                                                "Professional Tone Verified"
                                            ].map(check => (
                                                <div key={check} className="flex items-center gap-3 bg-white/10 w-fit px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                                                    <Check size={14} className="text-emerald-400" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">{check}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] p-8 space-y-6 transform group-hover:scale-105 transition-transform duration-500">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary"></div>
                                            <div className="h-4 w-32 bg-slate-100 rounded-lg"></div>
                                        </div>
                                        <div className="h-40 w-full bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden relative">
                                            <div className="p-4 bg-primary/10 text-primary rounded-xl"><LucideImage size={32} /></div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent opacity-50"></div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="h-3 w-full bg-slate-100 rounded"></div>
                                            <div className="h-3 w-3/4 bg-slate-50 rounded"></div>
                                            <div className="h-3 w-1/2 bg-slate-50 rounded"></div>
                                        </div>
                                        <div className="pt-4 flex justify-end">
                                            <div className="px-6 py-2.5 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20">
                                                ANALYZE
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </>
                    )}

                </div>

                {/* Spacing */}
                <div className="h-20"></div>
            </div>

            {/* Mobile Save Bar */}
            <div className="p-6 border-t border-primary/10 bg-background md:hidden">
                <button className="w-full py-4 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-2xl shadow-primary/30 active:scale-95 transition-all">
                    Synchronize evolution
                </button>
            </div>
        </div>
    );
}
