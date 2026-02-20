"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase-client';
import { UserPlus, Sparkles, Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createBrowserClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                throw new Error('Supabase environment variables are missing');
            }

            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                if (error.message.includes('rate limit')) {
                    throw new Error('Email rate limit reached. Please try again in an hour or contact support.');
                }
                throw error;
            }
            router.push('/auth/login?message=Check your email to confirm your account');
        } catch (err: any) {
            setError(err.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-primary/20 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/40 mb-6">
                    <Sparkles size={32} />
                </div>
                <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">New Account</h1>
                <p className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Initiate Neural Genesis</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
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
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                        <Lock size={12} /> Choose Password
                    </label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-primary/10 rounded-2xl p-4 text-sm font-medium text-white focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-600"
                        placeholder="Min. 6 characters"
                    />
                </div>

                <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl flex items-start gap-3">
                    <ShieldCheck size={16} className="text-primary mt-0.5 shrink-0" />
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        By registering, you agree to Aura's autonomous data terms and privacy protocols.
                    </p>
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
                            Create Account <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>

            <div className="mt-10 text-center">
                <p className="text-slate-500 text-[11px] font-medium">
                    Already registered?{' '}
                    <Link href="/auth/login" className="text-primary font-black uppercase tracking-widest hover:underline">
                        Login to Forge
                    </Link>
                </p>
            </div>
        </div>
    );
}
