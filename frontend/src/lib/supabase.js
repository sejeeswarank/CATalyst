import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Fail loudly at startup rather than falling back to a placeholder URL that
// would make every query throw a confusing network error later on.
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase config: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
