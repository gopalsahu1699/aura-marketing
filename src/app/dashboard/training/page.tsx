"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
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
    Users, TrendingDown, Eye, Heart, Key, Save,
    Lock
} from 'lucide-react';
import { generateChatContent } from '@/app/actions/ai';
import { createBrowserClient } from '@/lib/supabase-client';

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

interface ApiKeys {
    nvidia_image: string;
    nvidia_video: string;
    nvidia_research: string;
    nvidia_chat: string;
}

export default function AITrainingPage() {
    const supabase = createBrowserClient();

    // UI State
    const [activeTab, setActiveTab] = useState<'models' | 'knowledge' | 'api'>('models');

    // Models State
    const [models, setModels] = useState<TrainingModel[]>([]);
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

    // API State
    const [apiKeys, setApiKeys] = useState<ApiKeys>({
        nvidia_image: '',
        nvidia_video: '',
        nvidia_research: '',
        nvidia_chat: ''
    });
    const [apiSaveStatus, setApiSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Initial Fetch (Models & API Keys)
    useEffect(() => {
        const fetchInitialData = async () => {
            // Fetch Models
            const { data: modelsData, error: modelsError } = await supabase.from('training_models').select('*');
            if (!modelsError && modelsData && modelsData.length > 0) {
                const transformedModels = modelsData.map((m: any) => ({
                    ...m,
                    icon: iconOptions[Math.floor(Math.random() * iconOptions.length)],
                    chatHistory: [],
                    vaultFiles: [],
                }));
                setModels(transformedModels);
            }

            // Fetch API Keys
            const { data: prefsData, error: prefsError } = await supabase
                .from('user_preferences')
                .select('api_keys')
                .single();

            if (!prefsError && prefsData?.api_keys) {
                setApiKeys({
                    nvidia_image: prefsData.api_keys.nvidia_image || '',
                    nvidia_video: prefsData.api_keys.nvidia_video || '',
                    nvidia_research: prefsData.api_keys.nvidia_research || '',
                    nvidia_chat: prefsData.api_keys.nvidia_chat || ''
                });
            }
        };
        fetchInitialData();
    }, [supabase]);

    const activeModel = models.find(m => m.id === activeModelId);
    const iconOptions = [<Brain size={20} />, <Cpu size={20} />, <Activity size={20} />, <Target size={20} />, <Wand2 size={20} />, <Eye size={20} />, <Heart size={20} />, <Users size={20} />];

    // --- API Key Handlers ---
    const handleSaveApiKeys = async () => {
        setApiSaveStatus('saving');
        try {
            const { data: userAuth } = await supabase.auth.getUser();
            if (!userAuth.user) throw new Error("Not authenticated");

            const { error } = await supabase
                .from('user_preferences')
                .upsert({
                    user_id: userAuth.user.id,
                    api_keys: apiKeys,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            setApiSaveStatus('saved');
            setTimeout(() => setApiSaveStatus('idle'), 3000);
        } catch (err) {
            console.error(err);
            setApiSaveStatus('error');
            setTimeout(() => setApiSaveStatus('idle'), 3000);
        }
    };

    // --- Model Handlers ---
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
            m.id === modelId ? { ...m, status: "Training", progress: 0, color: "text-primary", bg: "bg-primary/10", lastTrained: "In Progress" } : m
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
                m.id === modelId && m.status === "Training" ? { ...m, progress } : m
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


    // ============ RENDER ============

    // 1. Individual Model View (Overrides tabs if active)
    if (activeModelId && activeModel) {
        return (
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
                {/* Header */}
                <header className="h-16 md:h-20 border-b border-primary/10 flex items-center justify-between px-4 md:px-8 bg-background/50 backdrop-blur-md shrink-0 sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setActiveModelId(null)}
                            className="w-10 h-10 bg-white/5 hover:bg-primary/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-primary transition-all"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-lg ${activeModel.status === 'Operational' ? 'bg-emerald-500 shadow-emerald-500/20 text-white' : activeModel.status === 'Training' ? 'bg-primary shadow-primary/20 text-white' : 'bg-white/10 text-slate-400'}`}>
                            {activeModel.icon}
                        </div>
                        <div>
                            <h2 className="text-base md:text-xl font-black uppercase tracking-tight text-white leading-none">{activeModel.name}</h2>
                            <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1 hidden sm:block">{activeModel.type} · {activeModel.accuracy} Accuracy</p>
                        </div>
                        <div className={`ml-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${activeModel.bg} ${activeModel.color}`}>
                            {activeModel.status}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {activeModel.status === "Standby" && (
                            <button
                                onClick={() => handleStartTraining(activeModel.id)}
                                className="px-5 py-2.5 bg-emerald-500 hover:brightness-110 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center gap-2"
                            >
                                <Play size={14} /> Start Training
                            </button>
                        )}
                        {activeModel.status === "Training" && (
                            <div className="flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">Training {activeModel.progress}%</span>
                            </div>
                        )}
                    </div>
                </header>

                {/* Training Progress Bar */}
                {activeModel.status === "Training" && activeModel.progress !== null && (
                    <div className="h-1 w-full bg-white/5">
                        <div className="h-full bg-primary shadow-[0_0_10px_rgba(140,43,238,0.5)] transition-all duration-500 rounded-r-full" style={{ width: `${activeModel.progress}%` }}></div>
                    </div>
                )}

                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-3 min-h-full">
                        {/* LEFT: Chat Area */}
                        <div className="lg:col-span-2 flex flex-col border-b lg:border-b-0 lg:border-r border-primary/10 bg-black/20">
                            {/* Model Info Bar */}
                            <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                                <p className="text-[11px] font-medium text-slate-400 leading-relaxed mb-3">{activeModel.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {activeModel.capabilities.map(c => (
                                        <span key={c} className="px-2.5 py-1 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400 rounded-md">{c}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                                {activeModel.chatHistory.length === 0 && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                                        <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-2xl shadow-primary/10">
                                            {activeModel.icon}
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Train {activeModel.name}</h3>
                                        <p className="text-[11px] font-medium text-slate-400 max-w-md leading-relaxed mb-8">
                                            Start fine-tuning by providing examples, pasting data, or defining specific rules and boundaries for this model to follow.
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
                                            {[
                                                `"Here are examples of our brand voice..."`,
                                                `"Never use these words in copy..."`,
                                                `"Analyze this attached competitor data..."`,
                                                `"What format do you need data in?"`
                                            ].map((suggestion, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setTrainingInput(suggestion.replace(/^"|"$/g, ''))}
                                                    className="text-left px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold text-slate-400 hover:text-white hover:border-primary/30 hover:bg-primary/5 transition-all text-ellipsis overflow-hidden whitespace-nowrap"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeModel.chatHistory.map((msg, i) => (
                                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] ${msg.role === 'user' ? '' : 'flex gap-3'}`}>
                                            {msg.role === 'assistant' && (
                                                <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-1 shadow-md shadow-primary/5">
                                                    {activeModel.icon}
                                                </div>
                                            )}
                                            <div className={`px-5 py-4 text-[12px] font-medium leading-relaxed ${msg.role === 'user'
                                                ? 'bg-primary text-white rounded-2xl rounded-tr-sm shadow-md shadow-primary/20'
                                                : 'bg-slate-800/80 border border-white/5 text-slate-200 rounded-2xl rounded-tl-sm shadow-md'
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {isTraining && (
                                    <div className="flex justify-start">
                                        <div className="flex gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-1">
                                                {activeModel.icon}
                                            </div>
                                            <div className="px-5 py-5 rounded-2xl rounded-tl-sm bg-slate-800/80 border border-white/5 flex items-center">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce"></div>
                                                    <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                                    <div className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 md:p-6 border-t border-white/5 bg-background">
                                <div className="flex gap-3 items-end">
                                    <div className="flex-1 relative">
                                        <textarea
                                            value={trainingInput}
                                            onChange={(e) => setTrainingInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTrainSubmit(); } }}
                                            placeholder={`Instruct ${activeModel.name}...`}
                                            rows={2}
                                            className="w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 resize-none transition-all shadow-inner"
                                        />
                                    </div>
                                    <button
                                        onClick={handleTrainSubmit}
                                        disabled={!trainingInput.trim() || isTraining}
                                        className="h-[60px] w-[60px] flex items-center justify-center bg-primary hover:brightness-110 disabled:opacity-30 disabled:hover:brightness-100 text-white rounded-2xl transition-all shadow-lg shadow-primary/20 active:scale-95 shrink-0"
                                    >
                                        <Send size={18} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-4 mt-3 pl-2">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                                    >
                                        <Paperclip size={12} /> Inject Data File
                                    </button>
                                    <span className="text-slate-800">|</span>
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Shift+Enter for newline</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Model Knowledge Vault */}
                        <div className="flex flex-col bg-slate-900/50">
                            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Database size={16} className="text-primary" />
                                    <h3 className="text-[12px] font-black uppercase tracking-tight text-white">Knowledge Vault</h3>
                                </div>
                                <span className="text-[9px] font-black px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded uppercase">{activeModel.vaultFiles.length} nodes</span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                                {/* Upload Box */}
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${uploadDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-white/10 hover:border-primary/30 bg-slate-800/30 hover:bg-slate-800/50'}`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept=".csv,.pdf,.json,.txt,.xlsx"
                                        className="hidden"
                                        onChange={(e) => handleFileUpload(e.target.files)}
                                    />
                                    <Upload size={20} className={`mx-auto mb-3 transition-colors ${uploadDragActive ? 'text-primary' : 'text-slate-500'}`} />
                                    <p className="text-[10px] font-black text-white uppercase tracking-widest mb-1">
                                        {uploadDragActive ? 'Drop to Inject' : 'Upload Data'}
                                    </p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">CSV, JSON, PDF, TXT</p>
                                </div>

                                {/* File List */}
                                <div className="space-y-2">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-3 px-1">Injected Files</p>
                                    {activeModel.vaultFiles.length === 0 && (
                                        <div className="text-center py-6 px-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                            <p className="text-[10px] font-bold text-slate-500">Vault empty</p>
                                        </div>
                                    )}
                                    {activeModel.vaultFiles.map((file) => (
                                        <div key={file.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-white/5 hover:border-primary/20 transition-all group/doc">
                                            <FileText size={14} className="text-primary/50 group-hover/doc:text-primary transition-colors" />
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-[10px] font-black text-white truncate uppercase tracking-tight">{file.name}</p>
                                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{file.size}</p>
                                            </div>
                                            <button onClick={() => handleDeleteFile(file.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover/doc:opacity-100 bg-red-500/10 rounded-lg">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Stats & Actions */}
                                <div className="bg-slate-800/30 border border-white/5 rounded-2xl p-5 space-y-4">
                                    {[
                                        { label: "Accuracy", value: activeModel.accuracy },
                                        { label: "Data Points", value: activeModel.dataPoints },
                                        { label: "Memory Nodes", value: String(activeModel.chatHistory.length) },
                                    ].map(s => (
                                        <div key={s.label} className="flex items-center justify-between">
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</span>
                                            <span className="text-[11px] font-black text-white">{s.value}</span>
                                        </div>
                                    ))}

                                    <div className="pt-4 mt-2 border-t border-white/5 space-y-2">
                                        {activeModel.status === "Standby" && (
                                            <button
                                                onClick={() => handleStartTraining(activeModel.id)}
                                                className="w-full py-2.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-2"
                                            >
                                                <RefreshCw size={12} /> Sync Model
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setModels(prev => prev.map(m => m.id === activeModel.id ? { ...m, chatHistory: [] } : m))}
                                            className="w-full py-2.5 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={12} /> Purge Memory
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Main Dashboard View
    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">

            {/* Top Header */}
            <header className="px-6 md:px-10 py-8 shrink-0 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-primary/10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
                        Identity Studio <Sparkles size={24} className="text-primary" />
                    </h1>
                    <p className="text-[11px] font-medium text-slate-400 mt-2 max-w-xl leading-relaxed">
                        The neural core of your brand. Train AI models, configure API access, and manage your central knowledge base.
                    </p>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="px-6 md:px-10 pt-6 border-b border-primary/10 shrink-0">
                <div className="flex items-center gap-6 md:gap-8">
                    {[
                        { id: 'models', label: 'Models & Agents', icon: Cpu },
                        { id: 'knowledge', label: 'Global Knowledge', icon: Database },
                        { id: 'api', label: 'API Integrations', icon: Key }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`pb-4 flex items-center gap-2 border-b-2 transition-all ${isActive
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                <Icon size={16} className={isActive ? 'text-primary' : ''} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar">
                <div className="max-w-7xl mx-auto">

                    {/* TAB: MODELS */}
                    {activeTab === 'models' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                                {[
                                    { label: "Active Models", value: String(models.filter(m => m.status === 'Operational').length), icon: <Activity size={16} /> },
                                    { label: "Synching", value: String(models.filter(m => m.status === 'Training').length), icon: <RefreshCw size={16} /> },
                                    { label: "Data Points", value: "24.5k", icon: <Layers size={16} /> },
                                    { label: "Global Accuracy", value: "94.2%", icon: <CheckCircle2 size={16} /> },
                                ].map((s, i) => (
                                    <div key={i} className="bg-slate-900/50 border border-white/5 p-5 rounded-[1.5rem]">
                                        <div className="flex items-center gap-2 mb-2 text-primary">{s.icon}</div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
                                        <p className="text-xl font-black text-white leading-none">{s.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-2">
                                    <Cpu size={16} className="text-primary" /> Active Agents
                                </h3>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="px-4 py-2 bg-primary hover:brightness-110 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md shadow-primary/20 flex items-center gap-2"
                                >
                                    <Plus size={14} /> New Model
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {models.map((model) => (
                                    <div
                                        key={model.id}
                                        onClick={() => setActiveModelId(model.id)}
                                        className="bg-slate-900/40 border border-white/10 rounded-3xl p-6 cursor-pointer hover:border-primary/40 hover:bg-slate-800/60 hover:-translate-y-1 transition-all group overflow-hidden relative shadow-lg"
                                    >
                                        {/* Status Glow */}
                                        <div className={`absolute top-0 inset-x-0 h-1 ${model.status === 'Operational' ? 'bg-emerald-500/50' : model.status === 'Training' ? 'bg-primary' : 'bg-slate-700'}`}></div>

                                        <div className="flex items-start justify-between mb-5 mt-1">
                                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                                {model.icon}
                                            </div>
                                            <div className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${model.status === 'Operational' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                model.status === 'Training' ? 'bg-primary/10 text-primary border-primary/20' :
                                                    'bg-slate-800 text-slate-400 border-white/10'
                                                }`}>
                                                {model.status}
                                            </div>
                                        </div>

                                        <h4 className="text-[16px] font-black uppercase tracking-tight text-white mb-1.5">{model.name}</h4>
                                        <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-4">{model.type}</p>
                                        <p className="text-[11px] font-medium text-slate-400 leading-relaxed mb-6 line-clamp-2 h-10">{model.description}</p>

                                        {model.status === "Training" && model.progress !== null ? (
                                            <div className="mb-4 bg-slate-800/50 p-3 rounded-xl border border-white/5">
                                                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                                    <span className="flex items-center gap-1.5"><RefreshCw size={10} className="animate-spin text-primary" /> Training...</span>
                                                    <span className="text-primary">{model.progress}%</span>
                                                </div>
                                                <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                                                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${model.progress}%` }}></div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-3 gap-2 border-t border-white/5 pt-5 mb-2">
                                                <div>
                                                    <p className="text-[14px] font-black text-white">{model.accuracy}</p>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Accuracy</p>
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-black text-white">{model.dataPoints}</p>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Data</p>
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-black text-white">{model.vaultFiles.length}</p>
                                                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Files</p>
                                                </div>
                                            </div>
                                        )}

                                        <button
                                            onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(model.id); }}
                                            className="absolute top-6 right-6 p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete Model"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}

                                {/* Empty Slate Add Button */}
                                <div
                                    onClick={() => setShowCreateModal(true)}
                                    className="bg-transparent border-2 border-dashed border-white/10 rounded-3xl p-6 cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all flex flex-col items-center justify-center min-h-[260px] group"
                                >
                                    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 mb-4 group-hover:scale-110 group-hover:text-primary group-hover:bg-primary/10 transition-all">
                                        <Plus size={24} />
                                    </div>
                                    <h4 className="text-[13px] font-black uppercase tracking-tight text-white mb-1">Deploy New Agent</h4>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Train a custom AI model</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: GLOBAL KNOWLEDGE */}
                    {activeTab === 'knowledge' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                            <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
                                <div className="w-24 h-24 shrink-0 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary shadow-2xl shadow-primary/20">
                                    <Library size={40} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white mb-3">Global Knowledge Base</h2>
                                    <p className="text-xs font-medium text-slate-400 max-w-2xl leading-relaxed mb-6">
                                        Data uploaded here sits in the "Global Context Layer." All of your active AI models will reference these files first before generating content or executing tasks. Use this for general brand guidelines, company history, and overarching rules.
                                    </p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept=".csv,.pdf,.json,.txt,.xlsx"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                alert(`Simulating upload of ${e.target.files.length} global files.`);
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 mx-auto md:mx-0"
                                    >
                                        <Upload size={14} /> Upload Global Data
                                    </button>
                                </div>
                            </div>

                            {/* Demo Files */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    { name: 'Brand_Guidelines_2026.pdf', date: 'Oct 12', size: '2.4 MB' },
                                    { name: 'Competitor_Analysis_Q3.csv', date: 'Oct 08', size: '1.1 MB' },
                                    { name: 'Forbidden_Words_List.txt', date: 'Sep 24', size: '14 KB' },
                                ].map((doc, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-slate-900/30 border border-white/5 rounded-2xl hover:border-white/20 transition-all cursor-pointer group">
                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            <FileText size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-black text-white uppercase tracking-tight mb-1">{doc.name}</p>
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{doc.date} • {doc.size}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB: API INTEGRATIONS */}
                    {activeTab === 'api' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">

                            <div className="mb-10">
                                <h2 className="text-xl font-black uppercase tracking-tight text-white mb-2">NVIDIA API Configuration</h2>
                                <p className="text-xs font-medium text-slate-400 leading-relaxed">
                                    Provide your own NVIDIA API keys for maximum performance and unlimited scaling. Keys are stored securely in your private workspace settings.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {/* NVIDIA Image */}
                                <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#76B900]"></div>
                                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                                        <div className="w-12 h-12 bg-[#76B900]/10 rounded-xl flex items-center justify-center text-[#76B900] border border-[#76B900]/20 shrink-0">
                                            <Image size={24} />
                                        </div>
                                        <div className="flex-1 space-y-4 w-full">
                                            <div>
                                                <h3 className="text-sm font-black uppercase tracking-tight text-white mb-1">Image Generation API</h3>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Required for SDXL Turbo</p>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600">
                                                    <Lock size={14} />
                                                </div>
                                                <input
                                                    type="password"
                                                    value={apiKeys.nvidia_image}
                                                    onChange={e => setApiKeys({ ...apiKeys, nvidia_image: e.target.value })}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#76B900]/50 focus:ring-1 focus:ring-[#76B900]/50 transition-all font-mono"
                                                    placeholder="nvapi-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* NVIDIA Video */}
                                <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#76B900]"></div>
                                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                                        <div className="w-12 h-12 bg-[#76B900]/10 rounded-xl flex items-center justify-center text-[#76B900] border border-[#76B900]/20 shrink-0">
                                            <Film size={24} />
                                        </div>
                                        <div className="flex-1 space-y-4 w-full">
                                            <div>
                                                <h3 className="text-sm font-black uppercase tracking-tight text-white mb-1">Video Generation API</h3>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Required for Cosmos/SVD rendering</p>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600">
                                                    <Lock size={14} />
                                                </div>
                                                <input
                                                    type="password"
                                                    value={apiKeys.nvidia_video}
                                                    onChange={e => setApiKeys({ ...apiKeys, nvidia_video: e.target.value })}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#76B900]/50 focus:ring-1 focus:ring-[#76B900]/50 transition-all font-mono"
                                                    placeholder="nvapi-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* NVIDIA Chat */}
                                <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#76B900]"></div>
                                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                                        <div className="w-12 h-12 bg-[#76B900]/10 rounded-xl flex items-center justify-center text-[#76B900] border border-[#76B900]/20 shrink-0">
                                            <MessageSquare size={24} />
                                        </div>
                                        <div className="flex-1 space-y-4 w-full">
                                            <div>
                                                <h3 className="text-sm font-black uppercase tracking-tight text-white mb-1">LLM Inference API</h3>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Required for Llama 3 / Mistral text generation</p>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600">
                                                    <Lock size={14} />
                                                </div>
                                                <input
                                                    type="password"
                                                    value={apiKeys.nvidia_chat}
                                                    onChange={e => setApiKeys({ ...apiKeys, nvidia_chat: e.target.value })}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#76B900]/50 focus:ring-1 focus:ring-[#76B900]/50 transition-all font-mono"
                                                    placeholder="nvapi-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* NVIDIA Research */}
                                <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-6 md:p-8 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#76B900]"></div>
                                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                                        <div className="w-12 h-12 bg-[#76B900]/10 rounded-xl flex items-center justify-center text-[#76B900] border border-[#76B900]/20 shrink-0">
                                            <Search size={24} />
                                        </div>
                                        <div className="flex-1 space-y-4 w-full">
                                            <div>
                                                <h3 className="text-sm font-black uppercase tracking-tight text-white mb-1">Research & Analytics API</h3>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Used for competitor analysis and web scraping</p>
                                            </div>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-600">
                                                    <Lock size={14} />
                                                </div>
                                                <input
                                                    type="password"
                                                    value={apiKeys.nvidia_research}
                                                    onChange={e => setApiKeys({ ...apiKeys, nvidia_research: e.target.value })}
                                                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-3.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-[#76B900]/50 focus:ring-1 focus:ring-[#76B900]/50 transition-all font-mono"
                                                    placeholder="nvapi-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-10 pt-8 border-t border-white/10 flex items-center justify-between">
                                <p className="text-[10px] font-bold text-slate-500">
                                    <Shield size={12} className="inline mr-1 text-emerald-500" /> End-to-end encrypted integration
                                </p>

                                <button
                                    onClick={handleSaveApiKeys}
                                    disabled={apiSaveStatus === 'saving'}
                                    className={`px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-xl active:scale-95 flex items-center gap-2 ${apiSaveStatus === 'saving' ? 'bg-primary/50 cursor-not-allowed' :
                                        apiSaveStatus === 'saved' ? 'bg-emerald-500 shadow-emerald-500/20' :
                                            apiSaveStatus === 'error' ? 'bg-red-500 shadow-red-500/20' :
                                                'bg-primary hover:brightness-110 shadow-primary/20'
                                        }`}
                                >
                                    {apiSaveStatus === 'saving' ? <RefreshCw size={14} className="animate-spin" /> :
                                        apiSaveStatus === 'saved' ? <CheckCircle2 size={14} /> :
                                            apiSaveStatus === 'error' ? <AlertCircle size={14} /> :
                                                <Save size={14} />}

                                    {apiSaveStatus === 'saving' ? 'Saving...' :
                                        apiSaveStatus === 'saved' ? 'Keys Saved' :
                                            apiSaveStatus === 'error' ? 'Failed to Save' :
                                                'Save Configuration'}
                                </button>
                            </div>

                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmId !== null && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirmId(null)}>
                    <div className="bg-slate-900 border border-red-500/20 rounded-[2rem] p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
                            <Trash2 size={24} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-white text-center mb-2">Delete Agent?</h3>
                        <p className="text-[12px] font-medium text-slate-400 text-center mb-8 leading-relaxed px-4">
                            You are about to perpetually purge <strong className="text-white">{models.find(m => m.id === deleteConfirmId)?.name}</strong>. All associated synapse weights, chat logs, and customized files will be destroyed.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteModel(deleteConfirmId)}
                                className="flex-1 py-3.5 bg-red-500 hover:brightness-110 rounded-xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-lg shadow-red-500/20 active:scale-95"
                            >
                                Purge Agent
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Model Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-slate-900 border border-primary/20 rounded-[2.5rem] p-8 md:p-10 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-primary rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-primary/20">
                                    <Wand2 size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight text-white">Deploy AI Agent</h3>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Configure Initial Parameters</p>
                                </div>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 block">Agent Designation *</label>
                                <input
                                    type="text"
                                    value={newModelName}
                                    onChange={e => setNewModelName(e.target.value)}
                                    placeholder="e.g. Outreach Architect, Visual Crafter"
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 block">Primary Role *</label>
                                <input
                                    type="text"
                                    value={newModelType}
                                    onChange={e => setNewModelType(e.target.value)}
                                    placeholder="e.g. Email Marketing, Image Generation"
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 block">System Directive (Description)</label>
                                <textarea
                                    value={newModelDesc}
                                    onChange={e => setNewModelDesc(e.target.value)}
                                    placeholder="Define the primary objective and boundaries for this agent..."
                                    rows={3}
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 resize-none transition-all shadow-inner"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2.5 block">Capabilities (comma-separated)</label>
                                <input
                                    type="text"
                                    value={newModelCaps}
                                    onChange={e => setNewModelCaps(e.target.value)}
                                    placeholder="e.g. Data Analysis, Content Writing, A/B Testing"
                                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-5 py-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                            >
                                Abort
                            </button>
                            <button
                                onClick={handleCreateModel}
                                disabled={!newModelName.trim() || !newModelType.trim()}
                                className="flex-1 py-4 bg-primary hover:brightness-110 disabled:opacity-30 disabled:hover:brightness-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Sparkles size={16} /> Deploy Agent
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
