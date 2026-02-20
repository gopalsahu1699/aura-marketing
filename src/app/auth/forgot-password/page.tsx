"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase-client';
import { Sparkles, Mail, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const supabase = createBrowserClient();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) throw error;
            setMessage('Password reset link sent to your email.');
        } catch (err: any) {
            setError(err.message || 'Failed to send reset link');
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
                <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">Recover Core</h1>
                <p className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Initiate Reset Protocol</p>
            </div>

            {message ? (
                <div className="space-y-6 text-center">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-emerald-500 text-sm font-bold">
                        {message}
                    </div>
                    <Link
                        href="/auth/login"
                        className="flex items-center justify-center gap-2 text-primary font-black uppercase tracking-widest hover:underline text-xs"
                    >
                        <ArrowLeft size={14} /> Return to Login
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleReset} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                            <Mail size={12} /> Registered Email
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
                                Send Reset Link <ArrowRight size={18} />
                            </>
                        )}
                    </button>

                    <div className="text-center">
                        <Link
                            href="/auth/login"
                            className="text-slate-500 text-[11px] font-medium hover:text-primary transition-colors"
                        >
                            Back to Login
                        </Link>
                    </div>
                </form>
            )}
        </div>
    );
}
