'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Star, CheckCircle2, Quote, Share2, Globe, Mail,
    Wand2, TrendingUp, MessageSquare, Calendar, LineChart, ChevronRight
} from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase-client';
import Link from 'next/link';

export default function LandingPage() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createBrowserClient();

    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setLoading(false);
        };
        getSession();
    }, [supabase]);

    return (
        <div className="dark bg-[#0a0610] text-slate-100 min-h-screen font-sans">
            {/* Top Navigation */}
            <header className="fixed top-0 w-full z-50 bg-[#0a0610]/80 backdrop-blur-md border-b border-[#8c2bee]/10 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/sparkles.svg" alt="Aura Logo" className="w-8 h-8" />
                        <span className="text-xl font-bold tracking-tight">Aura Marketing</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium transition-colors hover:text-[#8c2bee]">Features</a>
                        <a href="#how-it-works" className="text-sm font-medium transition-colors hover:text-[#8c2bee]">How it Works</a>
                        <a href="#pricing" className="text-sm font-medium transition-colors hover:text-[#8c2bee]">Pricing</a>
                        <a href="#" className="text-sm font-medium transition-colors hover:text-[#8c2bee]">Testimonials</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        {!loading && (
                            session ? (
                                <Link
                                    href="/dashboard"
                                    className="bg-[#8c2bee] text-white text-sm font-bold px-6 py-2.5 rounded-lg shadow-[0_10px_15px_-3px_rgba(140,43,238,0.2)] transition-all hover:brightness-110 hover:-translate-y-[1px]"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/auth/login"
                                        className="hidden sm:block text-sm font-bold px-4 py-2 rounded-lg transition-colors bg-transparent hover:bg-[#8c2bee]/10"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/auth/register"
                                        className="bg-[#8c2bee] text-white text-sm font-bold px-6 py-2.5 rounded-lg shadow-[0_10px_15px_-3px_rgba(140,43,238,0.2)] transition-all hover:brightness-110 hover:-translate-y-[1px]"
                                    >
                                        Start Free Trial
                                    </Link>
                                </>
                            )
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-[radial-gradient(circle_at_50%_50%,rgba(140,43,238,0.15)_0%,transparent_70%)]">
                <div className="max-w-7xl mx-auto px-6 grid gap-16 lg:grid-cols-2 lg:items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="flex flex-col gap-8"
                    >
                        <div className="inline-flex items-center gap-2 bg-[#8c2bee]/10 border border-[#8c2bee]/20 px-4 py-1.5 rounded-full w-fit">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8c2bee] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#8c2bee]"></span>
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wide text-[#8c2bee]">Next-Gen Automation</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
                            AI That Grows Your Social Media <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8c2bee] to-purple-500">Automatically</span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
                            Revolutionize your presence across Instagram, Facebook, YouTube, and Google Business with our all-in-one AI-powered marketing orchestration platform.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link href="/auth/register" className="bg-[#8c2bee] text-white font-bold px-8 py-4 rounded-xl shadow-[0_20px_25px_-5px_rgba(140,43,238,0.25)] transition-transform hover:scale-105">Start Free Trial</Link>
                            <button className="bg-slate-800/50 border border-slate-700 text-white font-bold px-8 py-4 rounded-xl transition-colors hover:bg-slate-800">Book Demo</button>
                        </div>
                        <div className="flex items-center gap-6 pt-4">
                            <div className="flex ml-3">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVg5nQt_qid74GgfhUtiM_dQ1CFXcRnn9HTnKMcK2dxR61Q_wkkuM_zq2p1Cy0hoEYPFzKP81KdHmbpuOZdJqNX9PiG2HkItysqWI_YvqlzBe1mQojOUjqP9sLDIh_g446qMTLNeOFwu4X6gkTW5LVze0SieEcpVZD3RsSSs6ZaR1_WwKBmPCb7eJrM4J1j3sYMal7gi4yghjRJuH40MVf_tTX-tVBQA67kzwT5CUOZzWXVhDSZsX11hcMAlbbO0H7AS0Ke8p0-MA" alt="User" className="w-10 h-10 rounded-full border-2 border-[#0a0610] -ml-3" />
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTGsS89Zwz6IwrPsZEHpUvtq9pkQAIz9p7IdTUWKlUAzZ235u7XbWzpMCJsyWB4hljOFDZfoqOJ3QmuMHOannkXFd9gnLJsmvNFKm1RfdlPVm6opW3-CErrFxIuZ5tQpDWGT_JMwaKQIX1n68rdQ7n6YYYJ4hvni42qiTWEnPGmxr6Q9gf3drAF3tVcqyDqjP1fOGOoeJZX-t6McZFt7UGfSE58RLpRPg_WgD4kzcfA-D2chPPXe_1vO3wRQRf_HuVPe2UZD34Y5U" alt="User" className="w-10 h-10 rounded-full border-2 border-[#0a0610] -ml-3" />
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuANbi9jBlpnlO6kDbqdEZmaPQOKfFby_KcnsYd3M54zPVNjAUeN1igwjs69rjpkwOD2bzWKoyD_MSUVsVHlLxGgKiXXKLlAqTKjGtmPchderPoOdxGwU6RRLMis9lEMByuZq4fbHk5IPUX-QcusaKoOzD3m-zpPcQatTBIZ4oruqEmHZnLYAXi4u2_RrZCTkATGfdc2lvixvxjiF84fTLvXVXa16Bh-usl34ijejDb97kiw_io-5RnsU08XU7g4rq6JfI9hpsz1ANg" alt="User" className="w-10 h-10 rounded-full border-2 border-[#0a0610] -ml-3" />
                            </div>
                            <div className="text-sm">
                                <p className="font-bold">Join 10,000+ marketers</p>
                                <div className="flex items-center text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={14} fill="currentColor" stroke="none" />
                                    ))}
                                    <span className="ml-1 text-slate-400 text-xs">4.9/5 rating</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#8c2bee]/30 to-purple-500/30 rounded-2xl blur-xl transition-opacity duration-1000"></div>
                        <div className="relative bg-white/5 backdrop-blur-md border border-[#8c2bee]/20 rounded-2xl p-4 overflow-hidden shadow-2xl">
                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDENaj2_vmIOBbFT8K82__6XBnQq6ZSccDF6ep7fRfCrJnK0gTLAjGO0jkxPCeIrm9GpGiYZfjdt9u153VjLEUkSe7HTy5UfwclVxzr6naA6kBlnn5bt4GOWtBHw2YO1KoWViBiJgI0d7EgZEwstu1K4_-Htn9kBb1KjCo7g595b_xVXwkVFN2ihmLkcJCK0frA3R9bQ-jEJvvTcw-FObafovSCgMzcAq_vQrq8YyRbsXUxVEoO2vzpK7ASX6icnebB7cFcmlfjP6U" alt="Dashboard" className="rounded-xl w-full h-auto" />
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6, type: "spring" }}
                                className="hidden md:block absolute top-10 -right-4 bg-[#8c2bee] p-4 rounded-xl shadow-2xl"
                            >
                                <p className="text-[10px] uppercase font-bold text-white/70">Daily Growth</p>
                                <p className="text-2xl font-black text-white">+142%</p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-12 border-y border-slate-800 bg-[#0a0610]/50">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-sm font-bold text-slate-500 mb-8 tracking-widest uppercase">Trusted by industry leaders</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-40 grayscale font-black italic text-2xl">
                        <div>TECHFLOW</div>
                        <div>VANTAGE</div>
                        <div>NEXUS</div>
                        <div>LUMINA</div>
                        <div>VERTEX</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-[#0a0610]" id="features">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20 flex flex-col items-center">
                        <h2 className="text-[#8c2bee] font-bold tracking-wider uppercase text-sm mb-3">Powerful Features</h2>
                        <p className="text-4xl md:text-5xl font-black mb-6">Everything you need to scale</p>
                        <p className="text-slate-400 text-lg max-w-2xl">Our AI handles the heavy lifting—from content creation to review management—so you can focus on high-level strategy.</p>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <motion.div whileHover={{ y: -5 }} className="bg-[#0a0610] border border-slate-800 p-8 rounded-2xl transition-all hover:border-[#8c2bee]/30 hover:bg-slate-900/50">
                            <div className="bg-[#8c2bee]/10 text-[#8c2bee] w-12 h-12 rounded-xl flex items-center justify-center mb-6"><Wand2 size={24} /></div>
                            <h3 className="text-xl font-bold mb-3">AI Content Gen</h3>
                            <p className="text-slate-400 leading-relaxed">Generate high-converting captions, viral threads, and AI-optimized visuals in seconds.</p>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} className="bg-[#0a0610] border border-slate-800 p-8 rounded-2xl transition-all hover:border-[#8c2bee]/30 hover:bg-slate-900/50">
                            <div className="bg-[#8c2bee]/10 text-[#8c2bee] w-12 h-12 rounded-xl flex items-center justify-center mb-6"><TrendingUp size={24} /></div>
                            <h3 className="text-xl font-bold mb-3">Trend Analysis</h3>
                            <p className="text-slate-400 leading-relaxed">Real-time scanning of viral topics and hashtags to keep your brand at the center of the conversation.</p>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} className="bg-[#0a0610] border border-slate-800 p-8 rounded-2xl transition-all hover:border-[#8c2bee]/30 hover:bg-slate-900/50">
                            <div className="bg-[#8c2bee]/10 text-[#8c2bee] w-12 h-12 rounded-xl flex items-center justify-center mb-6"><MessageSquare size={24} /></div>
                            <h3 className="text-xl font-bold mb-3">Smart Review AI</h3>
                            <p className="text-slate-400 leading-relaxed">Automated, intelligent responses for GMB reviews and social comments that sound human.</p>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} className="bg-[#0a0610] border border-slate-800 p-8 rounded-2xl transition-all hover:border-[#8c2bee]/30 hover:bg-slate-900/50">
                            <div className="bg-[#8c2bee]/10 text-[#8c2bee] w-12 h-12 rounded-xl flex items-center justify-center mb-6"><Calendar size={24} /></div>
                            <h3 className="text-xl font-bold mb-3">Automated Posting</h3>
                            <p className="text-slate-400 leading-relaxed">Smart scheduling that finds the peak engagement window for every platform automatically.</p>
                        </motion.div>
                        <motion.div whileHover={{ y: -5 }} className="bg-[#0a0610] border border-slate-800 p-8 rounded-2xl transition-all hover:border-[#8c2bee]/30 hover:bg-slate-900/50">
                            <div className="bg-[#8c2bee]/10 text-[#8c2bee] w-12 h-12 rounded-xl flex items-center justify-center mb-6"><LineChart size={24} /></div>
                            <h3 className="text-xl font-bold mb-3">Growth Prediction</h3>
                            <p className="text-slate-400 leading-relaxed">Data-driven forecasts for follower growth and engagement metrics based on current trends.</p>
                        </motion.div>
                        <div className="bg-gradient-to-br from-[#8c2bee]/20 to-purple-900/20 border border-[#8c2bee]/30 p-8 rounded-2xl flex flex-col justify-center items-center text-center">
                            <h3 className="text-2xl font-bold mb-6">Ready to see it in action?</h3>
                            <Link href="/auth/register" className="bg-white text-[#0a0610] font-bold px-8 py-3 rounded-xl transition-transform hover:scale-105">Start Trial</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-24 overflow-hidden" id="how-it-works">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-2 md:order-1"
                        >
                            <div className="relative bg-white/5 backdrop-blur-md border border-[#8c2bee]/20 rounded-2xl p-4 overflow-hidden shadow-2xl">
                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvLIW0Feg7pOf47k-TSBfft7_3bYB4r8OCUa7g1YQ2MyaZpiNvU9OKgihOYxo2Uu-7g8ejrcPSf82foUJHH-KHWphTFYwu0ehmFLFWDMeddZSy4xJ-UnQh15ci10q70SKP8NkHYWsAsXxqqw-HMONiZyI0nyVpokcyoF0GsY3_fZXCTVcawG2-o-RkLCpxmQk4RWO7gdha0tHpP5ac01ihuWJdPzu570O9M_tH42bO12p0obT2hGtTyfDaArWlCldyDx9W0WRmFNI" alt="Process" className="rounded-xl w-full" />
                            </div>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="order-1 md:order-2 flex flex-col gap-10"
                        >
                            <h2 className="text-4xl md:text-5xl font-black mb-6">Simple steps to 10x your presence</h2>
                            <div className="flex flex-col gap-8">
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#8c2bee]/10 text-[#8c2bee] font-black text-xl flex items-center justify-center border border-[#8c2bee]/20">1</div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2">Connect Your Accounts</h4>
                                        <p className="text-slate-400 leading-relaxed">Securely sync your IG, FB, YT, and GMB with one-click API integrations. No passwords shared.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#8c2bee]/10 text-[#8c2bee] font-black text-xl flex items-center justify-center border border-[#8c2bee]/20">2</div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2">Generate & Schedule</h4>
                                        <p className="text-slate-400 leading-relaxed">Let the AI draft content based on your brand voice. Approve or edit, then set to autopilot.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#8c2bee]/10 text-[#8c2bee] font-black text-xl flex items-center justify-center border border-[#8c2bee]/20">3</div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-2">Watch Real-time Growth</h4>
                                        <p className="text-slate-400 leading-relaxed">Monitor your reach and engagement climb. Our AI learns and optimizes your strategy daily.</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 bg-[#0a0610]" id="pricing">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black mb-6">Scalable Pricing for Every Brand</h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto">Choose the plan that fits your growth ambitions.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <motion.div whileHover={{ y: -8 }} className="bg-[#0a0610] border border-slate-800 rounded-3xl p-8 transition-transform relative flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
                            <p className="text-slate-400 text-sm mb-6">Perfect for solo creators.</p>
                            <div className="mb-8">
                                <span className="text-5xl font-black text-white">$0</span>
                                <span className="text-slate-400 ml-1">/mo</span>
                            </div>
                            <ul className="flex flex-col gap-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 size={18} className="text-[#8c2bee]" /> Up to 3 Social Profiles</li>
                                <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 size={18} className="text-[#8c2bee]" /> 10 AI Posts / Month</li>
                                <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 size={18} className="text-[#8c2bee]" /> Basic Analytics</li>
                            </ul>
                            <button className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl transition-colors hover:bg-slate-700">Start for Free</button>
                        </motion.div>
                        <motion.div whileHover={{ y: -8 }} className="border-[#8c2bee] bg-slate-900/50 shadow-2xl shadow-[#8c2bee]/10 scale-105 z-10 border rounded-3xl p-8 relative flex flex-col cursor-pointer">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#8c2bee] to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
                            <h3 className="text-xl font-bold text-white mb-2">Pro</h3>
                            <p className="text-slate-400 text-sm mb-6">For growing businesses.</p>
                            <div className="mb-8">
                                <span className="text-5xl font-black text-white">$49</span>
                                <span className="text-slate-400 ml-1">/mo</span>
                            </div>
                            <ul className="flex flex-col gap-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 size={18} className="text-[#8c2bee]" /> Unlimited Profiles</li>
                                <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 size={18} className="text-[#8c2bee]" /> Unlimited AI Post Generation</li>
                                <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 size={18} className="text-[#8c2bee]" /> Smart Review AI</li>
                                <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 size={18} className="text-[#8c2bee]" /> Growth Predictor Engine</li>
                            </ul>
                            <button className="w-full bg-[#8c2bee] text-white font-bold py-4 rounded-xl transition-all hover:brightness-110">Go Pro Now</button>
                        </motion.div>
                        <motion.div whileHover={{ y: -8 }} className="bg-[#0a0610] border border-slate-800 rounded-3xl p-8 transition-transform relative flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-2">Enterprise</h3>
                            <p className="text-slate-400 text-sm mb-6">Custom tools for agencies.</p>
                            <div className="mb-8">
                                <span className="text-5xl font-black text-white">Custom</span>
                            </div>
                            <ul className="flex flex-col gap-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 size={18} className="text-[#8c2bee]" /> White-label Reporting</li>
                                <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 size={18} className="text-[#8c2bee]" /> Dedicated Account Manager</li>
                                <li className="flex items-center gap-3 text-slate-300"><CheckCircle2 size={18} className="text-[#8c2bee]" /> Priority API Access</li>
                            </ul>
                            <button className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl transition-colors hover:bg-slate-700">Contact Sales</button>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 bg-[#0a0610] overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <h2 className="text-3xl font-black text-center mb-16">Results that speak for themselves</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="relative bg-white/5 backdrop-blur-md border border-[#8c2bee]/20 rounded-2xl p-8 overflow-hidden shadow-2xl italic text-slate-300">
                            <Quote className="absolute top-4 right-4 text-[#8c2bee]/30" size={40} />
                            "Aura Marketing saved me 20 hours a week on social media management. Our engagement has tripled in just 2 months!"
                            <div className="mt-8 flex items-center gap-4 not-italic">
                                <img className="w-12 h-12 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAp2en-MyTHBs59Fdt-VCXe5pNx0ModPNLduii0KehORcd7M1QxRF3I09vkyeRijh8iezLDp6PsiXoyzLWeRa7MUKekxzO1Fhw4zZelEXA8J6IB22Zz-RXvtpUNqCIv2lSUC8GLhZXE_4LM2FIZ6R-NP2a0cyFQnkbSrJi-_cqtKUmnrkcIjdydQsbBZRhV60HJKU4SCijItwBGIXewnxI1fcXRg7DitkNvLe01XaE2zwyitMI_wJc4JDEsUN1FqL16_BwjExuSZTM" alt="Sarah Miller" />
                                <div>
                                    <p className="font-bold text-white">Sarah Miller</p>
                                    <p className="text-xs text-slate-500">CMO at GlowUp Agency</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative bg-white/5 backdrop-blur-md border border-[#8c2bee]/20 rounded-2xl p-8 overflow-hidden shadow-2xl italic text-slate-300">
                            <Quote className="absolute top-4 right-4 text-[#8c2bee]/30" size={40} />
                            "The Trend Analysis feature is a cheat code. We're consistently reaching new audiences by hopping on viral topics automatically."
                            <div className="mt-8 flex items-center gap-4 not-italic">
                                <img className="w-12 h-12 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtU_5PTihmd3g8mBmKOQlULU25DXv1Wk04-SblfthWbtdHkwjk8m3AWM16oPx6kmbg7wW3pVz6dpBJLD1vWr_E9o7SDO5EsvA8Wn0ZtrY-E4SjYIUDrkgvv79iWz5St_kgahMbsrvsbs6yBchD5UYhrqlxY9oNbY8arwjY1sliqcBT67DDzrEcAIjHn8TIBUckXlwvyMJgVp_HuhjERKEqD_wwGdxGEZ6y1FUysmU7lr760KFEA-CreZvte9934BJH5P0RrF4eRcI" alt="David Chen" />
                                <div>
                                    <p className="font-bold text-white">David Chen</p>
                                    <p className="text-xs text-slate-500">Founder of TechVibe</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative bg-white/5 backdrop-blur-md border border-[#8c2bee]/20 rounded-2xl p-8 overflow-hidden shadow-2xl italic text-slate-300 md:hidden lg:block">
                            <Quote className="absolute top-4 right-4 text-[#8c2bee]/30" size={40} />
                            "Finally, an AI tool that doesn't sound like a robot. The Smart Review AI manages our GMB perfectly and maintains our brand voice."
                            <div className="mt-8 flex items-center gap-4 not-italic">
                                <img className="w-12 h-12 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzwX8NBveE1xkrgqO6Qw0S7owxsZxUh151czrko1ZaUPfRM7owdeD_zjwUt9x1Frn5lPwCiCPpz8ONK6ADQvH9l-4XuTNagw6z1TGd9Hc4Fel7zsfhS5NY4971__0Typ3r27iDZhZHld7ge4Kar8aFvPmb-gIPIOpSxBAhTBP9AI6kJTsjf6RHoe0pDZRc7U6OF3c9LYbFnK_pE4c9DCrzFOxu-4i4fHb4rbaZzxmUSKEtkew7GYYGseESj2f_qAJ4RVN0vNslz5A" alt="Emma Roberts" />
                                <div>
                                    <p className="font-bold text-white">Emma Roberts</p>
                                    <p className="text-xs text-slate-500">Small Biz Owner</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 relative overflow-hidden text-center">
                <div className="absolute inset-0 bg-[#8c2bee]/20 blur-3xl rounded-full translate-y-1/2"></div>
                <div className="max-w-4xl mx-auto px-6 relative">
                    <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Start Growing With <span className="text-[#8c2bee] italic">AI</span> Today</h2>
                    <p className="text-xl text-slate-400 mb-12">No credit card required. 14-day free trial on all Pro features.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/auth/register" className="bg-[#8c2bee] text-white font-bold rounded-xl shadow-[0_20px_25px_-5px_rgba(140,43,238,0.25)] transition-transform hover:scale-105 px-10 py-5 text-xl">Create Your Account</Link>
                        <button className="bg-slate-800/50 border border-slate-700 text-white font-bold rounded-xl transition-colors hover:bg-slate-800 px-10 py-5 text-xl">Talk to an Expert</button>
                    </div>
                    <p className="mt-8 text-sm text-slate-500 flex flex-wrap items-center justify-center gap-4">
                        <span className="flex items-center gap-1 font-bold text-xs uppercase"><CheckCircle2 size={12} /> No setup fee</span>
                        <span className="flex items-center gap-1 font-bold text-xs uppercase"><CheckCircle2 size={12} /> Cancel anytime</span>
                        <span className="flex items-center gap-1 font-bold text-xs uppercase"><CheckCircle2 size={12} /> 24/7 Support</span>
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <img src="/sparkles.svg" alt="Aura Logo" className="w-6 h-6" />
                        <span className="text-lg font-bold">Aura Marketing</span>
                    </div>
                    <p className="text-slate-500 text-sm">© 2024 Aura Marketing Inc. All rights reserved.</p>
                    <div className="flex gap-6 text-slate-500">
                        <Share2 size={20} className="hover:text-white cursor-pointer transition-colors" />
                        <Globe size={20} className="hover:text-white cursor-pointer transition-colors" />
                        <Mail size={20} className="hover:text-white cursor-pointer transition-colors" />
                    </div>
                </div>
            </footer>
        </div>
    );
}

