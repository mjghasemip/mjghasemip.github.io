// ===== Auth Helpers =====
let currentUser = null;
let currentProfile = null;

async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

async function getCurrentUser() {
  const session = await getSession();
  if (!session) {
    currentUser = null;
    currentProfile = null;
    return null;
  }
  currentUser = session.user;
  await loadProfile();
  return currentUser;
}

async function loadProfile() {
  if (!currentUser) {
    currentProfile = null;
    return null;
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', currentUser.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Profile load error:', error);
  }
  currentProfile = data || null;
  return currentProfile;
}

function isAdmin() {
  return currentProfile && currentProfile.role === 'admin';
}

async function signUp(email, password, fullName) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      // No email confirmation required (must be disabled in Supabase dashboard too)
    },
  });
  if (error) throw error;

  // Create profile
  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email: email,
      full_name: fullName,
      role: 'user',
    });
  }
  return data;
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  currentUser = null;
  currentProfile = null;
  window.location.href = 'index.html';
}

// Update UI based on auth state
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
    if (adminLink) {
      if (isAdmin()) adminLink.classList.remove('hidden');
      else adminLink.classList.add('hidden');
    }
    if (loginHint) loginHint.classList.add('hidden');
  } else {
    if (authButtons) authButtons.classList.remove('hidden');
    if (userMenu) userMenu.classList.add('hidden');
    if (loginHint) loginHint.classList.remove('hidden');
  }

  if (logoutBtn) {
    logoutBtn.onclick = () => signOut();
  }
}

// Require auth - redirect if not logged in
async function requireAuth(redirectTo = 'auth.html') {
  const user = await getCurrentUser();
  if (!user) {
    window.location.href = redirectTo;
    return false;
  }
  return true;
}

// Require admin
async function requireAdmin() {
  const ok = await requireAuth();
  if (!ok) return false;
  await loadProfile();
  if (!isAdmin()) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// Init on every page
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();

  // Listen for auth changes
  supabase.auth.onAuthStateChange(() => {
    updateAuthUI();
  });
});
