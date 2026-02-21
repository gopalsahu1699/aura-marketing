'use client';

import React, { useState } from 'react';
import {
    Search as LucideSearch, Wand2, Image as LucideImage, Film,
    Mic as LucideMic, Upload as LucideUpload, Download as LucideDownload,
    Play, ChevronDown, Loader2 as LucideLoader, Sparkles as LucideSparkles,
    Type, Video, CheckCircle2, ChevronRight, Globe, Save
} from 'lucide-react';
import { generateChatContent, generateContentImage, generateContentVideo } from '@/app/actions/ai';
import { createBrowserClient } from '@/lib/supabase-client';

export default function AIContentStudioPage() {
    const [textPrompt, setTextPrompt] = useState("");
    const [generatedText, setGeneratedText] = useState("");
    const [isGeneratingText, setIsGeneratingText] = useState(false);

    const [imagePrompt, setImagePrompt] = useState("");
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    const [videoPrompt, setVideoPrompt] = useState("");
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [videoJobId, setVideoJobId] = useState<string | null>(null);

    const [activeConnections, setActiveConnections] = useState<any[]>([]);
    const [isPublishing, setIsPublishing] = useState<string | null>(null);
    const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
    const [activeTextType, setActiveTextType] = useState('Caption');
    const [brandVoiceActive, setBrandVoiceActive] = useState(false);
    const [showExportSuccess, setShowExportSuccess] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [textError, setTextError] = useState('');
    const [imageError, setImageError] = useState('');
    const [videoStatus, setVideoStatus] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const supabase = createBrowserClient();

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: connData } = await supabase.from('connections_platforms').select('*').eq('status', 'connected');
                if (connData) setActiveConnections(connData);

                const { data: histData } = await supabase.from('content_history').select('*').order('created_at', { ascending: false }).limit(10);
                if (histData) setHistory(histData);
            } catch (err) {
                console.warn(err);
            }
        };
        fetchData();
    }, []);

    const handleSaveHistory = async (type: string, prompt: string, content: string, status: 'Draft' | 'Published') => {
        try {
            const { data, error } = await supabase.from('content_history').insert([{
                content_type: type,
                prompt: prompt,
                generated_content: content,
                status: status,
                published_at: status === 'Published' ? new Date().toISOString() : null
            }]).select();
            if (error) throw error;
            if (data) setHistory(prev => [data[0], ...prev].slice(0, 10));
        } catch (err) {
            console.error('Failed to save content history', err);
        }
    };

    const handlePublish = async (type: string, prompt: string, content: string) => {
        setIsPublishing(type);
        setPublishSuccess(null);

        // Save to DB
        await handleSaveHistory(type, prompt, content, 'Published');

        // Simulate network publish delay
        setTimeout(() => {
            setIsPublishing(null);
            setPublishSuccess(type);
            setTimeout(() => setPublishSuccess(null), 3000);
        }, 1500);
    };

    const handleGenerateText = async () => {
        if (!textPrompt.trim()) {
            setTextError('Please enter a prompt first.');
            setTimeout(() => setTextError(''), 3000);
            return;
        }
        setTextError('');
        setIsGeneratingText(true);
        try {
            const typePrompt = activeTextType === 'Caption'
                ? `Generate a high-converting social media caption with hashtags and emojis for: ${textPrompt}`
                : activeTextType === 'Ad Copy'
                    ? `Write persuasive ad copy for: ${textPrompt}. Include a strong CTA.`
                    : `Write an engaging blog introduction for the topic: ${textPrompt}`;
            const { success, content, error } = await generateChatContent(typePrompt);
            if (success && content) {
                setGeneratedText(content);
                await handleSaveHistory('Text', textPrompt, content, 'Draft');
            } else {
                throw new Error(error);
            }
        } catch (error: any) {
            console.error(error);
            setTextError('Generation failed: ' + (error.message || 'Unknown error'));
            setTimeout(() => setTextError(''), 5000);
        } finally {
            setIsGeneratingText(false);
        }
    };

    const handleGenerateImage = async () => {
        if (!imagePrompt.trim()) {
            setImageError('Please describe the visual first.');
            setTimeout(() => setImageError(''), 3000);
            return;
        }
        setImageError('');
        setIsGeneratingImage(true);
        setPublishSuccess(null);
        try {
            const { success, url, error } = await generateContentImage(imagePrompt);
            if (success && url) {
                setGeneratedImage(url);
                await handleSaveHistory('Image', imagePrompt, url, 'Draft');
            } else {
                throw new Error(error);
            }
        } catch (error: any) {
            console.error(error);
            setImageError('Image generation failed: ' + (error.message || 'Try again'));
            setTimeout(() => setImageError(''), 5000);
        } finally {
            setIsGeneratingImage(false);
        }
    };

    const handleGenerateVideo = async () => {
        if (!videoPrompt.trim()) {
            setVideoStatus('⚠ Please describe the video first.');
            setTimeout(() => setVideoStatus(''), 3000);
            return;
        }
        setVideoStatus('');
        setIsGeneratingVideo(true);
        setPublishSuccess(null);
        try {
            const { success, job_id, error } = await generateContentVideo(videoPrompt);
            if (success && job_id) {
                setVideoJobId(job_id);
                setVideoStatus(`✓ Video queued! Job ID: ${job_id}`);
                await handleSaveHistory('Video', videoPrompt, `Job ID: ${job_id}`, 'Draft');
            } else {
                throw new Error(error);
            }
        } catch (error: any) {
            console.error(error);
            setVideoStatus('⚠ ' + (error.message || 'Video generation failed'));
        } finally {
            setIsGeneratingVideo(false);
        }
    };

    // Real export: downloads generated content as a text file
    const handleExport = () => {
        const parts: string[] = [];
        if (generatedText) parts.push('=== GENERATED TEXT ===\n' + generatedText);
        if (generatedImage) parts.push('=== GENERATED IMAGE URL ===\n' + generatedImage);
        if (videoJobId) parts.push('=== VIDEO JOB ID ===\n' + videoJobId);
        if (parts.length === 0) { setShowExportSuccess(false); return; }
        const blob = new Blob([parts.join('\n\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url;
        a.download = `aura-studio-content-${new Date().toISOString().split('T')[0]}.txt`;
        a.click(); URL.revokeObjectURL(url);
        setShowExportSuccess(true);
        setTimeout(() => setShowExportSuccess(false), 2500);
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
            {/* Header */}
            <header className="h-16 lg:h-20 flex items-center justify-between px-4 md:px-8 border-b border-primary/10 bg-background/80 backdrop-blur-md z-20 sticky top-0 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary group">
                        <Wand2 size={20} className="group-hover:rotate-12 transition-transform" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-xl font-black uppercase italic tracking-tight text-white leading-none">Studio Creator</h2>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1 hidden sm:block">NVIDIA AI Accelerated</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <div className="relative hidden md:block">
                        <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input className="pl-10 pr-4 py-2 bg-primary/5 border border-primary/10 rounded-full text-xs focus:ring-primary focus:border-primary w-64 font-medium" placeholder="Search templates..." type="text" />
                    </div>
                    <button
                        onClick={() => setBrandVoiceActive(!brandVoiceActive)}
                        className={`hidden sm:flex items-center gap-2 px-5 py-2.5 border rounded-xl text-xs font-black uppercase tracking-widest transition-all ${brandVoiceActive ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary'}`}
                    >
                        <LucideSparkles size={14} />
                        {brandVoiceActive ? 'Brand Voice On' : 'Apply Brand Voice'}
                    </button>
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className={`px-5 py-2.5 border rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${showHistory ? 'bg-white text-slate-900 border-white' : 'bg-primary/5 border-primary/20 text-primary hover:bg-primary/10'}`}
                    >
                        <LucideSearch size={14} />
                        History
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                    >
                        {showExportSuccess ? '✓ Saved!' : 'Export'}
                    </button>
                </div>
            </header>

            {/* History Sidebar/Drawer */}
            {showHistory && (
                <div className="absolute top-20 right-0 w-80 h-[calc(100vh-80px)] bg-slate-900/95 backdrop-blur-xl border-l border-white/10 z-30 p-6 animate-in slide-in-from-right duration-300">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-black uppercase italic tracking-widest text-white">Recent Artifacts</h3>
                        <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-white transition-colors">
                            <LucideSearch size={20} className="rotate-45" />
                        </button>
                    </div>

                    <div className="space-y-4 overflow-y-auto h-full pb-20 no-scrollbar">
                        {history.length === 0 ? (
                            <div className="text-center py-12">
                                <LucideSparkles className="mx-auto text-primary/30 mb-4" size={32} />
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">No history yet</p>
                            </div>
                        ) : (
                            history.map((item, idx) => (
                                <div key={item.id || idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl group hover:border-primary/50 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[9px] font-black bg-primary text-white px-2 py-0.5 rounded uppercase tracking-tighter">
                                            {item.content_type}
                                        </span>
                                        <span className="text-[8px] font-bold text-slate-500 uppercase">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-300 line-clamp-2 mb-2 italic">"{item.prompt}"</p>
                                    <div className="text-[10px] text-slate-400 line-clamp-3 bg-black/30 p-2 rounded-lg font-medium">
                                        {item.generated_content}
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <button
                                            onClick={async () => {
                                                await navigator.clipboard.writeText(item.generated_content);
                                                setCopiedId(item.id || String(idx));
                                                setTimeout(() => setCopiedId(null), 2000);
                                            }}
                                            className="flex-1 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[9px] font-black uppercase tracking-widest text-white transition-all"
                                        >
                                            {copiedId === (item.id || String(idx)) ? '✓ Copied' : 'Copy'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (item.content_type === 'Text') setGeneratedText(item.generated_content);
                                                if (item.content_type === 'Image') setGeneratedImage(item.generated_content);
                                                setShowHistory(false);
                                            }}
                                            className="flex-1 py-1.5 bg-primary/20 hover:bg-primary/30 rounded-lg text-[9px] font-black uppercase tracking-widest text-primary transition-all"
                                        >
                                            Load
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8 max-w-[1600px] mx-auto">

                    <div className="bg-primary/5 rounded-[2.5rem] border border-primary/10 flex flex-col p-8 shadow-sm group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Type size={24} /></div>
                            <h3 className="font-black uppercase italic tracking-tight">AI Text Generator</h3>
                        </div>

                        <div className="flex p-1 bg-primary/10 rounded-xl mb-6">
                            {['Caption', 'Ad Copy', 'Blog'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setActiveTextType(t)}
                                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTextType === t ? 'bg-primary text-white shadow-sm' : 'text-slate-400 hover:text-primary'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        <div className="relative mb-6 flex-1">
                            <textarea
                                value={textPrompt}
                                onChange={(e) => setTextPrompt(e.target.value)}
                                className="w-full h-48 bg-primary/3 border border-primary/10 rounded-2xl p-5 text-sm focus:ring-primary focus:border-primary resize-none placeholder:text-slate-400 font-medium"
                                placeholder={activeTextType === 'Caption' ? 'Summarize your campaign idea... (e.g. Luxury watch launch for summer)' : activeTextType === 'Ad Copy' ? 'Describe the product or service for an ad... (e.g. AI analytics SaaS platform)' : 'Enter a blog topic... (e.g. 5 Social Media Trends for 2024)'}
                            ></textarea>
                            {isGeneratingText && (
                                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                    <LucideLoader className="animate-spin text-primary" size={32} />
                                </div>
                            )}
                        </div>

                        {generatedText && (
                            <div className="mb-6 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                                    <p className="text-xs font-bold text-emerald-500 uppercase mb-2 flex items-center gap-2">
                                        <CheckCircle2 size={14} /> Generated Output
                                    </p>
                                    <p className="text-sm text-slate-300 leading-relaxed font-medium">{generatedText}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handlePublish('Text', textPrompt, generatedText)}
                                        disabled={isPublishing === 'Text'}
                                        className="flex-1 py-3 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-xl"
                                    >
                                        {isPublishing === 'Text' ? <LucideLoader className="animate-spin" size={14} /> : <Globe size={14} />}
                                        {publishSuccess === 'Text' ? 'Published!' : `Publish to ${activeConnections.length || 'All'} Channels`}
                                    </button>
                                </div>
                            </div>
                        )}

                        {textError && (
                            <p className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 mb-3">{textError}</p>
                        )}
                        <button
                            onClick={handleGenerateText}
                            disabled={isGeneratingText}
                            className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-primary/20"
                        >
                            {isGeneratingText ? <LucideLoader className="animate-spin" size={16} /> : <Wand2 size={14} />}
                            Generate Copy
                        </button>
                    </div>

                    {/* AI Image Generator */}
                    <div className="bg-primary/5 rounded-[2.5rem] border border-primary/10 flex flex-col p-8 shadow-sm group hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500"><LucideImage size={24} /></div>
                            <h3 className="font-black uppercase italic tracking-tight">AI Image Studio</h3>
                        </div>

                        <div className="space-y-6 mb-8 flex-1">
                            <div className="relative">
                                <LucideSearch className="absolute left-4 top-4 text-slate-400" size={16} />
                                <textarea
                                    value={imagePrompt}
                                    onChange={(e) => setImagePrompt(e.target.value)}
                                    className="w-full h-24 bg-primary/3 border border-primary/10 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-primary focus:border-primary resize-none placeholder:text-slate-400 font-medium"
                                    placeholder="Describe the visual... (e.g. A futuristic city at sunset, cinematic lighting)"
                                ></textarea>
                            </div>

                            <div className="space-y-3">
                                {/* Large Preview Area */}
                                <div className="relative w-full aspect-square rounded-2xl bg-primary/10 overflow-hidden border border-primary/10">
                                    {isGeneratingImage ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                            <LucideLoader className="animate-spin text-primary" size={32} />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Generating...</p>
                                        </div>
                                    ) : generatedImage ? (
                                        <div className="w-full h-full relative group/img">
                                            <img src={generatedImage} className="w-full h-full object-contain" alt="Generated" />
                                            {/* Hover action bar */}
                                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex gap-2">
                                                <a
                                                    href={generatedImage}
                                                    download="aura-generated-image.jpg"
                                                    className="flex-1 py-2.5 bg-white text-slate-900 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all"
                                                >
                                                    <LucideDownload size={12} /> Download
                                                </a>
                                                <button
                                                    onClick={() => handlePublish('Image', imagePrompt, generatedImage)}
                                                    disabled={isPublishing === 'Image'}
                                                    className="flex-1 py-2.5 bg-indigo-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg hover:brightness-110 transition-all"
                                                >
                                                    {isPublishing === 'Image' ? <LucideLoader className="animate-spin" size={12} /> : <Globe size={12} />}
                                                    {publishSuccess === 'Image' ? 'Published!' : 'Publish'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center gap-2 opacity-30">
                                            <LucideImage size={32} className="text-slate-400" />
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Preview will appear here</p>
                                        </div>
                                    )}
                                </div>

                                {/* Persistent action buttons below image when available */}
                                {generatedImage && (
                                    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                                        <a
                                            href={generatedImage}
                                            download="aura-generated-image.jpg"
                                            className="flex-1 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
                                        >
                                            <LucideDownload size={14} /> Download
                                        </a>
                                        <button
                                            onClick={() => handlePublish('Image', imagePrompt, generatedImage)}
                                            disabled={isPublishing === 'Image'}
                                            className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all"
                                        >
                                            {isPublishing === 'Image' ? <LucideLoader className="animate-spin" size={14} /> : <Globe size={14} />}
                                            {publishSuccess === 'Image' ? 'Published!' : 'Publish'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {imageError && (
                            <p className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 mb-3">{imageError}</p>
                        )}
                        <button
                            onClick={handleGenerateImage}
                            disabled={isGeneratingImage}
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-indigo-500/20"
                        >
                            {isGeneratingImage ? <LucideLoader className="animate-spin" size={16} /> : <LucideImage size={18} />}
                            Generate Visuals
                        </button>
                    </div>

                    {/* AI Video Generator */}
                    <div className="bg-primary/5 rounded-[2.5rem] border border-primary/10 flex flex-col p-8 shadow-sm group hover:border-primary/30 transition-all overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Film size={24} /></div>
                            <h3 className="font-black uppercase italic tracking-tight">AI Reel Generator</h3>
                        </div>

                        <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar pb-4">
                            <div className="relative">
                                <LucideSearch className="absolute left-4 top-4 text-slate-400" size={16} />
                                <textarea
                                    value={videoPrompt}
                                    onChange={(e) => setVideoPrompt(e.target.value)}
                                    className="w-full h-24 bg-primary/3 border border-primary/10 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-primary focus:border-primary resize-none placeholder:text-slate-400 font-medium"
                                    placeholder="Describe the video... (e.g. A 10-second high-energy product reveal with neon accents)"
                                ></textarea>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 bg-primary/3 border border-primary/10 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Video Script Outline</p>
                                    <div className="space-y-2">
                                        <div className="h-1.5 w-full bg-primary/10 rounded-full"></div>
                                        <div className="h-1.5 w-3/4 bg-primary/10 rounded-full"></div>
                                        <div className="h-1.5 w-5/6 bg-primary/10 rounded-full"></div>
                                    </div>
                                </div>

                                <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20 flex items-center gap-4">
                                    <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                        <Play size={18} fill="currentColor" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Cyber-Aura Beats</p>
                                        <p className="text-[9px] font-bold text-primary/70 uppercase">High Energy / 128 BPM</p>
                                    </div>
                                    <ChevronDown size={16} className="text-slate-400" />
                                </div>

                                <div className="relative pt-4 flex justify-center">
                                    <div className="w-40 aspect-[9/19.5] rounded-[2.5rem] border-[6px] border-slate-900 bg-black shadow-2xl relative overflow-hidden ring-4 ring-primary/5">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-4 bg-slate-900 rounded-b-xl z-20"></div>
                                        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent z-10"></div>
                                        <div className="absolute bottom-4 left-4 right-4 z-20 space-y-2">
                                            <div className="h-1 w-2/3 bg-white/40 rounded-full"></div>
                                            <div className="h-1 w-1/2 bg-white/40 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {videoStatus && (
                            <p className={`text-xs font-bold rounded-xl px-4 py-2 mb-3 ${videoStatus.startsWith('✓') ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-red-400 bg-red-500/10 border border-red-500/20'}`}>{videoStatus}</p>
                        )}
                        <button
                            onClick={handleGenerateVideo}
                            disabled={isGeneratingVideo}
                            className="w-full py-4 mt-6 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                        >
                            {isGeneratingVideo ? <LucideLoader className="animate-spin" size={16} /> : <Video size={18} />}
                            Render Reel
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
