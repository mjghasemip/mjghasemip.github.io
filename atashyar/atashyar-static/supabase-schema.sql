-- ============================================
-- آتش یار — اسکیما Supabase
-- این فایل را در SQL Editor داشبورد Supabase اجرا کن
-- ============================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  customer_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  notes TEXT,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  receipt_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT
);

CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders (status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders (created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- هر کسی می‌تواند سفارش ثبت کند
CREATE POLICY "Anyone can insert orders"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- فقط کاربر لاگین‌شده (ادمین) می‌تواند بخواند
CREATE POLICY "Authenticated can read orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (true);

-- فقط ادمین می‌تواند وضعیت را تغییر دهد
CREATE POLICY "Authenticated can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (true);

-- ============================================
-- Storage: bucket به نام receipts (Public)
-- ============================================
-- در داشبورد: Storage → New bucket → نام: receipts → Public را فعال کن
-- سپس این دو policy را اضافه کن:

-- آپلود عمومی:
-- CREATE POLICY "Anyone can upload receipts"
-- ON storage.objects FOR INSERT
-- TO anon, authenticated
-- WITH CHECK (bucket_id = 'receipts');

-- خواندن عمومی:
-- CREATE POLICY "Anyone can view receipts"
-- ON storage.objects FOR SELECT
-- TO anon, authenticated
-- USING (bucket_id = 'receipts');
