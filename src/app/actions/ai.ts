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

// ─── Fallback data (used if AI parse fails) ──────────────────────────────────

const FALLBACK_DATA: DashboardAIData = {
    stats: [
        { label: "Followers Growth", value: "28.1k", change: "+14.2%", trend: "up", icon_name: "Users2" },
        { label: "Engagement Rate", value: "5.10%", change: "+0.5%", trend: "up", icon_name: "Activity" },
        { label: "Leads Generated", value: "1,452", change: "+4.1%", trend: "up", icon_name: "Filter" },
        { label: "Conversion Rate", value: "3.8%", change: "+1.2%", trend: "up", icon_name: "ShoppingCart" },
        { label: "Total Revenue", value: "$15,890", change: "+22.4%", trend: "up", icon_name: "Wallet" },
    ],
    forecast: Array.from({ length: 30 }, (_, i) => ({
        day: i + 1,
        value: Math.round(40 + i * 2.1 + Math.sin(i * 0.4) * 6),
    })),
    activity: [
        { title: "Campaign 'Aura Alpha' Trending", platform: "Instagram", time: "2 mins ago", color: "bg-emerald-500" },
        { title: "High-Value Lead Identified", platform: "CRM", time: "15 mins ago", color: "bg-primary" },
        { title: "Model Retraining Complete", platform: "Persona Engine", time: "1h ago", color: "bg-blue-500" },
    ],
    notifications: [
        { title: "Campaign 'Summer Launch' reached 10K impressions", time: "2m ago", read: false },
        { title: "Engagement rate increased by 12% this week", time: "1h ago", read: false },
        { title: "New follower milestone: 25K followers!", time: "3h ago", read: false },
        { title: "AI analysis completed for Q4 strategy", time: "1d ago", read: true },
    ],
};

// ─── Main Action ─────────────────────────────────────────────────────────────

