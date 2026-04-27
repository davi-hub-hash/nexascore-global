import { createClient } from '@supabase/supabase-js';

// URL do seu projeto Supabase
const supabaseUrl = 'https://kdyjtxmrcfomekzylswh.supabase.co';

// Sua Anon Key correta (extraída do seu projeto)
const supabaseAnonKey = 'EyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkeWp0eG1yY2ZvbWVrenlsc3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMjQzNTgsImV4cCI6MjA4OTYwMDM1OH0.a5wjvKerfk58aIwgTqw5ziZ-eht5Zboe9BZzIOKrJwg'; 

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
