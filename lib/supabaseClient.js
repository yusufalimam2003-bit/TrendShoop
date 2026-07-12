import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xtpyvesstslyuxiwbful.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0cHl2ZXNzdHNseXV4aXdiZnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM4MDYxODQsImV4cCI6MjA5OTM4MjE4NH0.EUQozFa9h-F4S1oTkdR4UVBbMZm0r6gWqOmVAJGYMQU';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase env vars are missing. Copy .env.local.example to .env.local and fill in your Project URL and Anon Key.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
