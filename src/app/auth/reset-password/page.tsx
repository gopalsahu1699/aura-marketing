"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase-client';
import { Sparkles, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createBrowserClient();

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.updateUser({ password });

            if (error) throw error;
            router.push('/auth/login?message=Password updated successfully');
        } catch (err: any) {
            setError(err.message || 'Failed to update password');
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-primary/20 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/40 mb-6">
                    <Sparkles size={32} />
                </div>
                <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white mb-2">Overwrite Auth</h1>
                <p className="text-xs font-bold text-primary uppercase tracking-[0.2em]">New Password Protocol</p>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                        <Lock size={12} /> New Password
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

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                        <Lock size={12} /> Confirm Password
                    </label>
                    <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                            Update Password <ArrowRight size={18} />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
