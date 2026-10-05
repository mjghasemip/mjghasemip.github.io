// ===== Index / Amount Selection =====
document.addEventListener('DOMContentLoaded', function () {
  var STEP = 10000;
  var amountInput = document.getElementById('amount-toman');
  var rialValue = document.getElementById('rial-value');
  var payBtn = document.getElementById('pay-btn');
  var quickBtns = document.querySelectorAll('.quick-btn');
  var plusBtn = document.getElementById('amount-plus');
  var minusBtn = document.getElementById('amount-minus');

  var holdTimer = null;
  var holdInterval = null;
  var holdDelay = 400; // ms before fast mode
  var holdSpeed = 80;  // ms between steps when holding

  function getAmount() {
    return parseInt(amountInput.value, 10) || 0;
  }

  function setAmount(val) {
    if (val < CONFIG.MIN_AMOUNT) val = CONFIG.MIN_AMOUNT;
    // snap to step
    val = Math.round(val / STEP) * STEP;
    if (val < CONFIG.MIN_AMOUNT) val = CONFIG.MIN_AMOUNT;
    amountInput.value = val;
    quickBtns.forEach(function (b) {
      b.classList.toggle('active', parseInt(b.getAttribute('data-amount'), 10) === val);
    });
    updateRial();
  }

  function updateRial() {
    var toman = getAmount();
    var rial = toman * 10;
    rialValue.textContent = formatNumber(rial);
    payBtn.disabled = toman < CONFIG.MIN_AMOUNT;
  }

  function changeBy(delta) {
    setAmount(getAmount() + delta);
  }

  function startHold(delta) {
    changeBy(delta); // immediate first step
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

  // Plus / Minus with hold-to-accelerate
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

  // Prevent context menu on long press
  document.addEventListener('contextmenu', function (e) {
    if (e.target === plusBtn || e.target === minusBtn) e.preventDefault();
  });

  amountInput.addEventListener('input', function () {
    quickBtns.forEach(function (b) { b.classList.remove('active'); });
    updateRial();
  });

  amountInput.addEventListener('change', function () {
    setAmount(getAmount());
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

  // initial
  if (!amountInput.value) amountInput.value = STEP;
  setAmount(getAmount() || STEP);
});
