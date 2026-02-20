import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
        fetch: (...args) => {
            if (args[0].toString().includes('placeholder.supabase.co')) {
                // Return immediate empty 200 response to cleanly trigger the client fallback
                return Promise.resolve(new Response(JSON.stringify([]), { status: 200 }));
            }
            return fetch(...args);
        }
    }
});
