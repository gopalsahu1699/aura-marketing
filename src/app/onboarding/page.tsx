'use client';

import React, { useState } from 'react';
import {
    Sparkles, ShoppingBag, Home, Utensils, GraduationCap,
    Stethoscope, PlusCircle, CheckCircle2, Check, ArrowLeft, ArrowRight,
    Users2, MessageSquare, Star, UserPlus
} from 'lucide-react';

export default function Onboarding() {
    const [selectedIndustry, setSelectedIndustry] = useState('Real Estate');
    const [selectedGoals, setSelectedGoals] = useState(['Followers', 'Engagement']);

    const toggleGoal = (goal: string) => {
        if (selectedGoals.includes(goal)) {
            setSelectedGoals(selectedGoals.filter(g => g !== goal));
        } else {
            setSelectedGoals([...selectedGoals, goal]);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center font-sans bg-[#191022] text-[#f8fafc]">
            {/* Progress Navigation Header */}
            <nav className="w-full max-w-4xl px-6 py-8">
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-[#8c2bee] rounded-lg flex items-center justify-center text-white">
                                <Sparkles size={18} />
                            </div>
                            <span className="font-bold text-xl tracking-tight">Aura</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Step 1 of 2</p>
                            <p className="text-sm font-bold text-[#8c2bee]">50% Complete</p>
                        </div>
                    </div>
                    <div className="w-full h-2 bg-[#8c2bee]/10 rounded-full overflow-hidden">
                        <div className="h-full bg-[#8c2bee] rounded-full transition-all duration-500" style={{ width: '50%' }}></div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-4xl px-6 pb-24">
                {/* Step 1: Industry Selection */}
                <section className="mb-12">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 text-transparent bg-clip-text">Tell us about your industry</h1>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                            This helps Aura tailor its AI engine to your specific market and audience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { id: 'Retail', icon: ShoppingBag, label: 'Retail', desc: 'Physical or online stores' },
                            { id: 'Real Estate', icon: Home, label: 'Real Estate', desc: 'Property and agencies' },
                            { id: 'Restaurant', icon: Utensils, label: 'Restaurant', desc: 'Dining and hospitality' },
                            { id: 'Education', icon: GraduationCap, label: 'Education', desc: 'Schools and learning' },
                            { id: 'Healthcare', icon: Stethoscope, label: 'Healthcare', desc: 'Clinics and wellness' },
                            { id: 'Custom', icon: PlusCircle, label: 'Custom', desc: 'Enter your own', custom: true }
                        ].map((industry) => (
                            <button
                                key={industry.id}
                                className={`flex flex-col items-start p-6 rounded-xl border-2 border-[#8c2bee]/10 bg-white/5 text-left transition-all duration-200 cursor-pointer relative hover:border-[#8c2bee] group ${selectedIndustry === industry.id ? '!border-[#8c2bee] !bg-[#8c2bee]/10' : ''} ${industry.custom ? 'border-dashed' : ''}`}
                                onClick={() => setSelectedIndustry(industry.id)}
                            >
                                {selectedIndustry === industry.id && <CheckCircle2 className="absolute top-4 right-4 text-[#8c2bee]" size={20} />}
                                <div className={`w-12 h-12 bg-[#8c2bee]/10 rounded-lg text-[#8c2bee] flex items-center justify-center mb-4 transition-all duration-200 group-hover:bg-[#8c2bee] group-hover:text-white ${selectedIndustry === industry.id ? '!bg-[#8c2bee] !text-white' : ''}`}>
                                    <industry.icon size={24} />
                                </div>
                                <h3 className="font-bold text-lg mb-1">{industry.label}</h3>
                                <p className="text-sm text-slate-500">{industry.desc}</p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Step 2: Business Goals */}
                <section className="mt-20">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 text-transparent bg-clip-text">
                            What are your primary goals?
                        </h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed">
                            Select all that apply. We'll optimize your strategy based on these objectives.
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto flex flex-col gap-4">
                        {[
                            { id: 'Followers', icon: Users2, title: 'Increase Followers', desc: 'Grow your social media presence and community' },
                            { id: 'Leads', icon: UserPlus, title: 'Generate Leads', desc: 'Capture interest and potential customer contacts' },
                            { id: 'Engagement', icon: MessageSquare, title: 'Boost Engagement', desc: 'Get more likes, comments, and shares on content' },
                            { id: 'Reviews', icon: Star, title: 'Manage Reviews', desc: 'Improve your online reputation and ratings' }
                        ].map((goal) => (
                            <div
                                key={goal.id}
                                className={`flex items-center p-5 rounded-xl border-2 border-[#8c2bee]/10 bg-white/5 cursor-pointer transition-all duration-200 hover:border-[#8c2bee]/50 group ${selectedGoals.includes(goal.id) ? '!border-[#8c2bee] !bg-[#8c2bee]/10' : ''}`}
                                onClick={() => toggleGoal(goal.id)}
                            >
                                <div className={`w-10 h-10 rounded-full bg-[#8c2bee]/10 text-[#8c2bee] flex items-center justify-center mr-4 shrink-0 transition-colors ${selectedGoals.includes(goal.id) ? '!bg-[#8c2bee] !text-white' : ''}`}>
                                    <goal.icon size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold">{goal.title}</h4>
                                    <p className="text-sm text-slate-500">{goal.desc}</p>
                                </div>
                                <div className={`w-6 h-6 rounded border-2 border-[#8c2bee]/20 flex items-center justify-center text-white transition-colors ${selectedGoals.includes(goal.id) ? '!bg-[#8c2bee] !border-[#8c2bee]' : ''}`}>
                                    {selectedGoals.includes(goal.id) && <Check size={14} />}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Bottom Navigation Bar */}
            <footer className="fixed bottom-0 left-0 right-0 bg-[#191022]/80 backdrop-blur-md border-t border-[#8c2bee]/10 p-6 z-50">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <button className="flex items-center gap-2 font-bold text-slate-500 bg-transparent border-none cursor-pointer transition-colors hover:text-white">
                        <ArrowLeft size={20} /> Back
                    </button>
                    <button className="flex items-center gap-2 bg-[#8c2bee] text-white py-3 px-10 rounded-lg font-bold border-none cursor-pointer shadow-[0_10px_15px_-3px_rgba(140,43,238,0.25)] transition-all duration-200 hover:opacity-90 active:scale-95">
                        Continue
                        <ArrowRight size={20} />
                    </button>
                </div>
            </footer>
        </div>
    );
}
