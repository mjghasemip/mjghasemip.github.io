// ===== Index / Amount Selection =====
document.addEventListener('DOMContentLoaded', async () => {
  const amountInput = document.getElementById('amount-toman');
  const rialValue = document.getElementById('rial-value');
  const payBtn = document.getElementById('pay-btn');
  const quickBtns = document.querySelectorAll('.quick-btn');

  function updateRial() {
    const toman = parseInt(amountInput.value, 10) || 0;
    const rial = toman * 10;
    rialValue.textContent = formatNumber(rial);

    const valid = toman >= CONFIG.MIN_AMOUNT;
    payBtn.disabled = !valid;
  }

  amountInput.addEventListener('input', () => {
    quickBtns.forEach((b) => b.classList.remove('active'));
    updateRial();
  });

  quickBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const amount = parseInt(btn.dataset.amount, 10);
      amountInput.value = amount;
      quickBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      updateRial();
    });
  });

  payBtn.addEventListener('click', async () => {
    const user = await getCurrentUser();
    if (!user) {
      window.location.href = 'auth.html';
      return;
    }

    const toman = parseInt(amountInput.value, 10);
    if (!toman || toman < CONFIG.MIN_AMOUNT) return;

    // Store amount in sessionStorage for pay page
    sessionStorage.setItem('pay_amount_toman', toman);
    window.location.href = 'pay.html';
  });

  updateRial();
});
