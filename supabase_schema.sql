CREATE TABLE dashboard_stats (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    label TEXT NOT NULL,
    value TEXT NOT NULL,
    change TEXT NOT NULL,
    trend TEXT NOT NULL,
    icon_name TEXT NOT NULL
);

CREATE TABLE training_models (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    accuracy TEXT NOT NULL,
    last_trained TEXT NOT NULL,
    color TEXT NOT NULL,
    bg TEXT NOT NULL,
    progress INTEGER,
    icon_name TEXT NOT NULL,
    description TEXT,
    system_prompt TEXT,
    capabilities TEXT[]
);

CREATE TABLE connections_platforms (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    platform_id TEXT NOT NULL,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    status TEXT NOT NULL,
    handle TEXT,
    last_synced TEXT,
    description TEXT NOT NULL,
    icon_name TEXT NOT NULL
);

CREATE TABLE content_history (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    content_type TEXT NOT NULL,
    prompt TEXT NOT NULL,
    generated_content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    published_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE analytics_series (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    metric_name TEXT NOT NULL, -- e.g., 'growth', 'revenue', 'engagement'
    data_points JSONB NOT NULL, -- e.g., [{"label": "Mon", "value": 60}, ...]
    time_range TEXT NOT NULL, -- e.g., 'Last 30 Days'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE audience_insights (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    category TEXT NOT NULL, -- e.g., 'audience', 'behavior', 'painpoints'
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE brand_settings (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid() UNIQUE,
    brand_name TEXT NOT NULL DEFAULT 'Aura Marketing',
    business_email TEXT NOT NULL DEFAULT 'hello@auramarketing.io',
    industry TEXT NOT NULL DEFAULT 'Marketing & Advertising',
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    description TEXT,
    primary_logo TEXT, -- URL
    secondary_mark TEXT, -- URL
    palette JSONB DEFAULT '{"primary": "#8C2BEE", "secondary": "#0F0814", "accent": "#AD92C9", "surface": "#362348"}'::JSONB,
    ai_persona TEXT NOT NULL DEFAULT 'Professional',
    voice_directives TEXT,
    target_audience TEXT NOT NULL DEFAULT 'Digital Creators',
    brand_font TEXT NOT NULL DEFAULT 'Inter Display',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid() UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    weekly_digest BOOLEAN DEFAULT false,
    ai_suggestions BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE dashboard_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can only see their own stats" ON dashboard_stats 
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only manage their own models" ON training_models 
    FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only manage their own connections" ON connections_platforms 
    FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only manage their own content" ON content_history 
    FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only manage their own series" ON analytics_series 
    FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only manage their own insights" ON audience_insights 
    FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only manage their own brand kit" ON brand_settings 
    FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can only manage their own preferences" ON user_preferences 
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Insert Default Global Dashboard Stats (Note: Because of RLS, these need to be inserted manually by admin, or RLS bypassed for this specific global table)
-- However, for a user-specific dashboard, the application should insert these upon user registration.
-- To provide immediate "Real" data instead of fallbacks for the current user, execute this in the SQL Editor:
/*
INSERT INTO dashboard_stats (user_id, label, value, change, trend, icon_name)
VALUES 
    ((SELECT id FROM auth.users LIMIT 1), 'Followers Growth', '28.1k', '+14.2%', 'up', 'Users2'),
    ((SELECT id FROM auth.users LIMIT 1), 'Engagement Rate', '5.10%', '+0.5%', 'up', 'Activity'),
    ((SELECT id FROM auth.users LIMIT 1), 'Leads Generated', '1,452', '+4.1%', 'up', 'Filter'),
    ((SELECT id FROM auth.users LIMIT 1), 'Conversion Rate', '3.8%', '+1.2%', 'up', 'ShoppingCart'),
    ((SELECT id FROM auth.users LIMIT 1), 'Total Revenue', '$15,890', '+22.4%', 'up', 'Wallet');
*/

