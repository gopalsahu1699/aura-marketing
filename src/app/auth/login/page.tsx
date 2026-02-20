"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase-client';
import { LogIn, Sparkles, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createBrowserClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to login');
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-primary/20 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/40 mb-6">
                    <Sparkles size={32} />
                </div>
                <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">Welcome Back</h1>
                <p className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Neural Engine Login</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                        <Mail size={12} /> Email Address
                    </label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-primary/10 rounded-2xl p-4 text-sm font-medium text-white focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-600"
                        placeholder="name@company.com"
                    />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Lock size={12} /> Password
                        </label>
                        <Link
                            href="/auth/forgot-password"
                            className="text-[10px] font-bold text-primary/60 hover:text-primary uppercase tracking-wider transition-colors"
                        >
                            Forgot?
                        </Link>
                    </div>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-primary/10 rounded-2xl p-4 text-sm font-medium text-white focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-600"
                        placeholder="••••••••"
                    />
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-[11px] font-bold text-center">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-primary hover:brightness-110 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/30 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            Login to Aura <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-10 text-center">
                <p className="text-slate-500 text-[11px] font-medium">
                    Don't have an account?{' '}
                    <Link href="/auth/register" className="text-primary font-black uppercase tracking-widest hover:underline">
                        Register Engine
                    </Link>
                </p>
            </div>
        </div>
    );
}
