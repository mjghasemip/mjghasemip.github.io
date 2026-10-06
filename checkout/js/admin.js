// ===== Admin Panel =====
let selectedPaymentId = null;
let profilesCache = {};

document.addEventListener('DOMContentLoaded', async () => {
  const ok = await requireAdmin();
  if (!ok) return;

  document.querySelectorAll('.admin-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.tab;
      document.getElementById('payments-tab').classList.toggle('hidden', target !== 'payments');
      document.getElementById('users-tab').classList.toggle('hidden', target !== 'users');
      if (target === 'users') loadUsers();
    });
  });

  document.getElementById('status-filter').addEventListener('change', loadPayments);
  document.getElementById('refresh-payments').addEventListener('click', loadPayments);
  document.getElementById('refresh-users').addEventListener('click', loadUsers);

  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  document.getElementById('approve-btn').addEventListener('click', () => updatePaymentStatus('approved'));
  document.getElementById('reject-btn').addEventListener('click', () => updatePaymentStatus('rejected'));

  await loadPayments();
});

async function loadProfilesMap(userIds) {
  const missing = userIds.filter((id) => id && !profilesCache[id]);
  if (missing.length === 0) return profilesCache;

  const { data, error } = await window.sb
    .from('profiles')
    .select('id, email, full_name, role')
    .in('id', missing);

  if (error) {
    console.error('profiles load error:', error);
    return profilesCache;
  }

  (data || []).forEach((p) => {
    profilesCache[p.id] = p;
  });
  return profilesCache;
}

function profileLabel(userId) {
  const p = profilesCache[userId];
  if (!p) return '—';
  return p.full_name || p.email || '—';
}

function profileEmail(userId) {
  const p = profilesCache[userId];
  return (p && p.email) || '—';
}

