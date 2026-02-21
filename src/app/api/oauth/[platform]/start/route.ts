import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

// OAuth config per platform
const OAUTH_CONFIG: Record<string, {
    authUrl: string;
    clientIdEnv: string;
    scopes: string;
    extraParams?: Record<string, string>;
}> = {
    instagram: {
        // For Instagram Professional/Business Accounts (Graph API)
        // Note: Graph API routes Instagram login through Facebook's OAuth dialog
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        clientIdEnv: 'INSTAGRAM_CLIENT_ID',
        scopes: 'instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement',
    },
    facebook: {
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        clientIdEnv: 'FACEBOOK_CLIENT_ID',
        scopes: 'pages_show_list,pages_read_engagement,instagram_basic,instagram_manage_insights',
    },
    linkedin: {
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        clientIdEnv: 'LINKEDIN_CLIENT_ID',
        scopes: 'r_liteprofile r_emailaddress r_organization_social',
    },
    youtube: {
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        clientIdEnv: 'YOUTUBE_CLIENT_ID',
        scopes: 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly',
        extraParams: { access_type: 'offline', prompt: 'consent' },
    },
};

export async function GET(
    request: Request,
    { params }: { params: Promise<{ platform: string }> }
) {
    const { platform } = await params;
    const config = OAUTH_CONFIG[platform];

    if (!config) {
        return NextResponse.json({ error: `Unknown platform: ${platform}` }, { status: 400 });
    }

    const clientId = process.env[config.clientIdEnv];
    if (!clientId) {
        return NextResponse.json(
            { error: `${config.clientIdEnv} is not set in environment variables. Please add it to .env.local` },
            { status: 500 }
        );
    }

    // Generate CSRF state token
    const state = crypto.randomBytes(16).toString('hex');
    const cookieStore = await cookies();
    cookieStore.set(`oauth_state_${platform}`, state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 600, // 10 min
        path: '/',
    });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUri = `${baseUrl}/api/oauth/${platform}/callback`;

    const url = new URL(config.authUrl);
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('scope', config.scopes);
    url.searchParams.set('state', state);
    url.searchParams.set('response_type', 'code');

    if (config.extraParams) {
        for (const [k, v] of Object.entries(config.extraParams)) {
            url.searchParams.set(k, v);
        }
    }

    return NextResponse.redirect(url.toString());
}
