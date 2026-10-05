// ===== Status Page =====
document.addEventListener('DOMContentLoaded', async () => {
  const ok = await requireAuth();
  if (!ok) return;

  const params = new URLSearchParams(window.location.search);
  const paymentId = params.get('id');
  const statusContent = document.getElementById('status-content');
  const myPaymentsList = document.getElementById('my-payments-list');

  // Show specific payment if id provided
  if (paymentId) {
    await showPaymentStatus(paymentId, statusContent);
  } else {
    statusContent.innerHTML = `
      <div class="status-icon">📋</div>
      <h2 class="status-title">وضعیت پرداخت‌های شما</h2>
      <p class="status-desc">لیست پرداخت‌های ثبت‌شده در پایین نمایش داده می‌شود.</p>
    `;
  }

  // Load all user payments
  await loadMyPayments(myPaymentsList);
});

async function showPaymentStatus(id, container) {
  const { data: payment, error } = await window.sb
    .from('payments')
    .select('*')
    .eq('id', id)
    .eq('user_id', currentUser.id)
    .single();

  if (error || !payment) {
    container.innerHTML = `
      <div class="status-icon">❌</div>
      <h2 class="status-title">پرداخت یافت نشد</h2>
      <p class="status-desc">این پرداخت متعلق به شما نیست یا وجود ندارد.</p>
      <a href="index.html" class="btn btn-primary">بازگشت</a>
    `;
    return;
  }

  const status = payment.status;
  let icon = '⏳';
  let title = 'پرداخت در انتظار تأیید';
  let desc =
    'فیش شما ثبت شد. پس از بررسی توسط ادمین، وضعیت به‌روزرسانی می‌شود.';

  if (status === 'approved') {
    icon = '✅';
    title = 'پرداخت تأیید شد';
    desc = 'پرداخت شما با موفقیت تأیید گردید. از خرید شما متشکریم!';
  } else if (status === 'rejected') {
    icon = '❌';
    title = 'پرداخت رد شد';
    desc =
      payment.admin_note ||
      'فیش ارسالی مورد تأیید قرار نگرفت. در صورت نیاز با پشتیبانی تماس بگیرید.';
  }

  container.innerHTML = `
    <div class="status-icon">${icon}</div>
    <h2 class="status-title">${title}</h2>
    <p class="status-desc">${desc}</p>
    <div class="status-badge ${status}">${STATUS_LABELS[status]}</div>
    <div style="margin-top: 1.25rem; font-size: 0.95rem; color: var(--text-secondary);">
      <p>مبلغ: <strong style="color: var(--accent); direction: rtl; display: inline-block;">${formatNumber(payment.amount_toman)} تومان</strong></p>
      <p style="margin-top: 0.35rem;">تاریخ: ${formatDate(payment.created_at)}</p>
    </div>
    <a href="index.html" class="btn btn-outline" style="margin-top: 1.5rem;">پرداخت جدید</a>
  `;
}

async function loadMyPayments(container) {
  const { data: payments, error } = await window.sb
    .from('payments')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });

  if (error) {
    container.innerHTML = `<p class="empty-state">خطا در بارگذاری پرداخت‌ها</p>`;
    return;
  }

  if (!payments || payments.length === 0) {
    container.innerHTML = `<p class="empty-state">هنوز پرداختی ثبت نشده است.</p>`;
    return;
  }

  container.innerHTML = payments
    .map(
      (p) => `
    <a href="status.html?id=${p.id}" class="payment-item" style="text-decoration: none; color: inherit;">
      <div class="payment-item-info">
        <div class="payment-item-amount">${formatNumber(p.amount_toman)} تومان</div>
        <div class="payment-item-date">${formatDate(p.created_at)}</div>
      </div>
      <span class="status-badge ${p.status}">${STATUS_LABELS[p.status]}</span>
    </a>
  `
    )
    .join('');
}
