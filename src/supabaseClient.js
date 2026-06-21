import { createClient } from '@supabase/supabase-js';

// ── PASTE YOUR VALUES BELOW ────────────────────────────────────
// Get these from: Supabase Dashboard → Project Settings → API
const supabaseUrl = 'hplqwdimaxjapgtbihrn';
const supabaseAnonKey = 'sb_publishable_ffa2bwGWnStFrovz1tdAfA_WXZ04iw3';
// ────────────────────────────────────────────────────────────────

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
