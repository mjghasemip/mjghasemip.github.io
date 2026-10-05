// ===== Auth Page Logic =====
document.addEventListener('DOMContentLoaded', async () => {
  // Redirect if already logged in
  const user = await getCurrentUser();
  if (user) {
    window.location.href = 'index.html';
    return;
  }

  // Tabs
  const tabs = document.querySelectorAll('.auth-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      if (target === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
      } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
      }
    });
  });

  // Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');
    errorEl.classList.add('hidden');

    try {
      await signIn(email, password);
      window.location.href = 'index.html';
    } catch (err) {
      errorEl.textContent = translateError(err.message);
      errorEl.classList.remove('hidden');
    }
  });

  // Register
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const errorEl = document.getElementById('register-error');
    errorEl.classList.add('hidden');

    try {
      await signUp(email, password, name);
      // Auto sign-in after signup (since no email confirm)
      await signIn(email, password);
      window.location.href = 'index.html';
    } catch (err) {
      errorEl.textContent = translateError(err.message);
      errorEl.classList.remove('hidden');
    }
  });
});

function translateError(msg) {
  if (!msg) return 'خطایی رخ داد';
  const map = {
    'Invalid login credentials': 'ایمیل یا رمز عبور اشتباه است',
    'User already registered': 'این ایمیل قبلاً ثبت شده است',
    'Password should be at least 6 characters': 'رمز عبور باید حداقل ۶ کاراکتر باشد',
    'Unable to validate email address: invalid format': 'فرمت ایمیل نامعتبر است',
    'Email not confirmed': 'ایمیل تأیید نشده (در تنظیمات Supabase تأیید ایمیل را غیرفعال کنید)',
  };
  for (const [en, fa] of Object.entries(map)) {
    if (msg.includes(en)) return fa;
  }
  return msg;
}
