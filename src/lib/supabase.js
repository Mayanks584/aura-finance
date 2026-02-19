// Supabase client configuration
// Using the provided project credentials (publishable key is safe to store in code)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxppuzocilqhlrdgkabm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4cHB1em9jaWxxaGxyZGdrYWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0OTQ4NDYsImV4cCI6MjA4NzA3MDg0Nn0.5BwaOak2hAdtNr17FjM3M4IlFPiqXloi9YxurRy471g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;
