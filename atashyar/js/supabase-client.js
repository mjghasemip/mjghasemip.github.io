/**
 * کلاینت Supabase از CDN
 * بعد از لود شدن @supabase/supabase-js این فایل را صدا بزن
 */
window.getSupabase = function () {
  if (window._sb) return window._sb;
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.APP_CONFIG;
  if (!SUPABASE_URL || SUPABASE_URL.includes('YOUR_PROJECT')) {
    console.warn('⚠️ لطفاً SUPABASE_URL و SUPABASE_ANON_KEY را در js/config.js تنظیم کنید.');
  }
  window._sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return window._sb;
};
