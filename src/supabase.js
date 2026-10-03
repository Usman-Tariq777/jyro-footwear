import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
// If keys are missing, the site falls back to the products in products.js
export const supabase = url && key ? createClient(url, key) : null;
