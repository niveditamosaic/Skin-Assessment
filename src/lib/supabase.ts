import { createClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Replace these two values after you create your Supabase project.
// Instructions: Settings → API → Project URL and anon/public key.
// ---------------------------------------------------------------------------
const SUPABASE_URL  = 'https://qqhpdgbmydrfhzvslggw.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxaHBkZ2JteWRyZmh6dnNsZ2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MzQ4OTYsImV4cCI6MjA5NzAxMDg5Nn0.Gqrkq2kbNOVL4Xo9FixngDLQezU5s2cPYAQ9xHwzel4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
