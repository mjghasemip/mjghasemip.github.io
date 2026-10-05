// ===== Auth Page Logic =====
document.addEventListener('DOMContentLoaded', function () {
  // --- Tabs & forms first (so UI works even if auth fails) ---
  var tabs = document.querySelectorAll('.auth-tab');
  var loginForm = document.getElementById('login-form');
  var registerForm = document.getElementById('register-form');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        t.classList.remove('active');
      });
      tab.classList.add('active');
      var target = tab.getAttribute('data-tab');
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
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var email = document.getElementById('login-email').value.trim();
    var password = document.getElementById('login-password').value;
    var errorEl = document.getElementById('login-error');
    errorEl.classList.add('hidden');

    try {
      await signIn(email, password);
      window.location.href = 'index.html';
    } catch (err) {
      errorEl.textContent = translateError(err && err.message);
      errorEl.classList.remove('hidden');
    }
  });

  // Register
  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var name = document.getElementById('register-name').value.trim();
    var email = document.getElementById('register-email').value.trim();
    var password = document.getElementById('register-password').value;
    var errorEl = document.getElementById('register-error');
    errorEl.classList.add('hidden');

    try {
      await signUp(email, password, name);
      await signIn(email, password);
      window.location.href = 'index.html';
    } catch (err) {
      errorEl.textContent = translateError(err && err.message);
      errorEl.classList.remove('hidden');
    }
  });

  // Redirect if already logged in (after UI is wired)
  getCurrentUser().then(function (user) {
    if (user) {
      window.location.href = 'index.html';
    }
  }).catch(function (err) {
    console.error(err);
  });
});

function translateError(msg) {
  if (!msg) return 'خطایی رخ داد';
  var map = {
    'Invalid login credentials': 'ایمیل یا رمز عبور اشتباه است',
    'User already registered': 'این ایمیل قبلاً ثبت شده است',
    'Password should be at least 6 characters': 'رمز عبور باید حداقل ۶ کاراکتر باشد',
    'Unable to validate email address: invalid format': 'فرمت ایمیل نامعتبر است',
    'Email not confirmed': 'ایمیل تأیید نشده (در تنظیمات Supabase تأیید ایمیل را غیرفعال کنید)',
    'Supabase client not initialized': 'خطا در اتصال به سرور. صفحه را رفرش کنید.',
  };
  for (var en in map) {
    if (msg.indexOf(en) !== -1) return map[en];
  }
  return msg;
}
