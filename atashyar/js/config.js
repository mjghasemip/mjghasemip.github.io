/**
 * ===== تنظیمات سایت =====
 */
window.APP_CONFIG = {
  SUPABASE_URL: 'https://dhzvhqqaxylmovwxwoxx.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_8AuPVkRMUw6O-8WUbgRlUQ_K6Fb_LjW',

  CARD_NUMBER: '6104338946585243',
  CARD_OWNER: 'محمدجواد قاسمی پاریزی',
};

window.PRODUCTS = [
  {
    id: 'cube-12',
    name: 'مکعب آتش‌زا جامد بسته ۱۲ عددی',
    description: 'فناوری سوخت جامد، بدون بو. حرارت بالا و زمان سوختن طولانی در بسته ۱۲ عددی.',
    price: 286000,
    badge: 'NEW',
  },
  {
    id: 'cube-16',
    name: 'مکعب آتش‌زا جامد قوطی ۱۶ عددی',
    description: 'همان حرارت و کیفیت فوق‌العاده با بسته‌بندی قوطی مقاوم برای حمل ایمن‌تر و تعداد بیشتر.',
    price: 486000,
    badge: 'ویژه',
  },
  {
    id: 'stove',
    name: 'زغال سرخ‌کن و اجاق سفری',
    description: 'طراحی حرفه‌ای برای سرخ کردن سریع زغال و استفاده به عنوان اجاق برای پخت و پز.',
    price: 2650000,
  },
];

window.formatPrice = function (n) {
  return new Intl.NumberFormat('fa-IR').format(n) + ' تومان';
};

/** ترجمه پیام‌های خطای Supabase به فارسی */
window.translateError = function (msg) {
  if (!msg) return 'خطای ناشناخته رخ داد';
  const m = String(msg).toLowerCase();
  const map = [
    [/email not confirmed/i, 'ایمیل شما هنوز تأیید نشده است. لطفاً صندوق ایمیل را چک کنید یا از پنل Supabase تأیید ایمیل را غیرفعال کنید.'],
    [/invalid login credentials/i, 'ایمیل یا رمز عبور اشتباه است'],
    [/user already registered/i, 'این ایمیل قبلاً ثبت‌نام شده است'],
    [/password should be at least/i, 'رمز عبور باید حداقل ۶ کاراکتر باشد'],
    [/unable to validate email/i, 'فرمت ایمیل معتبر نیست'],
    [/email rate limit/i, 'تعداد درخواست زیاد است. کمی بعد دوباره تلاش کنید'],
    [/network/i, 'خطا در اتصال به اینترنت'],
    [/failed to fetch/i, 'خطا در اتصال به سرور'],
    [/duplicate key/i, 'این اطلاعات قبلاً ثبت شده است'],
    [/jwt expired/i, 'نشست شما منقضی شده. دوباره وارد شوید'],
    [/not allowed/i, 'دسترسی مجاز نیست'],
    [/row-level security/i, 'خطای دسترسی به دیتابیس. تنظیمات RLS را بررسی کنید'],
    [/bucket not found/i, 'پوشه ذخیره‌سازی (receipts) یافت نشد'],
  ];
  for (const [re, fa] of map) {
    if (re.test(msg) || re.test(m)) return fa;
  }
  return msg; // اگر ترجمه نبود همان متن اصلی
};
