// ===== Auth Page Logic (phone-based) =====
document.addEventListener('DOMContentLoaded', function () {
  var tabs = document.querySelectorAll('.auth-tab');
  var loginForm = document.getElementById('login-form');
  var registerForm = document.getElementById('register-form');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
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


  // Profession chips
  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var input = document.getElementById('register-profession');
      if (input) input.value = chip.getAttribute('data-profession');
      document.querySelectorAll('.chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
    });
  });

  // Login — فقط شماره موبایل
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var phoneRaw = document.getElementById('login-phone').value;
    var phone = normalizePhone(phoneRaw);
    var errorEl = document.getElementById('login-error');
    errorEl.classList.add('hidden');

    if (!isValidIranMobile(phone)) {
      errorEl.textContent = 'شماره موبایل معتبر نیست (مثال: 09121234567)';
      errorEl.classList.remove('hidden');
      return;
    }

    try {
      var email = phoneToEmail(phone);
      var password = phoneToPassword(phone);
      await signIn(email, password);
      window.location.href = 'index.html';
    } catch (err) {
      errorEl.textContent = translateError(err && err.message);
      errorEl.classList.remove('hidden');
    }
  });

  // Register — نام + موبایل + حرفه اختیاری
  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    var name = document.getElementById('register-name').value.trim();
    var phoneRaw = document.getElementById('register-phone').value;
    var phone = normalizePhone(phoneRaw);
    var profession = document.getElementById('register-profession').value.trim();
    var errorEl = document.getElementById('register-error');
    errorEl.classList.add('hidden');

    if (!name) {
      errorEl.textContent = 'نام را وارد کنید';
      errorEl.classList.remove('hidden');
      return;
    }
    if (!isValidIranMobile(phone)) {
      errorEl.textContent = 'شماره موبایل معتبر نیست (مثال: 09121234567)';
      errorEl.classList.remove('hidden');
      return;
    }

    try {
      var email = phoneToEmail(phone);
      var password = phoneToPassword(phone);
      await signUp(email, password, name, phone, profession);
      await signIn(email, password);
      window.location.href = 'index.html';
    } catch (err) {
      errorEl.textContent = translateError(err && err.message);
      errorEl.classList.remove('hidden');
    }
  });

  getCurrentUser().then(function (user) {
    if (user) window.location.href = 'index.html';
  }).catch(function (err) {
    console.error(err);
  });
});

function translateError(msg) {
  if (!msg) return 'خطایی رخ داد';
  var map = {
    'Invalid login credentials': 'شماره موبایل ثبت نشده یا اشتباه است. اول ثبت‌نام کنید.',
    'User already registered': 'این شماره قبلاً ثبت شده. از تب ورود استفاده کنید.',
    'Password should be at least 6 characters': 'خطا در ساخت حساب',
    'Unable to validate email address: invalid format': 'فرمت شماره نامعتبر است',
    'Email not confirmed': 'تأیید ایمیل را در Supabase خاموش کنید (Confirm email = Off)',
    'Supabase client not initialized': 'خطا در اتصال. صفحه را رفرش کنید.',
  };
  for (var en in map) {
    if (msg.indexOf(en) !== -1) return map[en];
  }
  return msg;
}
