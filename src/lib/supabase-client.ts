import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// This is the client-side supabase client
export const createBrowserClientInstance = () => {
    if (!supabaseUrl || !supabaseKey) {
        console.error('Supabase URL or Anon Key is missing in environment variables');
    }
    return createBrowserClient(supabaseUrl!, supabaseKey!);
};

// Alias for existing imports
export const createBrowserClient = createBrowserClientInstance;
