// ===== Configuration =====
const CONFIG = {
  SUPABASE_URL: 'https://njyuxejtjhhzkwcnqwtb.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_cf--yZc4tNAfU8tP2cjJMA_cosxLLfF',

  // شماره کارت برای پرداخت کارت‌به‌کارت
  CARD_NUMBER: '6104338946585243',
  CARD_OWNER: 'محمدجواد قاسمی پاریزی',
  CARD_BANK: 'بانک ملت',

  // حداقل مبلغ (تومان)
  MIN_AMOUNT: 10000,

  // Storage bucket for receipts
  RECEIPTS_BUCKET: 'receipts',

  // دامنه ساختگی برای ورود با موبایل (بدون تغییر دیتابیس)
  PHONE_EMAIL_DOMAIN: 'phone.local',

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

// نرمال‌سازی شماره موبایل ایران (فقط رقم، با 09)
function normalizePhone(raw) {
  if (!raw) return '';
  var s = String(raw).replace(/\D/g, '');
  if (s.indexOf('98') === 0 && s.length === 12) s = '0' + s.slice(2);
  if (s.indexOf('9') === 0 && s.length === 10) s = '0' + s;
  return s;
}

function isValidIranMobile(phone) {
  return /^09\d{9}$/.test(phone);
}

// ایمیل ساختگی از شماره: 0912...@phone.local
function phoneToEmail(phone) {
  return normalizePhone(phone) + '@' + CONFIG.PHONE_EMAIL_DOMAIN;
}

// رمز عبور از روی شماره (بدون فیلد جدا)
function phoneToPassword(phone) {
  return 'p_' + normalizePhone(phone) + '_atash';
}
