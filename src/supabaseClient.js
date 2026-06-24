import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hplqwdimaxjapgtbihrn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhwbHF3ZGltYXhqYXBndGJpaHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTA3OTQsImV4cCI6MjA5Mzk2Njc5NH0.slmnK5NViGkc1ANQf6Okuvd9Edw3QcEQi4IiJSCmy5g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
