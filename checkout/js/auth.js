// ===== Auth Helpers =====
let currentUser = null;
let currentProfile = null;

function getSb() {
  if (!window.sb) {
    throw new Error('Supabase client not initialized');
  }
  return window.sb;
}

async function getSession() {
  const { data: { session } } = await getSb().auth.getSession();
  return session;
}

async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session) {
      currentUser = null;
      currentProfile = null;
      return null;
    }
    currentUser = session.user;
    await loadProfile();
    return currentUser;
  } catch (err) {
    console.error('getCurrentUser error:', err);
    currentUser = null;
    currentProfile = null;
    return null;
  }
}

async function loadProfile() {
  if (!currentUser) {
    currentProfile = null;
    return null;
  }
  try {
    const { data, error } = await getSb()
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .maybeSingle();

    if (error) {
      console.error('Profile load error:', error);
    }
    currentProfile = data || null;

    // If no profile row yet, create one
    if (!currentProfile) {
      const fullName =
        (currentUser.user_metadata && currentUser.user_metadata.full_name) || '';
      const { data: created, error: insertErr } = await getSb()
        .from('profiles')
        .upsert({
          id: currentUser.id,
          email: currentUser.email,
          full_name: fullName,
          role: 'user',
        })
        .select()
        .maybeSingle();
      if (insertErr) console.error('Profile create error:', insertErr);
      currentProfile = created || null;
    }

    return currentProfile;
  } catch (err) {
    console.error('loadProfile error:', err);
    currentProfile = null;
    return null;
  }
}

function isAdmin() {
  return !!(currentProfile && currentProfile.role === 'admin');
}

async function signUp(email, password, fullName) {
  const { data, error } = await getSb().auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });
  if (error) throw error;

  if (data.user) {
    await getSb().from('profiles').upsert({
      id: data.user.id,
      email: email,
      full_name: fullName,
      role: 'user',
    });
  }
  return data;
}

async function signIn(email, password) {
  const { data, error } = await getSb().auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

async function signOut() {
  const { error } = await getSb().auth.signOut();
  if (error) throw error;
  currentUser = null;
  currentProfile = null;
  window.location.href = 'index.html';
}

async function updateAuthUI() {
  await getCurrentUser();

  const authButtons = document.getElementById('auth-buttons');
  const userMenu = document.getElementById('user-menu');
  const userEmail = document.getElementById('user-email');
  const adminLink = document.getElementById('admin-link');
  const logoutBtn = document.getElementById('logout-btn');
  const loginHint = document.getElementById('login-hint');

  if (currentUser) {
    if (authButtons) authButtons.classList.add('hidden');
    if (userMenu) userMenu.classList.remove('hidden');
    if (userEmail) userEmail.textContent = currentUser.email;

    // Always try to show/hide admin link based on role
    if (adminLink) {
      if (isAdmin()) {
        adminLink.classList.remove('hidden');
      } else {
        adminLink.classList.add('hidden');
      }
    }

    if (loginHint) loginHint.classList.add('hidden');
  } else {
    if (authButtons) authButtons.classList.remove('hidden');
    if (userMenu) userMenu.classList.add('hidden');
    if (adminLink) adminLink.classList.add('hidden');
    if (loginHint) loginHint.classList.remove('hidden');
  }

  if (logoutBtn) {
    logoutBtn.onclick = function () {
      signOut();
    };
  }

  // Debug helper in console
  if (currentUser) {
    console.log('[auth] user:', currentUser.email, '| role:', currentProfile && currentProfile.role);
  }
}

async function requireAuth(redirectTo) {
  redirectTo = redirectTo || 'auth.html';
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

async function requireAdmin() {
  const ok = await requireAuth();
  if (!ok) return false;
  await loadProfile();
  if (!isAdmin()) {
    alert('شما دسترسی ادمین ندارید.\nاگر ادمین هستید یک‌بار خارج شوید و دوباره وارد شوید.\nrole فعلی: ' + ((currentProfile && currentProfile.role) || 'نامشخص'));
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

document.addEventListener('DOMContentLoaded', function () {
  updateAuthUI();

  try {
    getSb().auth.onAuthStateChange(function () {
      updateAuthUI();
    });
  } catch (err) {
    console.error('onAuthStateChange error:', err);
  }
});
