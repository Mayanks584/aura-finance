// Supabase client configuration
// Using the provided project credentials (publishable key is safe to store in code)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jxexdauqixqiimmgmnh.supabase.co';
const supabaseAnonKey = 'sb_publishable_dHMyXr24Rwdp5bJ6TQlHig_Es5YDExc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;
