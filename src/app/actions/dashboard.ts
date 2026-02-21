"use server";

import { createClient } from "@supabase/supabase-js";
import type { DashboardStat, ForecastPoint } from "./ai";

// Initialize admin client for server actions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function getRealDashboardData(userId: string, timeRange: string = '30 Days') {
    try {
        // 1. Fetch KPI Stats
        const { data: statsData, error: statsError } = await supabase
            .from('dashboard_stats')
            .select('*')
            .eq('user_id', userId)
            .order('id', { ascending: true });

        if (statsError) throw statsError;

        // 2. Fetch Chart Data (Forecast/Series)
        // We look for metric_name = 'growth' and the requested time_range
        // Map UI dropdown ('7 Days', '30 Days') to DB time_range ('Last 7 Days', 'Last 30 Days')
        const dbTimeRange = timeRange === 'This Year' ? 'This Year' : `Last ${timeRange}`;

        const { data: seriesData, error: seriesError } = await supabase
            .from('analytics_series')
            .select('data_points')
            .eq('user_id', userId)
            .eq('metric_name', 'growth')
            .eq('time_range', dbTimeRange)
            .single();

        if (seriesError && seriesError.code !== 'PGRST116') { // Ignore "0 rows" error
            console.error("Error fetching series:", seriesError);
        }

        // 3. Format Stats for UI
        const formattedStats: DashboardStat[] = statsData ? statsData.map((s: any) => ({
            label: s.label,
            value: s.value,
            change: s.change,
            trend: s.trend as "up" | "down",
            icon_name: s.icon_name
        })) : [];

        // 4. Format Chart for UI
        let formattedForecast: ForecastPoint[] = [];
        if (seriesData && seriesData.data_points) {
            formattedForecast = (seriesData.data_points as any[]).map((p: any, index: number) => ({
                day: index + 1,
                value: p.value
            }));
        }

        return {
            success: true,
            data: {
                stats: formattedStats,
                forecast: formattedForecast
            }
        };

    } catch (error: any) {
        console.error("Failed to fetch real dashboard data:", error);
        return { success: false, error: error.message };
    }
}
