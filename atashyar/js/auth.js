/**
 * سیستم احراز هویت — کاربر عادی + ادمین
 */
window.Auth = {
  async getSession() {
    const sb = getSupabase();
    const { data: { session } } = await sb.auth.getSession();
    return session;
  },

  async getUser() {
    const session = await this.getSession();
    return session?.user || null;
  },

  async getProfile() {
    const user = await this.getUser();
    if (!user) return null;
    const sb = getSupabase();
    const { data } = await sb.from('profiles').select('*').eq('id', user.id).single();
    return data;
  },

  async isAdmin() {
    const profile = await this.getProfile();
    return profile?.role === 'admin';
  },

  async signUp(email, password, fullName) {
    const sb = getSupabase();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName || '' } },
    });
    if (error) throw error;
    // پروفایل با trigger ساخته می‌شود؛ اگر نبود دستی:
    if (data.user) {
      await sb.from('profiles').upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName || '',
        role: 'user',
      });
    }
    return data;
  },

  async signIn(email, password) {
    const sb = getSupabase();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const sb = getSupabase();
    await sb.auth.signOut();
  },

  /** رندر هدر بر اساس وضعیت لاگین */
  async renderHeader(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const user = await this.getUser();
    let profile = null;
    if (user) profile = await this.getProfile();

    const isAdmin = profile?.role === 'admin';
    const displayName = profile?.full_name || user?.email?.split('@')[0] || '';

    // مسیر نسبی (صفحات در root یا admin/)
    const base = location.pathname.includes('/admin/') ? '../' : '';

    let authHtml = '';
    if (!user) {
      authHtml = `
        <a href="${base}login.html" class="header-link">ورود</a>
        <a href="${base}register.html" class="btn btn-primary btn-sm header-btn">ثبت‌نام</a>
      `;
    } else {
      authHtml = `
        <div class="header-user" id="user-menu-toggle">
          <span class="header-avatar">${(displayName[0] || 'U').toUpperCase()}</span>
          <span class="header-name">${displayName}</span>
          <span class="header-chevron">▾</span>
          <div class="header-dropdown hidden" id="user-dropdown">
            <a href="${base}account.html">حساب کاربری</a>
            <a href="${base}account.html#orders">سفارش‌های من</a>
            ${isAdmin ? `<a href="${base}admin/dashboard.html">پنل ادمین</a>` : ''}
            <button type="button" id="logout-btn">خروج</button>
          </div>
        </div>
      `;
    }

    el.innerHTML = `
      <div class="header-inner">
        <a href="${base}index.html" class="logo">
          <span class="logo-icon">🔥</span>
          <div>
            <span class="logo-text">آتش یار</span>
            <span class="logo-sub">ATASHYAR</span>
          </div>
        </a>
        <nav class="nav">
          <a href="${base}index.html#products">محصولات</a>
          <a href="${base}index.html#about">درباره ما</a>
          <a href="${base}index.html#contact">تماس</a>
        </nav>
        <div class="header-auth">${authHtml}</div>
      </div>
    `;

    // dropdown
    const toggle = document.getElementById('user-menu-toggle');
    const dropdown = document.getElementById('user-dropdown');
    if (toggle && dropdown) {
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
      });
      document.addEventListener('click', () => dropdown.classList.add('hidden'));
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await this.signOut();
        location.href = base + 'index.html';
      });
    }
  },
};