async function loadPayments() {
  const container = document.getElementById('payments-list');
  container.innerHTML = '<div class="loading-spinner"></div>';

  const filter = document.getElementById('status-filter').value;
  // بدون join — FK به auth.users است نه profiles
  let query = window.sb
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false });

  if (filter !== 'all') {
    query = query.eq('status', filter);
  }

  const { data, error } = await query;

  if (error) {
    container.innerHTML = `<p class="empty-state">خطا: ${error.message}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = `<p class="empty-state">پرداختی یافت نشد.</p>`;
    return;
  }

  const userIds = [...new Set(data.map((p) => p.user_id).filter(Boolean))];
  await loadProfilesMap(userIds);

  container.innerHTML = data
    .map((p) => {
      const userName = profileLabel(p.user_id);
      return `
        <div class="admin-item" data-id="${p.id}">
          <div class="admin-item-header">
            <div>
              <div class="admin-item-amount">${formatNumber(p.amount_toman)} تومان</div>
              <div class="admin-item-meta">${escapeHtml(userName)} · ${formatDate(p.created_at)}</div>
            </div>
            <span class="status-badge ${p.status}">${STATUS_LABELS[p.status]}</span>
          </div>
        </div>
      `;
    })
    .join('');

  container.querySelectorAll('.admin-item').forEach((el) => {
    el.addEventListener('click', () => openPaymentModal(el.dataset.id));
  });
}

async function openPaymentModal(id) {
  selectedPaymentId = id;
  const modal = document.getElementById('payment-modal');
  const body = document.getElementById('modal-body');
  const actions = document.getElementById('modal-actions');
  const noteGroup = document.getElementById('admin-note-group');

  body.innerHTML = '<div class="loading-spinner"></div>';
  modal.classList.remove('hidden');

  const { data: p, error } = await window.sb
    .from('payments')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !p) {
    body.innerHTML = '<p>خطا در بارگذاری</p>';
    return;
  }

  await loadProfilesMap([p.user_id]);
  const userName = profileLabel(p.user_id);
  const userEmail = profileEmail(p.user_id);

  let receiptHtml = '';
  if (p.receipt_url) {
    receiptHtml = `
      <p><strong>فیش تصویری:</strong></p>
      <a href="${p.receipt_url}" target="_blank" rel="noopener">
        <img src="${p.receipt_url}" alt="فیش" style="max-height: 300px;" />
      </a>
    `;
  } else if (p.receipt_text) {
    receiptHtml = `
      <p><strong>متن فیش:</strong></p>
      <p style="background: var(--bg-primary); padding: 0.75rem; border-radius: 8px; white-space: pre-wrap;">${escapeHtml(p.receipt_text)}</p>
    `;
  }

  body.innerHTML = `
    <p><strong>کاربر:</strong> ${escapeHtml(userName)} (<bdi dir="ltr">${escapeHtml(userEmail)}</bdi>)</p>
    <p><strong>مبلغ:</strong> <span style="direction: rtl; display: inline-block;">${formatNumber(p.amount_toman)} تومان</span></p>
    <p><strong>وضعیت:</strong> <span class="status-badge ${p.status}">${STATUS_LABELS[p.status]}</span></p>
    <p><strong>تاریخ ثبت:</strong> ${formatDate(p.created_at)}</p>
    ${p.admin_note ? `<p><strong>یادداشت قبلی:</strong> ${escapeHtml(p.admin_note)}</p>` : ''}
    ${receiptHtml}
  `;

  if (p.status === 'pending') {
    actions.classList.remove('hidden');
    noteGroup.classList.remove('hidden');
    document.getElementById('admin-note').value = '';
  } else {
    actions.classList.add('hidden');
    noteGroup.classList.add('hidden');
  }
}

async function updatePaymentStatus(status) {
  if (!selectedPaymentId) return;

  const note = document.getElementById('admin-note').value.trim();
  const approveBtn = document.getElementById('approve-btn');
  const rejectBtn = document.getElementById('reject-btn');
  approveBtn.disabled = true;
  rejectBtn.disabled = true;

  const { error } = await window.sb
    .from('payments')
    .update({
      status,
      admin_note: note || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', selectedPaymentId);

  approveBtn.disabled = false;
  rejectBtn.disabled = false;

  if (error) {
    alert('خطا: ' + error.message);
    return;
  }

  closeModal();
  await loadPayments();
}

function closeModal() {
  document.getElementById('payment-modal').classList.add('hidden');
  selectedPaymentId = null;
}

async function loadUsers() {
  const container = document.getElementById('users-list');
  container.innerHTML = '<div class="loading-spinner"></div>';

  const { data, error } = await window.sb
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    container.innerHTML = `<p class="empty-state">خطا: ${error.message}</p>`;
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = `<p class="empty-state">کاربری یافت نشد.</p>`;
    return;
  }

  // refresh cache
  data.forEach((u) => {
    profilesCache[u.id] = u;
  });

  container.innerHTML = data
    .map(
      (u) => `
    <div class="admin-item" style="cursor: default;">
      <div class="admin-item-header">
        <div>
          <div style="font-weight: 600;">${escapeHtml(u.full_name || '—')}</div>
          <div class="admin-item-meta"><bdi dir="ltr">${escapeHtml(u.email)}</bdi> · ${formatDate(u.created_at)}</div>
        </div>
        <span class="status-badge ${u.role === 'admin' ? 'approved' : 'pending'}">${u.role === 'admin' ? 'ادمین' : 'کاربر'}</span>
      </div>
      ${
        u.role !== 'admin'
          ? `<button class="btn btn-sm btn-outline make-admin-btn" data-id="${u.id}" style="margin-top: 0.5rem;">تبدیل به ادمین</button>`
          : ''
      }
    </div>
  `
    )
    .join('');

  container.querySelectorAll('.make-admin-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm('این کاربر را به ادمین تبدیل می‌کنید؟')) return;
      const { error } = await window.sb
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', btn.dataset.id);
      if (error) alert(error.message);
      else loadUsers();
    });
  });
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
