'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// ─── Helper: get current user's token for a platform ─────────────────────────

async function getUserToken(platformId: string): Promise<string | null> {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return cookieStore.get(name)?.value; },
                set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }); },
                remove(name: string, options: CookieOptions) { cookieStore.set({ name, value: '', ...options }); },
            },
        }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from('connections_platforms')
        .select('access_token, status')
        .eq('user_id', user.id)
        .eq('platform_id', platformId)
        .single();

    if (!data || data.status?.toLowerCase() !== 'connected' || !data.access_token) return null;
    return data.access_token;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SocialStats {
    platform: string;
    connected: boolean;
    followers?: number | string;
    reach?: number | string;
    impressions?: number | string;
    engagement_rate?: string;
    posts?: number | string;
    error?: string;
}

// ─── Instagram ────────────────────────────────────────────────────────────────

export async function getInstagramStats(): Promise<SocialStats> {
    const token = await getUserToken('instagram');
    if (!token) return { platform: 'instagram', connected: false };

    try {
        // Get user ID first
        const meRes = await fetch(
            `https://graph.instagram.com/me?fields=id,username,media_count&access_token=${token}`
        );
        const me = await meRes.json();
        if (me.error) throw new Error(me.error.message);

        // Get insights (requires Instagram Business account)
        const insightsRes = await fetch(
            `https://graph.instagram.com/${me.id}/insights?metric=reach,impressions,profile_views&period=day&access_token=${token}`
        );
        const insights = await insightsRes.json();

        const reach = insights.data?.find((d: any) => d.name === 'reach')?.values?.slice(-1)[0]?.value ?? 'N/A';
        const impressions = insights.data?.find((d: any) => d.name === 'impressions')?.values?.slice(-1)[0]?.value ?? 'N/A';

        return {
            platform: 'instagram',
            connected: true,
            followers: me.followers_count ?? 'N/A',
            reach,
            impressions,
            posts: me.media_count ?? 'N/A',
        };
    } catch (err: any) {
        console.warn('[getInstagramStats]', err.message);
        return { platform: 'instagram', connected: true, error: err.message };
    }
}

// ─── Facebook ─────────────────────────────────────────────────────────────────

export async function getFacebookStats(): Promise<SocialStats> {
    const token = await getUserToken('facebook');
    if (!token) return { platform: 'facebook', connected: false };

    try {
        // Get pages managed by this user
        const pagesRes = await fetch(
            `https://graph.facebook.com/v18.0/me/accounts?access_token=${token}`
        );
        const pages = await pagesRes.json();
        if (pages.error) throw new Error(pages.error.message);

        const page = pages.data?.[0];
        if (!page) return { platform: 'facebook', connected: true, error: 'No Facebook Pages found' };

        const pageToken = page.access_token;
        const pageId = page.id;

        // Get page insights
        const insightsRes = await fetch(
            `https://graph.facebook.com/v18.0/${pageId}/insights?metric=page_fans,page_impressions,page_post_engagements&period=day&access_token=${pageToken}`
        );
        const insights = await insightsRes.json();

        const fans = insights.data?.find((d: any) => d.name === 'page_fans')?.values?.slice(-1)[0]?.value ?? 'N/A';
        const impressions = insights.data?.find((d: any) => d.name === 'page_impressions')?.values?.slice(-1)[0]?.value ?? 'N/A';
        const engagements = insights.data?.find((d: any) => d.name === 'page_post_engagements')?.values?.slice(-1)[0]?.value ?? 'N/A';

        return {
            platform: 'facebook',
            connected: true,
            followers: fans,
            impressions,
            engagement_rate: typeof engagements === 'number' && typeof fans === 'number'
                ? `${((engagements / fans) * 100).toFixed(1)}%` : 'N/A',
        };
    } catch (err: any) {
        console.warn('[getFacebookStats]', err.message);
        return { platform: 'facebook', connected: true, error: err.message };
    }
}

// ─── LinkedIn ─────────────────────────────────────────────────────────────────

export async function getLinkedInStats(): Promise<SocialStats> {
    const token = await getUserToken('linkedin');
    if (!token) return { platform: 'linkedin', connected: false };

    try {
        // Get organization follower stats (requires admin access to an org)
        const orgRes = await fetch(
            'https://api.linkedin.com/v2/organizationalEntityFollowerStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:YOUR_ORG_ID',
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const orgData = await orgRes.json();

        // Fallback: get personal profile
        const profileRes = await fetch(
            'https://api.linkedin.com/v2/me',
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const profile = await profileRes.json();
        if (profile.status === 401) throw new Error('Token expired');

        const name = `${profile.localizedFirstName ?? ''} ${profile.localizedLastName ?? ''}`.trim();

        return {
            platform: 'linkedin',
            connected: true,
            followers: orgData.elements?.[0]?.followerCountsByAssociationType?.[0]?.followerCounts?.organicFollowerCount ?? 'N/A',
            reach: 'N/A',
            impressions: 'N/A',
        };
    } catch (err: any) {
        console.warn('[getLinkedInStats]', err.message);
        return { platform: 'linkedin', connected: true, error: err.message };
    }
}

// ─── YouTube ──────────────────────────────────────────────────────────────────

export async function getYouTubeStats(): Promise<SocialStats> {
    const token = await getUserToken('youtube');
    if (!token) return { platform: 'youtube', connected: false };

    try {
        const channelRes = await fetch(
            'https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&mine=true',
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const channelData = await channelRes.json();
        if (channelData.error) throw new Error(channelData.error.message);

        const stats = channelData.items?.[0]?.statistics;

        return {
            platform: 'youtube',
            connected: true,
            followers: stats?.subscriberCount ? Number(stats.subscriberCount).toLocaleString() : 'N/A',
            reach: stats?.viewCount ? Number(stats.viewCount).toLocaleString() : 'N/A',
            posts: stats?.videoCount ?? 'N/A',
        };
    } catch (err: any) {
        console.warn('[getYouTubeStats]', err.message);
        return { platform: 'youtube', connected: true, error: err.message };
    }
}

// ─── Combined: get all connected platform stats ───────────────────────────────

export async function getAllSocialStats(): Promise<SocialStats[]> {
    const results = await Promise.allSettled([
        getInstagramStats(),
        getFacebookStats(),
        getLinkedInStats(),
        getYouTubeStats(),
    ]);
    return results.map(r => r.status === 'fulfilled' ? r.value : { platform: 'unknown', connected: false });
}
