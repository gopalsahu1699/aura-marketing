"use client";

import React, { useState, useRef, useCallback } from 'react';
import {
    Brain, Cpu, Target, Database,
    TrendingUp, Timer, Library, Plus,
    MoreVertical, FileText, Link as LucideLink,
    Trash2, RefreshCw, ArrowRight, Zap,
    CheckCircle2, AlertCircle, Shield,
    Activity, Gauge, Layers, Sparkles,
    Search, Filter, ChevronRight, Upload,
    Send, MessageSquare, X, Play,
    Settings, BarChart3, Clock, Check,
    ArrowLeft, Mic, Image, Paperclip,
    GitBranch, Palette, BarChart2, Film, Wand2,
    Users, TrendingDown, Eye, Heart
} from 'lucide-react';
import { generateChatContent } from '@/app/actions/ai';
import { createBrowserClient } from '@/lib/supabase-client';
import { nvidia } from '@/lib/nvidia-api';

interface TrainingModel {
    id: number;
    name: string;
    status: string;
    accuracy: string;
    lastTrained: string;
    color: string;
    bg: string;
    progress: number | null;
    icon: React.ReactNode;
    description: string;
    dataPoints: string;
    type: string;
    systemPrompt: string;
    capabilities: string[];
    chatHistory: { role: string; content: string }[];
    vaultFiles: { id: number; name: string; date: string; size: string; type: string }[];
}

