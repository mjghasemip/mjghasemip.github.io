# آتش یار — نسخه استاتیک (GitHub Pages)

سایت کاملاً استاتیک با پرداخت کارت‌به‌کارت و پنل ادمین.
بدون نیاز به Node.js یا build — فقط فایل‌ها را روی GitHub بگذار.

## ساختار فایل‌ها

```
atashyar-static/
├── index.html          ← صفحه اصلی
├── checkout.html       ← انتخاب تعداد + مشخصات
├── payment.html        ← کارت‌به‌کارت + آپلود فیش
├── success.html        ← پیام موفقیت
├── admin/
│   ├── index.html      ← ورود ادمین
│   └── dashboard.html  ← مدیریت سفارش‌ها
├── css/style.css
├── js/
│   ├── config.js       ← ⚠️ تنظیمات (Supabase + شماره کارت + محصولات)
│   └── supabase-client.js
├── images/             ← عکس‌های محصولات را اینجا بگذار
│   ├── favicon.svg
│   └── README.txt
└── supabase-schema.sql ← اسکیما دیتابیس
```

## راه‌اندازی در ۵ دقیقه

### ۱. Supabase
1. در [supabase.com](https://supabase.com) پروژه بساز
2. **SQL Editor** → محتوای `supabase-schema.sql` را اجرا کن
3. **Storage** → New bucket به نام `receipts` (Public)
4. برای bucket دو policy اضافه کن (متن داخل فایل schema هست)
5. **Authentication → Users → Add user** → یک ادمین بساز
6. **Project Settings → API** → URL و anon key را کپی کن

### ۲. تنظیمات سایت
فایل `js/config.js` را باز کن و این‌ها را عوض کن:

```js
SUPABASE_URL: 'https://xxxxx.supabase.co',
SUPABASE_ANON_KEY: 'eyJhbGciOi...',
CARD_NUMBER: '6037-9971-XXXX-XXXX',
CARD_OWNER: 'آتش یار',
```

### ۳. آپلود روی GitHub
1. ریپوی جدید بساز (مثلاً `atashyar`)
2. تمام محتویات این پوشه را push کن
3. Settings → Pages → Source: Deploy from branch → `main` / root
4. چند دقیقه صبر کن → سایت روی `https://USERNAME.github.io/atashyar/` بالا می‌آید

**نکته:** اگر سایت در ساب‌فولدر است (مثلاً `/atashyar/`)، لینک‌های نسبی درست کار می‌کنند.

### ۴. پنل ادمین
برو به: `https://USERNAME.github.io/atashyar/admin/`

## کجا عکس بگذارم؟

**پوشه `images/`**

| فایل | توضیح |
|------|--------|
| **`images/card.png`** | **تصویر کارت بانکی** (صفحه پرداخت) — مهم |
| `images/cube-12.jpg` | عکس مکعب ۱۲ عددی (اختیاری) |
| `images/cube-16.jpg` | عکس مکعب ۱۶ عددی (اختیاری) |
| `images/stove.jpg` | عکس اجاق سفری (اختیاری) |

برای محصولات، بعد از گذاشتن عکس در `js/config.js` بنویس:
```js
image: 'images/cube-12.jpg',
```

اگر `card.png` نباشد، یک کارت گرادیانت CSS جایگزین می‌شود.
اگر عکس محصول نباشد، آیکون 🔥 نشان داده می‌شود.

## جریان کاربر
1. محصول را انتخاب می‌کند
2. تعداد + مشخصات (اختیاری)
3. شماره کارت را می‌بیند و کپی می‌کند
4. فیش را آپلود می‌کند و «پرداخت کردم» می‌زند
5. سفارش با وضعیت pending ذخیره می‌شود
6. ادمین در پنل فیش را می‌بیند و تأیید/رد می‌کند
