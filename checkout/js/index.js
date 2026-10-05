// ===== Index / Amount Selection =====
document.addEventListener('DOMContentLoaded', function () {
  var STEP = 10000;
  var amountInput = document.getElementById('amount-toman');
  var payBtn = document.getElementById('pay-btn');
  var quickBtns = document.querySelectorAll('.quick-btn');
  var plusBtn = document.getElementById('amount-plus');
  var minusBtn = document.getElementById('amount-minus');

  var holdTimer = null;
  var holdInterval = null;
  var holdDelay = 400;
  var holdSpeed = 80;

  // تبدیل ارقام فارسی/عربی به انگلیسی
  function toEnglishDigits(str) {
    return String(str)
      .replace(/[۰-۹]/g, function (d) {
        return String(d.charCodeAt(0) - 1776);
      })
      .replace(/[٠-٩]/g, function (d) {
        return String(d.charCodeAt(0) - 1632);
      });
  }

  function parseAmount(str) {
    var cleaned = toEnglishDigits(str).replace(/[^\d]/g, '');
    return parseInt(cleaned, 10) || 0;
  }

  // نمایش با جداکننده سه‌رقمی فارسی
  function formatAmountDisplay(num) {
    if (!num || isNaN(num)) return '';
    return Number(num).toLocaleString('fa-IR');
  }

  function getAmount() {
    return parseAmount(amountInput.value);
  }

  function setAmount(val) {
    if (val < CONFIG.MIN_AMOUNT) val = CONFIG.MIN_AMOUNT;
    val = Math.round(val / STEP) * STEP;
    if (val < CONFIG.MIN_AMOUNT) val = CONFIG.MIN_AMOUNT;
    amountInput.value = formatAmountDisplay(val);
    quickBtns.forEach(function (b) {
      b.classList.toggle('active', parseInt(b.getAttribute('data-amount'), 10) === val);
    });
    updatePayBtn();
  }

  function updatePayBtn() {
    payBtn.disabled = getAmount() < CONFIG.MIN_AMOUNT;
  }

  function changeBy(delta) {
    setAmount(getAmount() + delta);
  }

  function startHold(delta) {
    changeBy(delta);
    clearTimeout(holdTimer);
    clearInterval(holdInterval);
    holdTimer = setTimeout(function () {
      holdInterval = setInterval(function () {
        changeBy(delta);
      }, holdSpeed);
    }, holdDelay);
  }

  function stopHold() {
    clearTimeout(holdTimer);
    clearInterval(holdInterval);
    holdTimer = null;
    holdInterval = null;
  }

  [plusBtn, minusBtn].forEach(function (btn) {
    if (!btn) return;
    var delta = btn.id === 'amount-plus' ? STEP : -STEP;

    btn.addEventListener('mousedown', function (e) {
      e.preventDefault();
      startHold(delta);
    });
    btn.addEventListener('touchstart', function (e) {
      e.preventDefault();
      startHold(delta);
    }, { passive: false });

    btn.addEventListener('mouseup', stopHold);
    btn.addEventListener('mouseleave', stopHold);
    btn.addEventListener('touchend', stopHold);
    btn.addEventListener('touchcancel', stopHold);
  });

  document.addEventListener('contextmenu', function (e) {
    if (e.target === plusBtn || e.target === minusBtn) e.preventDefault();
  });

  // هنگام تایپ: فقط رقم نگه دار، جداکننده بزن
  amountInput.addEventListener('input', function () {
    var n = parseAmount(amountInput.value);
    var pos = amountInput.selectionStart;
    var oldLen = amountInput.value.length;
    if (n > 0) {
      amountInput.value = formatAmountDisplay(n);
    } else {
      amountInput.value = '';
    }
    // تلاش برای حفظ مکان کرسر (تقریبی)
    var newLen = amountInput.value.length;
    try {
      amountInput.setSelectionRange(
        Math.max(0, pos + (newLen - oldLen)),
        Math.max(0, pos + (newLen - oldLen))
      );
    } catch (e) {}
    quickBtns.forEach(function (b) {
      b.classList.remove('active');
    });
    updatePayBtn();
  });

  amountInput.addEventListener('blur', function () {
    var n = getAmount();
    if (n > 0) setAmount(n);
    else {
      amountInput.value = '';
      updatePayBtn();
    }
  });

  quickBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setAmount(parseInt(btn.getAttribute('data-amount'), 10));
    });
  });

  payBtn.addEventListener('click', async function () {
    var user = await getCurrentUser();
    if (!user) {
      window.location.href = 'auth.html';
      return;
    }
    var toman = getAmount();
    if (!toman || toman < CONFIG.MIN_AMOUNT) return;
    sessionStorage.setItem('pay_amount_toman', toman);
    window.location.href = 'pay.html';
  });

  setAmount(getAmount() || CONFIG.DEFAULT_AMOUNT);
});
