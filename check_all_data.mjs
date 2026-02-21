import { createClient } from "@supabase/supabase-js";

// Initialize admin client for server actions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRows() {
    const { data: stats } = await supabase.from('dashboard_stats').select('*');
    const { data: series } = await supabase.from('analytics_series').select('*');

    console.log("ALL STATS ROWS:", stats);
    console.log("ALL SERIES ROWS:", series?.map(s => ({ ...s, data_points: 'omitted for length' })));
}

checkRows();
