import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data: users, error: ue } = await supabase.auth.admin.listUsers();
    if (ue || !users.users[0]) return console.log("No users", ue);
    const user = users.users[0];

    const { data: stats } = await supabase.from('dashboard_stats').select('*').eq('user_id', user.id);
    const { data: series } = await supabase.from('analytics_series').select('*').eq('user_id', user.id);

    console.log("Stats count:", stats?.length);
    console.log("Series count:", series?.length);
}
check();
