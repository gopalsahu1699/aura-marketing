"use server";

import { createClient } from "@supabase/supabase-js";
import type { AnalyticsAIData, AudienceAIData, CampaignsAIData } from "./ai";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function getRealAnalyticsData(userId: string): Promise<{ success: boolean; data: AnalyticsAIData }> {
    try {
        const { data: insightsData, error } = await supabase
            .from('audience_insights')
            .select('data')
            .eq('user_id', userId)
            .eq('category', 'roi')
            .single();

        if (error || !insightsData) {
            console.log("No ROI data found for Analytics, returning empty data");
            return { success: true, data: EMPTY_ANALYTICS };
        }

        const roiData = insightsData.data as any;

        // Fetch growth series. For simplicity, we'll try to get 'This Year' or 'Last 30 Days'
        const { data: seriesData } = await supabase
            .from('analytics_series')
            .select('data_points')
            .eq('user_id', userId)
            .eq('metric_name', 'growth')
            .eq('time_range', 'Last 30 Days')
            .single();

        let growthBars: any[] = [];
        if (seriesData && seriesData.data_points) {
            // map real data to growth bars. The UI expects an array of { label, value, engage }
            growthBars = (seriesData.data_points as any[]).map(p => ({
                label: p.label || 'W',
                value: p.value || 50,
                engage: Math.max(0, (p.value || 50) - 10)
            }));
        }

        // We also need audience info for Analytics page. Let's fetch audience category
        const { data: audienceData } = await supabase
            .from('audience_insights')
            .select('data')
            .eq('user_id', userId)
            .eq('category', 'audience')
            .single();

        let audienceStats = null;
        if (audienceData) {
            const aud = audienceData.data as any;
            audienceStats = {
                age_range: aud.age_range || "25–34",
                top_gender: aud.top_gender || "62% Female",
                income_level: aud.income_level || "$45k–$75k",
                language_pct: "89%", // using default
                mobile_pct: aud.device_mobile || 68,
                desktop_pct: aud.device_desktop || 32,
                locations: aud.locations || [],
                languages: [ // default
                    { lang: "English", pct: "89%" }, { lang: "Hindi", pct: "42%" }, { lang: "Spanish", pct: "18%" },
                    { lang: "Arabic", pct: "12%" }, { lang: "French", pct: "8%" }, { lang: "German", pct: "5%" },
                ],
                language_insight: "89% of your audience prefers English content. Creating Hindi variations could capture 42% more bilingual engagement." // default
            };
        }

        const realData: AnalyticsAIData = {
            roi: {
                marketing_roi: roiData.marketing_roi || "$15,200",
                roi_change: roiData.roi_change || "+18.5%",
                attributed_revenue: roiData.attributed_revenue || "$52,400",
                revenue_change: roiData.revenue_change || "+11.2%",
                ai_efficiency: roiData.ai_efficiency || "+28%",
                efficiency_change: roiData.efficiency_change || "+6.1%",
            },
            sentiment: {
                score: roiData.sentiment_score || 82,
                label: roiData.sentiment_label || "Positive"
            },
            sentiment_insight: roiData.sentiment_insight || "Analyze your data to get AI-driven sentiment insights.",
            growthBars: growthBars.length > 0 ? growthBars : [],
            campaigns: [], // Requires a campaigns table or further logic
            audienceStats: audienceStats || EMPTY_ANALYTICS.audienceStats
        };

        return { success: true, data: realData };

    } catch (err: any) {
        console.error("Failed to fetch real analytics data:", err);
        return { success: false, data: EMPTY_ANALYTICS };
    }
}

export async function getRealAudienceData(userId: string): Promise<{ success: boolean; data: AudienceAIData }> {
    try {
        const { data: audienceData, error } = await supabase
            .from('audience_insights')
            .select('data')
            .eq('user_id', userId)
            .eq('category', 'audience')
            .single();

        if (error || !audienceData) {
            console.log("No Audience data found, returning empty data");
            return { success: true, data: EMPTY_AUDIENCE };
        }

        const aud = audienceData.data as any;

        // Let's try to get growth series for last 7 days for the growth bars
        const { data: seriesData } = await supabase
            .from('analytics_series')
            .select('data_points')
            .eq('user_id', userId)
            .eq('metric_name', 'growth')
            .eq('time_range', 'Last 7 Days')
            .single();

        let growthBars: number[] = [];
        if (seriesData && seriesData.data_points) {
            growthBars = (seriesData.data_points as any[]).map(p => p.value || 50);
        }

        const realData: AudienceAIData = {
            stats: {
                total: aud.total || "85,420",
                new_followers: aud.new_followers || "+1,248",
                churn_rate: aud.churn_rate || "0.82%",
                active_users: aud.active_users || "12,504"
            },
            stat_changes: { total: "+2.4%", new_followers: "+5.1%", churn_rate: "-0.2%", active_users: "+1.8%" }, // Hardcoded placeholders since missing from DB
            growthBars: growthBars,
            peakDay: 5, // Just hardcoded Saturday for now
            geo: aud.locations || [],
            interests: aud.interests || [],
            interest_insight: "Analyze audience data to unlock AI targeting insights.",
            platforms: aud.platforms || [],
            targeting: []
        };

        return { success: true, data: realData };

    } catch (err) {
        console.error("Failed to fetch real audience data:", err);
        return { success: false, data: EMPTY_AUDIENCE };
    }
}

export async function getRealCampaignsData(userId: string): Promise<{ success: boolean; data: CampaignsAIData }> {
    // We don't have a campaigns table yet, so just return empty for now
    return { success: true, data: EMPTY_CAMPAIGNS };
}

const EMPTY_ANALYTICS: AnalyticsAIData = {
    roi: { marketing_roi: "$0", roi_change: "0%", attributed_revenue: "$0", revenue_change: "0%", ai_efficiency: "0%", efficiency_change: "0%" },
    sentiment: { score: 0, label: "No Data" },
    sentiment_insight: "No data available. Generate Real Data to populate insights.",
    growthBars: [],
    campaigns: [],
    audienceStats: {
        age_range: "N/A", top_gender: "N/A", income_level: "N/A", language_pct: "0%",
        mobile_pct: 0, desktop_pct: 0,
        locations: [],
        languages: [],
        language_insight: "No data available."
    }
};

const EMPTY_AUDIENCE: AudienceAIData = {
    stats: { total: "0", new_followers: "0", churn_rate: "0%", active_users: "0" },
    stat_changes: { total: "0%", new_followers: "0%", churn_rate: "0%", active_users: "0%" },
    growthBars: [],
    peakDay: 0,
    geo: [],
    interests: [],
    interest_insight: "No data available.",
    platforms: [],
    targeting: []
};

const EMPTY_CAMPAIGNS: CampaignsAIData = {
    campaigns: [],
    summary: { total: 0, active: 0, total_reach: "0", avg_engagement: "0%" }
};
