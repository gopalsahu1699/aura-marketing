-- =====================================================
-- AURA MARKETING — FULL ANALYTICS SEED SCRIPT
-- Run this in your Supabase SQL Editor once.
-- It seeds all tables for the first registered user.
-- =====================================================

DO $$
DECLARE
  target_user_id UUID;
BEGIN

  -- Get the first registered user
  SELECT id INTO target_user_id FROM auth.users ORDER BY created_at LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE NOTICE 'No users found. Please register an account first, then run again.';
    RETURN;
  END IF;

  RAISE NOTICE 'Seeding for user: %', target_user_id;

  -- =====================
  -- 1. DASHBOARD STATS
  -- =====================
  DELETE FROM dashboard_stats WHERE user_id = target_user_id;
  INSERT INTO dashboard_stats (user_id, label, value, change, trend, icon_name) VALUES
    (target_user_id, 'Followers Growth', '28.1k', '+14.2%', 'up', 'Users2'),
    (target_user_id, 'Engagement Rate', '5.10%', '+0.5%', 'up', 'Activity'),
    (target_user_id, 'Leads Generated', '1,452', '+4.1%', 'up', 'Filter'),
    (target_user_id, 'Conversion Rate', '3.8%', '+1.2%', 'up', 'ShoppingCart'),
    (target_user_id, 'Total Revenue', '$15,890', '+22.4%', 'up', 'Wallet');

  -- =====================
  -- 2. ANALYTICS SERIES (Growth Chart)
  -- =====================
  DELETE FROM analytics_series WHERE user_id = target_user_id;
  INSERT INTO analytics_series (user_id, metric_name, time_range, data_points) VALUES
    (target_user_id, 'growth', 'Last 7 Days', '[
      {"label":"Mon","value":42},{"label":"Tue","value":61},{"label":"Wed","value":55},
      {"label":"Thu","value":78},{"label":"Fri","value":83},{"label":"Sat","value":91},{"label":"Sun","value":74}
    ]'::jsonb),
    (target_user_id, 'growth', 'Last 30 Days', '[
      {"label":"W1","value":38},{"label":"W2","value":52},{"label":"W3","value":67},{"label":"W4","value":80}
    ]'::jsonb),
    (target_user_id, 'growth', 'Last 90 Days', '[
      {"label":"Jan","value":45},{"label":"Feb","value":58},{"label":"Mar","value":72},
      {"label":"Apr","value":65},{"label":"May","value":81},{"label":"Jun","value":88}
    ]'::jsonb),
    (target_user_id, 'growth', 'This Year', '[
      {"label":"Jan","value":35},{"label":"Feb","value":42},{"label":"Mar","value":55},
      {"label":"Apr","value":60},{"label":"May","value":52},{"label":"Jun","value":48},
      {"label":"Jul","value":58},{"label":"Aug","value":65},{"label":"Sep","value":72},
      {"label":"Oct","value":80},{"label":"Nov","value":90},{"label":"Dec","value":85}
    ]'::jsonb),
    (target_user_id, 'revenue', 'Last 30 Days', '[
      {"label":"W1","value":2840},{"label":"W2","value":3200},{"label":"W3","value":4100},{"label":"W4","value":5750}
    ]'::jsonb),
    (target_user_id, 'engagement', 'Last 30 Days', '[
      {"label":"W1","value":4.2},{"label":"W2","value":4.8},{"label":"W3","value":5.1},{"label":"W4","value":5.3}
    ]'::jsonb);

  -- =====================
  -- 3. AUDIENCE INSIGHTS
  -- =====================
  DELETE FROM audience_insights WHERE user_id = target_user_id;
  INSERT INTO audience_insights (user_id, category, data) VALUES
    (target_user_id, 'audience', '{
      "total": "85,420",
      "new_followers": "+1,248",
      "churn_rate": "0.82%",
      "active_users": "12,504",
      "age_range": "25-34",
      "top_gender": "62% Female",
      "income_level": "$45k-$75k",
      "primary_language": "English",
      "device_mobile": 68,
      "device_desktop": 32,
      "locations": [
        {"city": "Mumbai, India", "val": 38},
        {"city": "New York, USA", "val": 24},
        {"city": "London, UK", "val": 18},
        {"city": "Dubai, UAE", "val": 12},
        {"city": "Sydney, AU", "val": 8}
      ],
      "platforms": [
        {"name": "Instagram", "val": 75, "count": "45k"},
        {"name": "Facebook", "val": 55, "count": "28k"},
        {"name": "Twitter/X", "val": 35, "count": "12k"}
      ],
      "interests": ["Generative AI", "SaaS Tech", "Sustainability", "UX Design", "Digital Art", "Remote Work"]
    }'::jsonb),
    (target_user_id, 'behavior', '{
      "peak_buy_time": "8-10 PM",
      "avg_frequency": "2.4x/mo",
      "cart_abandonment": "67.2%",
      "repeat_purchase": "34.8%",
      "heatmap": [
        {"day": "Monday", "vals": [15, 25, 40, 35, 55, 80]},
        {"day": "Tuesday", "vals": [12, 30, 45, 38, 60, 75]},
        {"day": "Wednesday", "vals": [18, 28, 50, 42, 65, 85]},
        {"day": "Thursday", "vals": [10, 22, 35, 30, 50, 70]},
        {"day": "Friday", "vals": [20, 35, 55, 48, 70, 90]},
        {"day": "Saturday", "vals": [30, 45, 60, 55, 75, 95]},
        {"day": "Sunday", "vals": [25, 40, 50, 45, 65, 88]}
      ]
    }'::jsonb),
    (target_user_id, 'roi', '{
      "marketing_roi": "$15,200",
      "roi_change": "+18.5%",
      "attributed_revenue": "$52,400",
      "revenue_change": "+11.2%",
      "ai_efficiency": "+28%",
      "efficiency_change": "+6.1%",
      "sentiment_score": 82,
      "sentiment_label": "Positive"
    }'::jsonb);

  -- =====================
  -- 4. CONNECTIONS / PLATFORMS
  -- =====================
  DELETE FROM connections_platforms WHERE user_id = target_user_id;
  INSERT INTO connections_platforms (user_id, platform_id, name, color, status, handle, last_synced, description, icon_name) VALUES
    (target_user_id, 'instagram', 'Instagram', '#E1306C', 'Connected', '@auramarketing', NOW()::text, 'Visual storytelling & Reels', 'Instagram'),
    (target_user_id, 'facebook', 'Facebook', '#1877F2', 'Connected', 'Aura Marketing', NOW()::text, 'Community & paid ads', 'Facebook'),
    (target_user_id, 'twitter', 'Twitter / X', '#000000', 'Connected', '@auramarketing', NOW()::text, 'Real-time brand voice', 'Twitter'),
    (target_user_id, 'linkedin', 'LinkedIn', '#0A66C2', 'Disconnected', NULL, NULL, 'B2B & professional network', 'Linkedin'),
    (target_user_id, 'tiktok', 'TikTok', '#000000', 'Disconnected', NULL, NULL, 'Short-form viral content', 'Video');

  -- =====================
  -- 5. BRAND SETTINGS (Initial)
  -- =====================
  INSERT INTO brand_settings (user_id, brand_name, business_email, industry, timezone, description, ai_persona, target_audience, brand_font)
  VALUES (
    target_user_id,
    'Aura Marketing',
    'hello@auramarketing.io',
    'Marketing & Advertising',
    'Asia/Kolkata',
    'AI-powered marketing platform for creators and enterprises',
    'Professional',
    'Digital Creators & SMBs',
    'Inter Display'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- =====================
  -- 6. USER PREFERENCES
  -- =====================
  INSERT INTO user_preferences (user_id, email_notifications, push_notifications, weekly_digest, ai_suggestions)
  VALUES (target_user_id, true, true, false, true)
  ON CONFLICT (user_id) DO NOTHING;

  RAISE NOTICE 'Seeding complete for user: %', target_user_id;
END;
$$;
