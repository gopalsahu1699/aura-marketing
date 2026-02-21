import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Token exchange config per platform
const TOKEN_CONFIG: Record<string, {
    tokenUrl: string;
    clientIdEnv: string;
    clientSecretEnv: string;
    profileUrl?: string;
    profileField?: string; // field in profile response that holds the handle/username
}> = {
    instagram: {
        // For Instagram Professional Accounts (Graph API)
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        clientIdEnv: 'INSTAGRAM_CLIENT_ID',
        clientSecretEnv: 'INSTAGRAM_CLIENT_SECRET',
        profileUrl: 'https://graph.facebook.com/v18.0/me?fields=id,name,accounts{instagram_business_account}',
        profileField: 'name', // Fallback, usually we'd parse the ig business account from pages
    },
    facebook: {
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
        clientIdEnv: 'FACEBOOK_CLIENT_ID',
        clientSecretEnv: 'FACEBOOK_CLIENT_SECRET',
        profileUrl: 'https://graph.facebook.com/me?fields=id,name',
        profileField: 'name',
    },
    linkedin: {
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        clientIdEnv: 'LINKEDIN_CLIENT_ID',
        clientSecretEnv: 'LINKEDIN_CLIENT_SECRET',
        profileUrl: 'https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName)',
        profileField: 'localizedFirstName',
    },
    youtube: {
        tokenUrl: 'https://oauth2.googleapis.com/token',
        clientIdEnv: 'YOUTUBE_CLIENT_ID',
        clientSecretEnv: 'YOUTUBE_CLIENT_SECRET',
        profileUrl: 'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
        profileField: 'title', // inside items[0].snippet.title
    },
};



export async function GET(
    request: Request,
    { params }: { params: Promise<{ platform: string }> }
) {
    const { platform } = await params;
    const config = TOKEN_CONFIG[platform];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const errorRedirect = (msg: string) =>
        NextResponse.redirect(`${baseUrl}/dashboard/connections?error=${encodeURIComponent(msg)}`);

    if (!config) return errorRedirect(`Unknown platform: ${platform}`);

    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) return errorRedirect(`Authorization denied: ${error}`);
    if (!code || !state) return errorRedirect('Missing code or state parameter');

    // Validate CSRF state
    const cookieStore = await cookies();
    const storedState = cookieStore.get(`oauth_state_${platform}`)?.value;
    if (state !== storedState) return errorRedirect('Invalid state parameter — possible CSRF attack');
    cookieStore.delete(`oauth_state_${platform}`);

    const clientId = process.env[config.clientIdEnv];
    const clientSecret = process.env[config.clientSecretEnv];
    if (!clientId || !clientSecret) return errorRedirect(`Missing ${config.clientIdEnv} or ${config.clientSecretEnv}`);

    const redirectUri = `${baseUrl}/api/oauth/${platform}/callback`;

    // Exchange code for token
    let tokenData: any;
    try {
        const body = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        });
        const tokenRes = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
            body: body.toString(),
        });
        tokenData = await tokenRes.json();
        if (!tokenData.access_token) throw new Error(tokenData.error_description || 'No access_token in response');
    } catch (err: any) {
        console.error(`[OAuth ${platform}] Token exchange failed:`, err);
        return errorRedirect(`Token exchange failed: ${err.message}`);
    }

    const accessToken: string = tokenData.access_token;
    const refreshToken: string | null = tokenData.refresh_token ?? null;
    const expiresIn: number | null = tokenData.expires_in ?? null;
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;
    const scope: string | null = tokenData.scope ?? null;

    // Fetch profile handle
    let handle = `@${platform}_user`;
    if (config.profileUrl) {
        try {
            const profileRes = await fetch(config.profileUrl, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
            const profile = await profileRes.json();
            if (platform === 'youtube') {
                handle = profile.items?.[0]?.snippet?.title ?? handle;
            } else if (platform === 'linkedin') {
                handle = `${profile.localizedFirstName ?? ''} ${profile.localizedLastName ?? ''}`.trim() || handle;
            } else {
                handle = (config.profileField && profile[config.profileField]) ? `@${profile[config.profileField]}` : handle;
            }
        } catch { /* use default handle */ }
    }

    // Save to Supabase
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
    if (!user) return errorRedirect('Not authenticated — please log in first');

    // Default UI values for first-time insert since schema requires them
    const platformDefaults: Record<string, any> = {
        instagram: { name: 'Instagram Business', color: 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600', description: 'Direct publishing & reel analytics integration.', icon_name: 'Instagram' },
        facebook: { name: 'Facebook Ads', color: 'bg-[#1877F2]', description: 'Enterprise ad manager & lead sync.', icon_name: 'Facebook' },
        linkedin: { name: 'LinkedIn Company', color: 'bg-[#0A66C2]', description: 'Professional networking & B2B reach.', icon_name: 'Linkedin' },
        youtube: { name: 'YouTube Enterprise', color: 'bg-[#FF0000]', description: 'Video delivery & channel growth engine.', icon_name: 'Youtube' }
    };
    const defaults = platformDefaults[platform] || { name: platform, color: 'bg-primary', description: 'Connected Platform', icon_name: 'LinkIcon' };

    try {
        const { error: upsertError } = await supabase.from('connections_platforms').upsert({
            user_id: user.id,
            platform_id: platform,
            status: 'connected', // Changed to lowercase 'connected' to match frontend expected string normalization
            handle,
            access_token: accessToken,
            refresh_token: refreshToken,
            token_expires_at: expiresAt,
            scope,
            last_synced: new Date().toISOString(),
            // Ensure NOT NULL fields are populated on initial insert
            name: defaults.name,
            color: defaults.color,
            description: defaults.description,
            icon_name: defaults.icon_name
        }, { onConflict: 'user_id,platform_id' });

        if (upsertError) {
            console.error(`[OAuth ${platform}] Supabase error object:`, upsertError);
            return errorRedirect(`Failed to save connection: ${upsertError.message}`);
        }
    } catch (err: any) {
        console.error(`[OAuth ${platform}] Supabase upsert exception:`, err);
        return errorRedirect('Failed to save connection. Please try again.');
    }

    return NextResponse.redirect(`${baseUrl}/dashboard/connections?connected=${platform}`);
}
