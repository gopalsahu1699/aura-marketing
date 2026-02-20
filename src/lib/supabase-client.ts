import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// This is the client-side supabase client
export const createBrowserClient = () => createClient(supabaseUrl, supabaseKey);

// For server-side usage with auth cookies, you'd typically use @supabase/ssr
// But for now, we have a base client in @/lib/supabase.ts already.
