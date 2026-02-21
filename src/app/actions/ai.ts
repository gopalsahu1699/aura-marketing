"use server";

import { nvidia, NvidiaModel } from "@/lib/nvidia-api";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DashboardStat {
    label: string;
    value: string;
    change: string;
    trend: "up" | "down";
    icon_name: string;
}

export interface ForecastPoint {
    day: number;
    value: number;
}

export interface ActivityEvent {
    title: string;
    platform: string;
    time: string;
    color: string; // tailwind color class e.g. "bg-emerald-500"
}

export interface DashboardNotification {
    title: string;
    time: string;
    read: boolean;
}

export interface DashboardAIData {
    stats: DashboardStat[];
    forecast: ForecastPoint[];
    activity: ActivityEvent[];
    notifications: DashboardNotification[];
}



export async function generateChatContent(prompt: string, model?: NvidiaModel) {
    try {
        const content = await nvidia.chat(prompt, model);
        return { success: true, content };
    } catch (error: any) {
        console.error("AI Chat Error:", error);
        return { success: false, error: error.message };
    }
}

export async function runMarketResearch(prompt: string, model?: NvidiaModel) {
    try {
        const content = await nvidia.marketResearch(prompt, model);
        return { success: true, content };
    } catch (error: any) {
        console.error("AI Market Research Error:", error);
        return { success: false, error: error.message };
    }
}

export async function generateContentImage(prompt: string) {
    try {
        const url = await nvidia.generateImage(prompt);
        return { success: true, url };
    } catch (error: any) {
        console.error("AI Image Error:", error);
        return { success: false, error: error.message };
    }
}

export async function generateContentVideo(prompt: string) {
    try {
        const result = await nvidia.generateVideo(prompt);
        return { success: true, job_id: result.job_id };
    } catch (error: any) {
        console.error("AI Video Error:", error);
        return { success: false, error: error.message };
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics Hub AI Data
// ─────────────────────────────────────────────────────────────────────────────

export interface AnalyticsROI {
    marketing_roi: string;
    roi_change: string;
    attributed_revenue: string;
    revenue_change: string;
    ai_efficiency: string;
    efficiency_change: string;
}

export interface AnalyticsGrowthBar {
    label: string;
    value: number;   // 0-100 percentage
    engage: number;  // 0-100 percentage
}

export interface AnalyticsCampaign {
    id: number;
    title: string;
    platform: string;
    format: string;
    change: string;
    likes: string;
    shares: string;
    views: string;
    imageKeyword: string;
}

export interface AnalyticsAIData {
    roi: AnalyticsROI;
    sentiment: { score: number; label: string };
    sentiment_insight: string;
    growthBars: AnalyticsGrowthBar[];
    campaigns: AnalyticsCampaign[];
    audienceStats: {
        age_range: string; top_gender: string;
        income_level: string; language_pct: string;
        mobile_pct: number; desktop_pct: number;
        locations: { city: string; val: number }[];
        languages: { lang: string; pct: string }[];
        language_insight: string;
    };
}



// ─────────────────────────────────────────────────────────────────────────────
// Audience Insights AI Data
// ─────────────────────────────────────────────────────────────────────────────

export interface AudienceAIData {
    stats: { total: string; new_followers: string; churn_rate: string; active_users: string };
    stat_changes: { total: string; new_followers: string; churn_rate: string; active_users: string };
    growthBars: number[];  // 7 values 0-100, one per day Mon-Sun
    peakDay: number;       // index of highest bar (0-6)
    geo: { country: string; val: number }[];
    interests: string[];
    interest_insight: string;
    platforms: { name: string; val: number; count: string }[];
    targeting: { title: string; desc: string; btn: string; href: string }[];
}


// ─── Campaigns AI Data ───────────────────────────────────────────────────────

export interface CampaignItem {
    id: number;
    name: string;
    status: 'active' | 'scheduled' | 'paused' | 'completed';
    platform: string;
    budget: string;
    spent: string;
    reach: string;
    engagement: string;
    progress: number;
    insight: string;
}

export interface CampaignsAIData {
    campaigns: CampaignItem[];
    summary: {
        total: number;
        active: number;
        total_reach: string;
        avg_engagement: string;
    };
}