export default function AITrainingPage() {
    const defaultModels: TrainingModel[] = [
        {
            id: 1,
            name: "Content Creator AI",
            status: "Operational",
            accuracy: "98.2%",
            lastTrained: "2h ago",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            progress: null,
            icon: <Palette size={20} />,
            description: "Generates social media posts, ad copy, blog intros, and marketing content aligned with your brand voice.",
            dataPoints: "24,500",
            type: "Content Generation",
            systemPrompt: "You are an AI Content Creator training assistant. Help the user improve content generation quality by processing brand guidelines, tone of voice examples, successful posts, and writing style references.",
            capabilities: ["Post Generation", "Ad Copy", "Captions", "Blog Intros", "Hashtags"],
            chatHistory: [],
            vaultFiles: [
                { id: 101, name: "brand_voice_guide.pdf", date: "Oct 12, 2023", size: "2.4 MB", type: "pdf" },
                { id: 102, name: "top_performing_posts.csv", date: "Oct 15, 2023", size: "890 KB", type: "csv" },
            ]
        },
        {
            id: 2,
            name: "Audience Analyzer AI",
            status: "Synching",
            accuracy: "84.5%",
            lastTrained: "In Progress",
            color: "text-primary",
            bg: "bg-primary/10",
            progress: 65,
            icon: <Users size={20} />,
            description: "Maps behavioral signals to audience segments. Identifies personas, demographics, and engagement patterns.",
            dataPoints: "18,200",
            type: "Audience Analysis",
            systemPrompt: "You are an Audience Analyzer AI training assistant. Help the user improve audience segmentation by processing customer data, demographics, behavioral patterns, and engagement metrics.",
            capabilities: ["Persona Building", "Segmentation", "Demographics", "Behavior Mapping", "Lookalike Audiences"],
            chatHistory: [],
            vaultFiles: [
                { id: 201, name: "customer_segments.csv", date: "Oct 8, 2023", size: "1.5 MB", type: "csv" },
            ]
        },
        {
            id: 3,
            name: "Sentiment AI",
            status: "Standby",
            accuracy: "91.0%",
            lastTrained: "1d ago",
            color: "text-slate-400",
            bg: "bg-slate-400/10",
            progress: null,
            icon: <Heart size={20} />,
            description: "Analyzes customer reviews, comments, and social mentions to extract sentiment, emotions, and pain points.",
            dataPoints: "12,800",
            type: "Sentiment Analysis",
            systemPrompt: "You are a Sentiment Analysis AI training assistant. Help the user improve sentiment detection by processing customer reviews, social media comments, support tickets, and feedback data.",
            capabilities: ["Review Analysis", "Comment Sentiment", "Emotion Detection", "Pain Point ID", "Brand Perception"],
            chatHistory: [],
            vaultFiles: [
                { id: 301, name: "customer_reviews_q3.csv", date: "Oct 5, 2023", size: "3.2 MB", type: "csv" },
                { id: 302, name: "social_mentions.json", date: "Oct 6, 2023", size: "780 KB", type: "json" },
            ]
        },
        {
            id: 4,
            name: "Predictive Intelligence AI",
            status: "Standby",
            accuracy: "87.3%",
            lastTrained: "3d ago",
            color: "text-slate-400",
            bg: "bg-slate-400/10",
            progress: null,
            icon: <TrendingUp size={20} />,
            description: "Forecasts demand, revenue trends, churn risk, and optimal pricing using historical patterns and market signals.",
            dataPoints: "31,400",
            type: "Predictive Analytics",
            systemPrompt: "You are a Predictive Intelligence AI training assistant. Help the user improve predictions by processing sales data, revenue history, churn indicators, pricing experiments, and market trends.",
            capabilities: ["Demand Forecast", "Revenue Prediction", "Churn Detection", "Price Optimization", "Trend Analysis"],
            chatHistory: [],
            vaultFiles: [
                { id: 401, name: "sales_history_2023.csv", date: "Oct 1, 2023", size: "4.1 MB", type: "csv" },
                { id: 402, name: "pricing_experiments.json", date: "Oct 3, 2023", size: "520 KB", type: "json" },
            ]
        },
        {
            id: 5,
            name: "Competitor Intel AI",
            status: "Operational",
            accuracy: "89.7%",
            lastTrained: "6h ago",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            progress: null,
            icon: <Eye size={20} />,
            description: "Monitors competitor ads, content strategies, pricing changes, and market positioning to find gaps and opportunities.",
            dataPoints: "9,600",
            type: "Competitive Intelligence",
            systemPrompt: "You are a Competitor Intelligence AI training assistant. Help the user improve competitive analysis by processing competitor data, ad creatives, pricing info, market research, and industry reports.",
            capabilities: ["Ad Monitoring", "Price Tracking", "Content Analysis", "Market Gaps", "Strategy Insights"],
            chatHistory: [],
            vaultFiles: [
                { id: 501, name: "competitor_ads_library.csv", date: "Oct 10, 2023", size: "1.8 MB", type: "csv" },
            ]
        },
        {
            id: 6,
            name: "Studio Creator AI",
            status: "Operational",
            accuracy: "96.1%",
            lastTrained: "30m ago",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            progress: null,
            icon: <Wand2 size={20} />,
            description: "Powers all 3 Studio Creator tasks — AI Text Generator for copy & captions, AI Image Studio for visuals, and AI Reel Generator for video content.",
            dataPoints: "42,300",
            type: "Creative Studio",
            systemPrompt: "You are a Studio Creator AI training assistant. You power 3 creative tasks: (1) AI Text Generator — captions, ad copy, blogs; (2) AI Image Studio — visual descriptions and prompts; (3) AI Reel Generator — video scripts, hooks, and storyboards. Help the user improve creative output by processing brand guidelines, successful content examples, and creative references.",
            capabilities: ["Text Generation", "Image Prompts", "Video Scripts", "Ad Copy", "Captions", "Blog Writing"],
            chatHistory: [],
            vaultFiles: [
                { id: 601, name: "brand_style_guide.pdf", date: "Oct 14, 2023", size: "3.5 MB", type: "pdf" },
                { id: 602, name: "best_performing_creatives.csv", date: "Oct 12, 2023", size: "1.9 MB", type: "csv" },
                { id: 603, name: "video_hooks_library.json", date: "Oct 11, 2023", size: "640 KB", type: "json" },
            ]
        },
    ];

    const [models, setModels] = useState<TrainingModel[]>([]);
    const supabase = createBrowserClient();
    const [activeModelId, setActiveModelId] = useState<number | null>(null);
    const [trainingInput, setTrainingInput] = useState("");
    const [isTraining, setIsTraining] = useState(false);
    const [uploadDragActive, setUploadDragActive] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
    const [newModelName, setNewModelName] = useState("");
    const [newModelType, setNewModelType] = useState("");
    const [newModelDesc, setNewModelDesc] = useState("");
    const [newModelCaps, setNewModelCaps] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Fetch models on load
    React.useEffect(() => {
        const fetchModels = async () => {
            const { data, error } = await supabase.from('training_models').select('*');
            if (error) {
                console.error('Error fetching models:', error);
                setModels(defaultModels); // Fallback to defaults if none in DB
                return;
            }
            if (data && data.length > 0) {
                const transformedModels = data.map((m: any) => ({
                    ...m,
                    icon: iconOptions[Math.floor(Math.random() * iconOptions.length)], // Assign icon if not in DB
                    chatHistory: [],
                    vaultFiles: [],
                }));
                setModels(transformedModels);
            } else {
                setModels(defaultModels);
            }
        };
        fetchModels();
    }, [supabase]);

    const activeModel = models.find(m => m.id === activeModelId);

    const iconOptions = [<Brain size={20} />, <Cpu size={20} />, <Activity size={20} />, <Target size={20} />, <Wand2 size={20} />, <Eye size={20} />, <Heart size={20} />, <Users size={20} />];

    const handleDeleteModel = (id: number) => {
        setModels(prev => prev.filter(m => m.id !== id));
        setDeleteConfirmId(null);
        if (activeModelId === id) setActiveModelId(null);
    };

    const handleCreateModel = () => {
        if (!newModelName.trim() || !newModelType.trim()) return;
        const newModel: TrainingModel = {
            id: Date.now(),
            name: newModelName.trim(),
            status: "Standby",
            accuracy: "0.0%",
            lastTrained: "Never",
            color: "text-slate-400",
            bg: "bg-slate-400/10",
            progress: null,
            icon: iconOptions[Math.floor(Math.random() * iconOptions.length)],
            description: newModelDesc.trim() || `Custom AI model for ${newModelType.trim()}.`,
            dataPoints: "0",
            type: newModelType.trim(),
            systemPrompt: `You are a ${newModelName.trim()} training assistant specializing in ${newModelType.trim()}. Help the user improve this model by processing relevant data and instructions.`,
            capabilities: newModelCaps ? newModelCaps.split(',').map(c => c.trim()).filter(Boolean) : [newModelType.trim()],
            chatHistory: [],
            vaultFiles: [],
        };
        setModels(prev => [...prev, newModel]);
        setShowCreateModal(false);
        setNewModelName("");
        setNewModelType("");
        setNewModelDesc("");
        setNewModelCaps("");
    };

    const handleStartTraining = (modelId: number) => {
        setModels(prev => prev.map(m =>
            m.id === modelId ? { ...m, status: "Synching", progress: 0, color: "text-primary", bg: "bg-primary/10", lastTrained: "In Progress" } : m
        ));
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.floor(Math.random() * 8) + 2;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(() => {
                    setModels(prev => prev.map(m =>
                        m.id === modelId ? {
                            ...m, status: "Operational", progress: null, color: "text-emerald-500",
                            bg: "bg-emerald-500/10", lastTrained: "Just now",
                            accuracy: `${Math.min(99.9, parseFloat(m.accuracy) + Math.random() * 2).toFixed(1)}%`
                        } : m
                    ));
                }, 1000);
            }
            setModels(prev => prev.map(m =>
                m.id === modelId && m.status === "Synching" ? { ...m, progress } : m
            ));
        }, 500);
    };

    const handleFileUpload = (files: FileList | null) => {
        if (!files || !activeModelId) return;
        const newFiles = Array.from(files).map((file, i) => ({
            id: Date.now() + i,
            name: file.name,
            date: "Just now",
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            type: file.name.split('.').pop() || "file",
        }));
        setModels(prev => prev.map(m =>
            m.id === activeModelId ? { ...m, vaultFiles: [...newFiles, ...m.vaultFiles] } : m
        ));
    };

    const handleDeleteFile = (fileId: number) => {
        if (!activeModelId) return;
        setModels(prev => prev.map(m =>
            m.id === activeModelId ? { ...m, vaultFiles: m.vaultFiles.filter(f => f.id !== fileId) } : m
        ));
    };

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setUploadDragActive(true);
        else if (e.type === "dragleave") setUploadDragActive(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setUploadDragActive(false);
        handleFileUpload(e.dataTransfer.files);
    }, [activeModelId]);

    const handleTrainSubmit = async () => {
        if (!trainingInput.trim() || isTraining || !activeModel) return;

        const userMessage = trainingInput.trim();
        setModels(prev => prev.map(m =>
            m.id === activeModelId ? { ...m, chatHistory: [...m.chatHistory, { role: "user", content: userMessage }] } : m
        ));
        setTrainingInput("");
        setIsTraining(true);

        try {
            const fullPrompt = `${activeModel.systemPrompt}\n\nConversation so far:\n${activeModel.chatHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUser: ${userMessage}`;
            const { success, content, error } = await generateChatContent(fullPrompt, "meta/llama-3.3-70b-instruct");
            if (success && content) {
                setModels(prev => prev.map(m =>
                    m.id === activeModelId ? { ...m, chatHistory: [...m.chatHistory, { role: "assistant", content }] } : m
                ));
            } else {
                throw new Error(error);
            }
        } catch {
            setModels(prev => prev.map(m =>
                m.id === activeModelId ? {
                    ...m, chatHistory: [...m.chatHistory, {
                        role: "assistant",
                        content: `Training data acknowledged for ${activeModel.name}. I've queued this for the next calibration cycle. It will be used to improve ${activeModel.type.toLowerCase()} accuracy.`
                    }]
                } : m
            ));
        } finally {
            setIsTraining(false);
            setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
    };

    // ============ MODEL LIST VIEW ============
    if (!activeModelId) {
        return (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
                <header className="h-16 lg:h-20 border-b border-primary/10 flex items-center justify-between px-4 md:px-8 bg-background/50 backdrop-blur-md shrink-0 sticky top-0 z-20">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Cpu size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-2xl font-black uppercase italic tracking-tight text-white leading-none">Neural Foundry</h2>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-2 hidden sm:block">Select an AI Model to Train</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-xl">
                            <Activity size={14} className="text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{models.filter(m => m.status === "Operational").length}/{models.length} Active</span>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-6 py-2.5 bg-primary hover:brightness-110 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center gap-2"
                        >
                            <Plus size={14} />
                            New Model
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar">
                    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
                        {/* Stats Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: "Total Models", value: String(models.length), icon: <Cpu size={18} /> },
                                { label: "Operational", value: String(models.filter(m => m.status === "Operational").length), icon: <CheckCircle2 size={18} /> },
                                { label: "Training", value: String(models.filter(m => m.status === "Synching").length), icon: <Timer size={18} /> },
                                { label: "Total Data", value: `${models.reduce((a, m) => a + parseInt(m.dataPoints.replace(',', '')), 0).toLocaleString()}`, icon: <Database size={18} /> },
                            ].map((s, i) => (
                                <div key={i} className="bg-primary/5 border border-primary/10 p-5 rounded-[1.5rem] group hover:border-primary/30 transition-all">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-2 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">{s.icon}</div>
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{s.label}</p>
                                    <p className="text-2xl font-black italic text-white">{s.value}</p>
                                </div>
                            ))}
                        </div>

                        {/* Model Cards Grid */}
                        <div>
                            <h3 className="text-lg font-black uppercase italic tracking-tight text-white mb-6 flex items-center gap-3">
                                <Layers size={20} className="text-primary" />
                                Choose an AI to Train
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {models.map((model) => (
                                    <div
                                        key={model.id}
                                        onClick={() => setActiveModelId(model.id)}
                                        className="bg-primary/5 border border-primary/10 rounded-2xl md:rounded-[2rem] p-5 sm:p-8 cursor-pointer hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden"
                                    >
                                        <Sparkles className="absolute -right-8 -top-8 w-24 h-24 text-primary/5 group-hover:text-primary/10 transition-colors" />
                                        <div className="relative z-10">
                                            {/* Icon + Status */}
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="w-14 h-14 bg-white/5 rounded-[1.2rem] flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/10 group-hover:scale-110 transition-all border border-primary/5">
                                                    {model.icon}
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${model.bg} ${model.color}`}>
                                                    {model.status}
                                                </div>
                                            </div>

                                            {/* Name + Type */}
                                            <h4 className="text-[15px] font-black uppercase italic tracking-tight text-white mb-1 leading-tight">{model.name}</h4>
                                            <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-4">{model.type}</p>

                                            {/* Description */}
                                            <p className="text-[11px] font-medium text-slate-400 leading-relaxed mb-6 line-clamp-2">{model.description}</p>

                                            {/* Stats */}
                                            <div className="flex items-center gap-4 mb-6">
                                                <div>
                                                    <p className="text-lg font-black italic text-white">{model.accuracy}</p>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Accuracy</p>
                                                </div>
                                                <div className="w-px h-8 bg-white/10"></div>
                                                <div>
                                                    <p className="text-lg font-black italic text-white">{model.dataPoints}</p>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Data Points</p>
                                                </div>
                                                <div className="w-px h-8 bg-white/10"></div>
                                                <div>
                                                    <p className="text-lg font-black italic text-white">{model.vaultFiles.length}</p>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Files</p>
                                                </div>
                                            </div>

                                            {/* Progress bar if training */}
                                            {model.status === "Synching" && model.progress !== null && (
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                        <span>Training...</span>
                                                        <span className="text-primary">{model.progress}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${model.progress}%` }}></div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Capabilities */}
                                            <div className="flex flex-wrap gap-1.5">
                                                {model.capabilities.slice(0, 3).map(c => (
                                                    <span key={c} className="px-2 py-0.5 bg-white/5 text-[8px] font-black uppercase tracking-wider text-slate-500 rounded-md">{c}</span>
                                                ))}
                                                {model.capabilities.length > 3 && (
                                                    <span className="px-2 py-0.5 bg-primary/10 text-[8px] font-black uppercase tracking-wider text-primary rounded-md">+{model.capabilities.length - 3}</span>
                                                )}
                                            </div>

                                            {/* CTA + Delete */}
                                            <div className="mt-6 flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Open Training Studio <ArrowRight size={14} />
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(model.id); }}
                                                    className="p-2 text-slate-600 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                    title="Delete Model"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add New Model Card */}
                                <div
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-white/[0.02] border-2 border-dashed border-primary/10 rounded-[2rem] p-8 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all flex flex-col items-center justify-center text-center min-h-[360px] group"
                                >
                                    <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all">
                                        <Plus size={28} />
                                    </div>
                                    <h4 className="text-[15px] font-black uppercase italic tracking-tight text-slate-500 group-hover:text-white transition-colors mb-2">Create New AI</h4>
                                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Add a custom model</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="h-20"></div>
                </div>

                {/* Delete Confirmation Modal */}
                {deleteConfirmId !== null && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirmId(null)}>
                        <div className="bg-slate-900 border border-red-500/20 rounded-[2rem] p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-lg font-black uppercase italic tracking-tight text-white text-center mb-2">Delete Model?</h3>
                            <p className="text-[11px] font-medium text-slate-400 text-center mb-8 leading-relaxed">
                                This will permanently delete <strong className="text-white">{models.find(m => m.id === deleteConfirmId)?.name}</strong> and all its training data, files, and chat history. This cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="flex-1 py-3 bg-white/5 border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteModel(deleteConfirmId)}
                                    className="flex-1 py-3 bg-red-500 hover:brightness-110 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95"
                                >
                                    Delete Forever
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create Model Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
                        <div className="bg-slate-900 border border-primary/20 rounded-[2rem] p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                        <Plus size={22} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black uppercase italic tracking-tight text-white">Forge New AI</h3>
                                        <p className="text-[9px] font-bold text-primary uppercase tracking-widest">Create a Custom Model</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-slate-400">
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Model Name *</label>
                                    <input
                                        type="text"
                                        value={newModelName}
                                        onChange={e => setNewModelName(e.target.value)}
                                        placeholder="e.g. Email Campaign AI"
                                        className="w-full bg-white/5 border border-primary/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Model Type *</label>
                                    <input
                                        type="text"
                                        value={newModelType}
                                        onChange={e => setNewModelType(e.target.value)}
                                        placeholder="e.g. Email Marketing"
                                        className="w-full bg-white/5 border border-primary/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Description</label>
                                    <textarea
                                        value={newModelDesc}
                                        onChange={e => setNewModelDesc(e.target.value)}
                                        placeholder="What does this AI model do?"
                                        rows={2}
                                        className="w-full bg-white/5 border border-primary/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 resize-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Capabilities (comma-separated)</label>
                                    <input
                                        type="text"
                                        value={newModelCaps}
                                        onChange={e => setNewModelCaps(e.target.value)}
                                        placeholder="e.g. Subject Lines, A/B Testing, Personalization"
                                        className="w-full bg-white/5 border border-primary/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 py-3 bg-white/5 border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateModel}
                                    disabled={!newModelName.trim() || !newModelType.trim()}
                                    className="flex-1 py-3 bg-primary hover:brightness-110 disabled:opacity-30 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={14} /> Create Model
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ============ INDIVIDUAL MODEL TRAINING VIEW ============
    const model = activeModel!;

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
            {/* Header */}
            <header className="h-16 lg:h-20 border-b border-primary/10 flex items-center justify-between px-4 md:px-8 bg-background/50 backdrop-blur-md shrink-0 sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setActiveModelId(null)}
                        className="w-10 h-10 bg-white/5 hover:bg-primary/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg ${model.status === 'Operational' ? 'bg-emerald-500 shadow-emerald-500/20 text-white' : model.status === 'Synching' ? 'bg-primary shadow-primary/20 text-white' : 'bg-white/10 text-slate-400'}`}>
                        {model.icon}
                    </div>
                    <div>
                        <h2 className="text-base sm:text-xl font-black uppercase italic tracking-tight text-white leading-none">{model.name}</h2>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1.5 hidden sm:block">{model.type} · {model.accuracy} Accuracy</p>
                    </div>
                    <div className={`ml-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${model.bg} ${model.color}`}>
                        {model.status}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {model.status === "Standby" && (
                        <button
                            onClick={() => handleStartTraining(model.id)}
                            className="px-6 py-2.5 bg-emerald-500 hover:brightness-110 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
                        >
                            <Play size={14} /> Start Training
                        </button>
                    )}
                    {model.status === "Synching" && (
                        <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">Training {model.progress}%</span>
                        </div>
                    )}
                </div>
            </header>

            {/* Training Progress Bar */}
            {model.status === "Synching" && model.progress !== null && (
                <div className="h-1 w-full bg-white/5">
                    <div className="h-full bg-primary shadow-[0_0_10px_rgba(140,43,238,0.5)] transition-all duration-500 rounded-r-full" style={{ width: `${model.progress}%` }}></div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-3 min-h-full">
                    {/* LEFT: Chat Training Area */}
                    <div className="lg:col-span-2 flex flex-col border-b lg:border-b-0 lg:border-r border-primary/5">
                        {/* Model Info Bar */}
                        <div className="px-4 md:px-8 py-4 md:py-5 border-b border-primary/5 bg-primary/5">
                            <p className="text-[11px] font-medium text-slate-400 leading-relaxed mb-3">{model.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {model.capabilities.map(c => (
                                    <span key={c} className="px-3 py-1 bg-white/5 border border-primary/5 text-[9px] font-black uppercase tracking-widest text-slate-400 rounded-lg">{c}</span>
                                ))}
                            </div>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
                            {model.chatHistory.length === 0 && (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-16">
                                    <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary mb-6">
                                        {model.icon}
                                    </div>
                                    <h3 className="text-lg font-black uppercase italic tracking-tight text-white mb-2">Train {model.name}</h3>
                                    <p className="text-[11px] font-medium text-slate-400 max-w-md leading-relaxed mb-8">
                                        Start training by pasting data, giving instructions, or asking questions specific to {model.type.toLowerCase()}.
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                                        {[
                                            `Paste ${model.capabilities[0]?.toLowerCase()} examples to improve accuracy`,
                                            `Upload ${model.type.toLowerCase()} training data`,
                                            `"What kind of data do you need to improve?"`,
                                            `Share brand guidelines for better output`
                                        ].map((suggestion, i) => (
                                            <button
                                                key={i}
                                                onClick={() => {
                                                    setTrainingInput(suggestion.replace(/^"|"$/g, ''));
                                                }}
                                                className="text-left px-4 py-3 bg-white/5 border border-primary/5 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white hover:border-primary/30 hover:bg-primary/5 transition-all"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {model.chatHistory.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] ${msg.role === 'user' ? '' : 'flex gap-3'}`}>
                                        {msg.role === 'assistant' && (
                                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                                                {model.icon}
                                            </div>
                                        )}
                                        <div className={`px-5 py-4 rounded-2xl text-[12px] font-medium leading-relaxed ${msg.role === 'user'
                                            ? 'bg-primary text-white rounded-br-md'
                                            : 'bg-white/5 text-slate-300 border border-primary/10 rounded-bl-md'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {isTraining && (
                                <div className="flex justify-start">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-1">
                                            {model.icon}
                                        </div>
                                        <div className="px-5 py-4 rounded-2xl rounded-bl-md bg-white/5 border border-primary/10">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Bar */}
                        <div className="p-6 border-t border-primary/5 bg-background">
                            <div className="flex gap-3 items-end">
                                <div className="flex-1 relative">
                                    <textarea
                                        value={trainingInput}
                                        onChange={(e) => setTrainingInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTrainSubmit(); } }}
                                        placeholder={`Train ${model.name} — paste data, instructions, or ask a question...`}
                                        rows={2}
                                        className="w-full bg-white/5 border border-primary/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/10 resize-none transition-all"
                                    />
                                </div>
                                <button
                                    onClick={handleTrainSubmit}
                                    disabled={!trainingInput.trim() || isTraining}
                                    className="h-[60px] px-6 bg-primary hover:brightness-110 disabled:opacity-30 disabled:hover:brightness-100 text-white rounded-2xl transition-all active:scale-95 flex items-center gap-2 shrink-0"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                            <div className="flex items-center gap-4 mt-3">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors"
                                >
                                    <Paperclip size={12} /> Attach File
                                </button>
                                <span className="text-[9px] text-slate-600">·</span>
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Shift+Enter for new line</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Knowledge Vault for THIS model */}
                    <div className="flex flex-col bg-primary/[0.02]">
                        <div className="px-6 py-5 border-b border-primary/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Database size={16} className="text-primary" />
                                    <h3 className="text-sm font-black uppercase italic tracking-tight text-white">Training Data</h3>
                                </div>
                                <span className="text-[9px] font-black px-2 py-0.5 bg-primary/10 text-primary rounded uppercase">{model.vaultFiles.length} files</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                            {/* Upload Zone */}
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${uploadDragActive ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-primary/10 hover:border-primary/30 bg-white/5'}`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".csv,.pdf,.json,.txt,.xlsx"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e.target.files)}
                                />
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 transition-all ${uploadDragActive ? 'bg-primary text-white scale-110' : 'bg-primary/10 text-primary'}`}>
                                    <Upload size={22} />
                                </div>
                                <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">
                                    {uploadDragActive ? 'Drop Files Here' : 'Upload Training Data'}
                                </p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">For {model.name} only</p>
                            </div>

                            {/* Files */}
                            <div className="space-y-3">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Files for This Model</p>
                                {model.vaultFiles.length === 0 && (
                                    <div className="text-center py-8">
                                        <Database size={24} className="text-slate-600 mx-auto mb-3" />
                                        <p className="text-[10px] font-bold text-slate-500">No training data uploaded yet</p>
                                    </div>
                                )}
                                {model.vaultFiles.map((file) => (
                                    <div key={file.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-primary/5 hover:border-primary/20 transition-all group/doc">
                                        <div className="p-2 rounded-lg bg-white/10 text-slate-400 group-hover/doc:text-primary transition-colors">
                                            <FileText size={14} />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-[10px] font-black text-white truncate uppercase tracking-tight">{file.name}</p>
                                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{file.date} · {file.size}</p>
                                        </div>
                                        <button onClick={() => handleDeleteFile(file.id)} className="p-1.5 text-slate-500 hover:text-red-500 transition-colors opacity-0 group-hover/doc:opacity-100">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Model Stats */}
                            <div className="bg-white/5 border border-primary/5 rounded-2xl p-5 space-y-4">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Model Stats</p>
                                {[
                                    { label: "Accuracy", value: model.accuracy },
                                    { label: "Data Points", value: model.dataPoints },
                                    { label: "Last Trained", value: model.lastTrained },
                                    { label: "Conversations", value: String(model.chatHistory.filter(m => m.role === 'user').length) },
                                ].map(s => (
                                    <div key={s.label} className="flex items-center justify-between">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</span>
                                        <span className="text-[11px] font-black text-white italic">{s.value}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-2">
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">Quick Actions</p>
                                {model.status === "Standby" && (
                                    <button
                                        onClick={() => handleStartTraining(model.id)}
                                        className="w-full py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Play size={14} /> Start Training Cycle
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        setModels(prev => prev.map(m => m.id === model.id ? { ...m, chatHistory: [] } : m));
                                    }}
                                    className="w-full py-3 bg-white/5 border border-primary/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 hover:border-red-500/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={14} /> Clear Chat History
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
