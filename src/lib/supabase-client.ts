import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Creates a client-side Supabase client with environment variable checks.
 * Uses @supabase/ssr for better session synchronization in Next.js.
 */
export const createBrowserClient = () => {
    if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase URL or Anon Key is missing in environment variables');
    }
    return createSupabaseBrowserClient(supabaseUrl!, supabaseKey!);
};
