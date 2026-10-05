/**
 * ===== تنظیمات سایت =====
 * این مقادیر را با اطلاعات پروژه Supabase خودت عوض کن.
 * شماره کارت را هم اینجا وارد کن.
 */
window.APP_CONFIG = {
  // از Project Settings → API در داشبورد Supabase بگیر
  SUPABASE_URL: 'https://YOUR_PROJECT.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_ANON_KEY',

  // شماره کارت برای پرداخت کارت‌به‌کارت
  CARD_NUMBER: '6037-9971-1234-5678',
  CARD_OWNER: 'آتش یار',
};

// محصولات (می‌تونی قیمت و توضیحات را تغییر بدهی)
window.PRODUCTS = [
  {
    id: 'cube-12',
    name: 'مکعب آتش‌زا جامد بسته ۱۲ عددی',
    description: 'فناوری سوخت جامد، بدون بو. حرارت بالا و زمان سوختن طولانی در بسته ۱۲ عددی.',
    price: 286000,
    badge: 'NEW',
    // اگر عکس داری: image: 'images/cube-12.jpg'
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
