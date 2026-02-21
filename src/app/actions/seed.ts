import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function seedUserAnalytics() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const userId = user.id;

    // Check if already seeded
    const { data: existing } = await supabase
        .from("dashboard_stats")
        .select("id")
        .eq("user_id", userId)
        .limit(1);

    if (existing && existing.length > 0) {
        return { success: true, alreadySeeded: true };
    }

    // Seed dashboard stats
    await supabase.from("dashboard_stats").insert([
        { user_id: userId, label: "Followers Growth", value: "28.1k", change: "+14.2%", trend: "up", icon_name: "Users2" },
        { user_id: userId, label: "Engagement Rate", value: "5.10%", change: "+0.5%", trend: "up", icon_name: "Activity" },
        { user_id: userId, label: "Leads Generated", value: "1,452", change: "+4.1%", trend: "up", icon_name: "Filter" },
        { user_id: userId, label: "Conversion Rate", value: "3.8%", change: "+1.2%", trend: "up", icon_name: "ShoppingCart" },
        { user_id: userId, label: "Total Revenue", value: "$15,890", change: "+22.4%", trend: "up", icon_name: "Wallet" },
    ]);

    // Seed analytics growth chart data
    await supabase.from("analytics_series").insert([
        {
            user_id: userId, metric_name: "growth", time_range: "Last 7 Days",
            data_points: [
                { label: "Mon", value: 42 }, { label: "Tue", value: 61 }, { label: "Wed", value: 55 },
                { label: "Thu", value: 78 }, { label: "Fri", value: 83 }, { label: "Sat", value: 91 }, { label: "Sun", value: 74 }
            ]
        },
        {
            user_id: userId, metric_name: "growth", time_range: "Last 30 Days",
            data_points: [
                { label: "W1", value: 38 }, { label: "W2", value: 52 }, { label: "W3", value: 67 }, { label: "W4", value: 80 }
            ]
        },
        {
            user_id: userId, metric_name: "growth", time_range: "Last 90 Days",
            data_points: [
                { label: "Jan", value: 45 }, { label: "Feb", value: 58 }, { label: "Mar", value: 72 },
                { label: "Apr", value: 65 }, { label: "May", value: 81 }, { label: "Jun", value: 88 }
            ]
        },
        {
            user_id: userId, metric_name: "growth", time_range: "This Year",
            data_points: [
                { label: "Jan", value: 35 }, { label: "Feb", value: 42 }, { label: "Mar", value: 55 },
                { label: "Apr", value: 60 }, { label: "May", value: 52 }, { label: "Jun", value: 48 },
                { label: "Jul", value: 58 }, { label: "Aug", value: 65 }, { label: "Sep", value: 72 },
                { label: "Oct", value: 80 }, { label: "Nov", value: 90 }, { label: "Dec", value: 85 }
            ]
        },
    ]);

    // Seed audience insights
    await supabase.from("audience_insights").insert([
        {
            user_id: userId,
            category: "audience",
            data: {
                total: "85,420",
                new_followers: "+1,248",
                churn_rate: "0.82%",
                active_users: "12,504",
                age_range: "25-34",
                top_gender: "62% Female",
                income_level: "$45k-$75k",
                primary_language: "English",
                device_mobile: 68,
                device_desktop: 32,
                locations: [
                    { city: "Mumbai, India", val: 38 },
                    { city: "New York, USA", val: 24 },
                    { city: "London, UK", val: 18 },
                    { city: "Dubai, UAE", val: 12 },
                    { city: "Sydney, AU", val: 8 },
                ],
                platforms: [
                    { name: "Instagram", val: 75, count: "45k" },
                    { name: "Facebook", val: 55, count: "28k" },
                    { name: "Twitter/X", val: 35, count: "12k" },
                ],
                interests: ["Generative AI", "SaaS Tech", "Sustainability", "UX Design", "Digital Art", "Remote Work"],
            }
        },
        {
            user_id: userId,
            category: "roi",
            data: {
                marketing_roi: "$15,200",
                roi_change: "+18.5%",
                attributed_revenue: "$52,400",
                revenue_change: "+11.2%",
                ai_efficiency: "+28%",
                efficiency_change: "+6.1%",
                sentiment_score: 82,
                sentiment_label: "Positive",
            }
        },
    ]);

    // Seed connections (all Disconnected — user connects via OAuth in the Connections Hub)
    await supabase.from("connections_platforms").insert([
        { user_id: userId, platform_id: "instagram", name: "Instagram Business", color: "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600", status: "Disconnected", handle: null, last_synced: null, description: "Direct publishing & reel analytics integration.", icon_name: "Instagram" },
        { user_id: userId, platform_id: "facebook", name: "Facebook Ads", color: "bg-[#1877F2]", status: "Disconnected", handle: null, last_synced: null, description: "Enterprise ad manager & lead sync.", icon_name: "Facebook" },
        { user_id: userId, platform_id: "linkedin", name: "LinkedIn Company", color: "bg-[#0A66C2]", status: "Disconnected", handle: null, last_synced: null, description: "Professional networking & B2B reach.", icon_name: "Linkedin" },
        { user_id: userId, platform_id: "youtube", name: "YouTube Enterprise", color: "bg-[#FF0000]", status: "Disconnected", handle: null, last_synced: null, description: "Video delivery & channel growth engine.", icon_name: "Youtube" },
    ]);

    // Seed brand settings & preferences (ignore if exists)
    await supabase.from("brand_settings").upsert({
        user_id: userId,
        brand_name: "Aura Marketing",
        business_email: user.email || "hello@auramarketing.io",
        industry: "Marketing & Advertising",
        timezone: "Asia/Kolkata",
        description: "AI-powered marketing platform for creators and enterprises",
        ai_persona: "Professional",
        target_audience: "Digital Creators & SMBs",
        brand_font: "Inter Display",
    }, { onConflict: "user_id", ignoreDuplicates: true });

    await supabase.from("user_preferences").upsert({
        user_id: userId,
        email_notifications: true,
        push_notifications: true,
        weekly_digest: false,
        ai_suggestions: true,
    }, { onConflict: "user_id", ignoreDuplicates: true });

    console.log("[Seed] Analytics seeded successfully for", userId);
    return { success: true, alreadySeeded: false };
}
