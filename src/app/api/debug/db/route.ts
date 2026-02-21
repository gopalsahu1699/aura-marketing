import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
            },
        }
    );

    // Get user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check stats
    const { data: stats } = await supabase.from('dashboard_stats').select('*').eq('user_id', user.id);
    const { data: series } = await supabase.from('analytics_series').select('*').eq('user_id', user.id);

    return NextResponse.json({
        user: user.id,
        stats_count: stats?.length || 0,
        series_count: series?.length || 0,
        stats: stats,
    });
}
