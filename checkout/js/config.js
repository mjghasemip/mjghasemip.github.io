// ===== Configuration =====
const CONFIG = {
  SUPABASE_URL: 'https://njyuxejtjhhzkwcnqwtb.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_cf--yZc4tNAfU8tP2cjJMA_cosxLLfF',

  // شماره کارت برای پرداخت کارت‌به‌کارت
  CARD_NUMBER: '6104338946585243',
  CARD_OWNER: 'محمدجواد قاسمی پاریزی',
  CARD_BANK: 'بانک ملت',

  // حداقل مبلغ (تومان)
  MIN_AMOUNT: 1000,

  // Storage bucket for receipts
  RECEIPTS_BUCKET: 'receipts',
};

// Format number with Persian separators
function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '۰';
  return Number(num).toLocaleString('fa-IR');
}

// Convert English digits to Persian
function toPersianDigits(str) {
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(str).replace(/\d/g, (d) => persian[d]);
}

// Format card number with dashes
function formatCardNumber(num) {
  const cleaned = String(num).replace(/\D/g, '');
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1-');
}

// Format date to Persian locale
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Status labels
const STATUS_LABELS = {
  pending: 'در انتظار تأیید',
  approved: 'تأیید شده',
  rejected: 'رد شده',
};