export async function getDashboardAIData(): Promise<{ success: boolean; data: DashboardAIData }> {
    const prompt = `You are an AI marketing analytics engine. Generate a realistic, data-rich enterprise marketing dashboard snapshot for a mid-sized SaaS marketing agency called "Aura Marketing" for the last 30 days.

Return ONLY a valid JSON object with NO markdown, NO code fences, and NO explanation. The JSON must strictly follow this structure:

{
  "stats": [
    { "label": "Followers Growth", "value": "28.4k", "change": "+14.2%", "trend": "up", "icon_name": "Users2" },
    { "label": "Engagement Rate", "value": "5.32%", "change": "+0.8%", "trend": "up", "icon_name": "Activity" },
    { "label": "Leads Generated", "value": "1,621", "change": "+6.3%", "trend": "up", "icon_name": "Filter" },
    { "label": "Conversion Rate", "value": "4.1%", "change": "-0.3%", "trend": "down", "icon_name": "ShoppingCart" },
    { "label": "Total Revenue", "value": "$18,240", "change": "+19.7%", "trend": "up", "icon_name": "Wallet" }
  ],
  "forecast": [
    { "day": 1, "value": 42 }, { "day": 2, "value": 45 }, ...up to day 30
  ],
  "activity": [
    { "title": "Campaign 'Aura Alpha' reached 50K impressions", "platform": "Instagram", "time": "3 mins ago", "color": "bg-emerald-500" },
    { "title": "High-value lead from SaaS sector identified", "platform": "LinkedIn", "time": "18 mins ago", "color": "bg-primary" },
    { "title": "AI persona model retrained with new dataset", "platform": "Persona Engine", "time": "1h ago", "color": "bg-blue-500" }
  ],
  "notifications": [
    { "title": "Campaign 'Aura Alpha' hit 50K impressions milestone", "time": "3m ago", "read": false },
    { "title": "Engagement rate up 14% — best week this quarter", "time": "45m ago", "read": false },
    { "title": "New follower milestone: 28K total followers!", "time": "2h ago", "read": false },
    { "title": "AI content analysis for Q1 strategy completed", "time": "8h ago", "read": true }
  ]
}

Rules:
- forecast values should start around 38-45 and grow realistically to 85-100 by day 30 with natural ups and downs
- Use real-sounding marketing metrics for a growing SaaS agency
- activity titles should be specific and compelling
- Return ONLY the JSON object, nothing else`;

    try {
        const raw = await nvidia.marketResearch(prompt, "meta/llama-3.3-70b-instruct");

        // Extract JSON from response (strip any surrounding markdown/text)
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON found in response");

        const parsed = JSON.parse(jsonMatch[0]) as DashboardAIData;

        // Validate required fields
        if (!parsed.stats || !parsed.forecast || !parsed.activity || !parsed.notifications) {
            throw new Error("Missing required fields in AI response");
        }

        return { success: true, data: parsed };
    } catch (err) {
        console.warn("[getDashboardAIData] AI parse failed, using fallback:", err);
        return { success: false, data: FALLBACK_DATA };
    }
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

const ANALYTICS_FALLBACK: AnalyticsAIData = {
    roi: { marketing_roi: "$15,200", roi_change: "+18.5%", attributed_revenue: "$52,400", revenue_change: "+11.2%", ai_efficiency: "+28%", efficiency_change: "+6.1%" },
    sentiment: { score: 82, label: "Positive" },
    sentiment_insight: "Strong positive brand sentiment driven by 'Innovation' and 'Speed' — customers perceive Aura as a market leader. Recommend amplifying these themes across all channels to widen competitive advantage.",
    growthBars: [
        { label: "Mon", value: 62, engage: 48 }, { label: "Tue", value: 58, engage: 44 },
        { label: "Wed", value: 75, engage: 60 }, { label: "Thu", value: 82, engage: 65 },
        { label: "Fri", value: 91, engage: 72 }, { label: "Sat", value: 70, engage: 55 },
        { label: "Sun", value: 68, engage: 50 }, { label: "Mon", value: 85, engage: 68 },
        { label: "Tue", value: 78, engage: 62 }, { label: "Wed", value: 95, engage: 80 },
    ],
    campaigns: [
        { id: 1, title: "Aura Brand Awareness Blitz", platform: "Instagram", format: "Reels", change: "+24%", likes: "3.8k", shares: "620", views: "128k", imageKeyword: "marketing" },
        { id: 2, title: "Summer Growth Sprint Campaign", platform: "TikTok", format: "Short Video", change: "+19%", likes: "5.2k", shares: "940", views: "210k", imageKeyword: "social-media" },
        { id: 3, title: "AI Tools Lead Generation", platform: "LinkedIn", format: "Sponsored", change: "+31%", likes: "1.1k", shares: "280", views: "52k", imageKeyword: "technology" },
        { id: 4, title: "Community Engagement Drive", platform: "Facebook", format: "Carousel", change: "+15%", likes: "2.4k", shares: "410", views: "88k", imageKeyword: "community" },
    ],
    audienceStats: {
        age_range: "25–34", top_gender: "62% Female", income_level: "$45k–$75k", language_pct: "89%",
        mobile_pct: 68, desktop_pct: 32,
        locations: [
            { city: "Mumbai, India", val: 38 }, { city: "New York, USA", val: 24 },
            { city: "London, UK", val: 18 }, { city: "Dubai, UAE", val: 12 }, { city: "Sydney, AU", val: 8 },
        ],
        languages: [
            { lang: "English", pct: "89%" }, { lang: "Hindi", pct: "42%" }, { lang: "Spanish", pct: "18%" },
            { lang: "Arabic", pct: "12%" }, { lang: "French", pct: "8%" }, { lang: "German", pct: "5%" },
        ],
        language_insight: "89% of your audience prefers English content. Creating Hindi variations could capture 42% more bilingual engagement.",
    },
};

export async function getAnalyticsAIData(): Promise<{ success: boolean; data: AnalyticsAIData }> {
    const prompt = `You are an AI marketing analytics engine for "Aura Marketing", a growing SaaS marketing agency.
Generate a realistic, data-rich analytics report for the last 30 days. Return ONLY valid JSON — no markdown, no code fences.

{
  "roi": {
    "marketing_roi": "$17,400",
    "roi_change": "+21.2%",
    "attributed_revenue": "$58,200",
    "revenue_change": "+13.5%",
    "ai_efficiency": "+31%",
    "efficiency_change": "+7.4%"
  },
  "sentiment": { "score": 84, "label": "Very Positive" },
  "sentiment_insight": "2-sentence insight about current brand sentiment with one strategic recommendation (max 60 words)",
  "growthBars": [
    { "label": "Mon", "value": 65, "engage": 50 },
    ... 10 items total, values 35-95, realistic weekly pattern
  ],
  "campaigns": [
    {
      "id": 1, "title": "Aura Q1 Brand Sprint", "platform": "Instagram", "format": "Reels",
      "change": "+28%", "likes": "4.2k", "shares": "780", "views": "156k", "imageKeyword": "marketing"
    },
    ... 4 campaigns total with unique real-sounding titles
  ],
  "audienceStats": {
    "age_range": "25–34", "top_gender": "64% Female", "income_level": "$50k–$80k", "language_pct": "91%",
    "mobile_pct": 71, "desktop_pct": 29,
    "locations": [
      { "city": "Mumbai, India", "val": 36 }, { "city": "New York, USA", "val": 26 },
      { "city": "London, UK", "val": 19 }, { "city": "Dubai, UAE", "val": 11 }, { "city": "Sydney, AU", "val": 8 }
    ],
    "languages": [
      { "lang": "English", "pct": "91%" }, { "lang": "Hindi", "pct": "44%" },
      { "lang": "Spanish", "pct": "20%" }, { "lang": "Arabic", "pct": "13%" },
      { "lang": "French", "pct": "9%" }, { "lang": "German", "pct": "6%" }
    ],
    "language_insight": "One specific AI-generated insight about language preferences and content optimization opportunity (max 30 words)"
  }
}

Rules: realistic SaaS agency numbers, unique campaign titles, sentiment_insight must reference specific data points. Return ONLY the JSON object.`;

    try {
        const raw = await nvidia.marketResearch(prompt, "meta/llama-3.3-70b-instruct");
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("No JSON in response");
        const parsed = JSON.parse(match[0]) as AnalyticsAIData;
        if (!parsed.roi || !parsed.growthBars || !parsed.campaigns) throw new Error("Missing fields");
        return { success: true, data: parsed };
    } catch (err) {
        console.warn("[getAnalyticsAIData] fallback:", err);
        return { success: false, data: ANALYTICS_FALLBACK };
    }
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

const AUDIENCE_FALLBACK: AudienceAIData = {
    stats: { total: "85,420", new_followers: "+1,248", churn_rate: "0.82%", active_users: "12,504" },
    stat_changes: { total: "+2.4%", new_followers: "+5.1%", churn_rate: "-0.2%", active_users: "+1.8%" },
    growthBars: [40, 55, 45, 65, 80, 70, 85],
    peakDay: 4,
    geo: [{ country: "United States", val: 42 }, { country: "United Kingdom", val: 28 }, { country: "Germany", val: 15 }, { country: "India", val: 10 }, { country: "Australia", val: 5 }],
    interests: ["Generative AI", "SaaS Tech", "Sustainability", "UX Design", "Digital Art", "Remote Work"],
    interest_insight: "AI identifies a 15% increase in affinity for #GreenTech among your newest followers this week.",
    platforms: [{ name: "Instagram", val: 75, count: "45k" }, { name: "Facebook", val: 55, count: "28k" }, { name: "Twitter", val: 35, count: "12k" }],
    targeting: [
        { title: "Retarget London Tech Segment", desc: "High engagement detected from London-based tech users. Launch a video sequence now.", btn: "Launch Campaign", href: "/dashboard/campaigns" },
        { title: "FB Churn Recovery", desc: "Churn up 0.5% on Facebook. AI recommends a re-engagement carousel campaign.", btn: "Create Content", href: "/dashboard/content" },
    ],
};

export async function getAudienceAIData(): Promise<{ success: boolean; data: AudienceAIData }> {
    const prompt = `You are an AI audience analytics engine for "Aura Marketing". Generate realistic audience insights for the last 30 days. Return ONLY valid JSON — no markdown, no code fences.

{
  "stats": { "total": "87,240", "new_followers": "+1,520", "churn_rate": "0.74%", "active_users": "13,180" },
  "stat_changes": { "total": "+3.1%", "new_followers": "+6.2%", "churn_rate": "-0.3%", "active_users": "+2.4%" },
  "growthBars": [42, 58, 51, 70, 88, 74, 82],
  "peakDay": 4,
  "geo": [
    { "country": "United States", "val": 44 },
    { "country": "United Kingdom", "val": 26 },
    { "country": "India", "val": 16 },
    { "country": "Germany", "val": 9 },
    { "country": "Australia", "val": 5 }
  ],
  "interests": ["Generative AI", "SaaS Tools", "Sustainability", "UX Design", "Digital Marketing", "Remote Work", "Fintech"],
  "interest_insight": "Concise AI insight about top trending interest this week among new followers (max 25 words)",
  "platforms": [
    { "name": "Instagram", "val": 78, "count": "47k" },
    { "name": "Facebook", "val": 52, "count": "26k" },
    { "name": "Twitter", "val": 32, "count": "14k" }
  ],
  "targeting": [
    { "title": "Retarget High-Intent Segment", "desc": "Specific AI-detected audience signal with action recommendation (max 20 words)", "btn": "Launch Campaign", "href": "/dashboard/campaigns" },
    { "title": "Churn Risk Recovery", "desc": "Specific churn signal with AI content recommendation (max 20 words)", "btn": "Create Content", "href": "/dashboard/content" }
  ]
}

Rules: realistic growing SaaS agency numbers, peakDay is the index (0=Mon) of the highest growthBars value, targeting titles must be specific. Return ONLY the JSON.`;

    try {
        const raw = await nvidia.marketResearch(prompt, "meta/llama-3.3-70b-instruct");
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("No JSON in response");
        const parsed = JSON.parse(match[0]) as AudienceAIData;
        if (!parsed.stats || !parsed.growthBars) throw new Error("Missing fields");
        return { success: true, data: parsed };
    } catch (err) {
        console.warn("[getAudienceAIData] fallback:", err);
        return { success: false, data: AUDIENCE_FALLBACK };
    }
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

const CAMPAIGNS_FALLBACK: CampaignsAIData = {
    campaigns: [
        { id: 1, name: "Aura Q1 Brand Sprint", status: "active", platform: "Instagram", budget: "$2,400", spent: "$1,284", reach: "45.2k", engagement: "6.8%", progress: 54, insight: "Reels outperforming static posts by 2.3×. Consider shifting 20% budget to video." },
        { id: 2, name: "SaaS Growth Drive", status: "scheduled", platform: "LinkedIn", budget: "$1,800", spent: "$0", reach: "--", engagement: "--", progress: 0, insight: "Scheduled for Monday launch. B2B audience peaks Tuesday–Thursday 10AM–2PM." },
        { id: 3, name: "Product Launch Q4", status: "paused", platform: "Facebook", budget: "$3,200", spent: "$2,900", reach: "12.1k", engagement: "4.2%", progress: 90, insight: "Paused due to high frequency cap. Resume after 3-day rest window." },
        { id: 4, name: "Holiday Engagement Wave", status: "completed", platform: "All", budget: "$5,000", spent: "$4,978", reach: "112k", engagement: "8.1%", progress: 100, insight: "Top campaign this quarter. Reuse audience segments for next seasonal push." },
    ],
    summary: { total: 4, active: 1, total_reach: "169.3k", avg_engagement: "6.4%" },
};

export async function getCampaignsAIData(): Promise<{ success: boolean; data: CampaignsAIData }> {
    const prompt = `You are an AI campaign analytics engine for "Aura Marketing", a growing SaaS marketing agency. Generate a realistic campaigns report. Return ONLY valid JSON — no markdown, no code fences.

{
  "campaigns": [
    {
      "id": 1, "name": "Aura Q1 Brand Sprint", "status": "active", "platform": "Instagram",
      "budget": "$2,400", "spent": "$1,284", "reach": "45.2k", "engagement": "6.8%", "progress": 54,
      "insight": "One specific AI insight + recommendation for this campaign (max 15 words)"
    },
    {
      "id": 2, "name": "SaaS Growth Drive", "status": "scheduled", "platform": "LinkedIn",
      "budget": "$1,800", "spent": "$0", "reach": "--", "engagement": "--", "progress": 0,
      "insight": "One specific pre-launch AI recommendation (max 15 words)"
    },
    {
      "id": 3, "name": "Performance Max Q4", "status": "paused", "platform": "Facebook",
      "budget": "$3,200", "spent": "$2,900", "reach": "12.1k", "engagement": "4.2%", "progress": 90,
      "insight": "One specific AI insight about why paused + next action (max 15 words)"
    },
    {
      "id": 4, "name": "Holiday Engagement Wave", "status": "completed", "platform": "All",
      "budget": "$5,000", "spent": "$4,978", "reach": "112k", "engagement": "8.1%", "progress": 100,
      "insight": "One specific post-campaign AI insight + reuse recommendation (max 15 words)"
    }
  ],
  "summary": {
    "total": 4, "active": 1,
    "total_reach": "169.3k", "avg_engagement": "6.4%"
  }
}

Rules: realistic SaaS agency numbers, unique campaign names (not generic), insights must reference specific data. Return ONLY the JSON object.`;

    try {
        const raw = await nvidia.marketResearch(prompt, "meta/llama-3.3-70b-instruct");
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) throw new Error("No JSON in response");
        const parsed = JSON.parse(match[0]) as CampaignsAIData;
        if (!parsed.campaigns || !parsed.summary) throw new Error("Missing fields");
        return { success: true, data: parsed };
    } catch (err) {
        console.warn("[getCampaignsAIData] fallback:", err);
        return { success: false, data: CAMPAIGNS_FALLBACK };
    }
}
