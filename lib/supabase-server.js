import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// This client is strictly for public server-side read operations where auth is not needed.
// For operations requiring user auth, use the createServerClient from @supabase/ssr.
export const supabaseServer = createClient(supabaseUrl, supabaseAnonKey);
