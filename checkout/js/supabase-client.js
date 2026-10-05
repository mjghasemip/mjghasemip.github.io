// ===== Supabase Client =====
// CDN UMD: global is `supabase` with createClient
(function () {
  var sdk = window.supabase;

  if (!sdk || typeof sdk.createClient !== 'function') {
    console.error('Supabase SDK failed to load from CDN.');
    window.sb = null;
    return;
  }

  // App-wide client (do not reuse the global name "supabase")
  window.sb = sdk.createClient(
    CONFIG.SUPABASE_URL,
    CONFIG.SUPABASE_ANON_KEY
  );
})();
