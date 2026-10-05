// ===== Payment Page =====
document.addEventListener('DOMContentLoaded', async () => {
  const ok = await requireAuth();
  if (!ok) return;

  const amountToman = parseInt(sessionStorage.getItem('pay_amount_toman'), 10);
  if (!amountToman || amountToman < CONFIG.MIN_AMOUNT) {
    window.location.href = 'index.html';
    return;
  }

  const amountRial = amountToman * 10;

  // Display amounts
  document.getElementById('pay-amount-toman').textContent =
    formatNumber(amountToman) + ' تومان';
  document.getElementById('pay-amount-rial').textContent =
    formatNumber(amountRial) + ' ریال';

  // Card details
  const formattedCard = formatCardNumber(CONFIG.CARD_NUMBER);
  document.getElementById('card-number-display').textContent =
    toPersianDigits(formattedCard);
  document.getElementById('card-number-text').textContent = formattedCard;
  document.getElementById('card-owner-display').textContent = CONFIG.CARD_OWNER;
  document.getElementById('card-owner-text').textContent = CONFIG.CARD_OWNER;

  // Copy button
  document.querySelectorAll('.btn-copy').forEach((btn) => {
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(btn.dataset.copy).then(() => {
        btn.textContent = '✅';
        setTimeout(() => (btn.textContent = '📋'), 1500);
      });
    });
  });

  // Receipt type toggle
  const imageGroup = document.getElementById('image-upload-group');
  const textGroup = document.getElementById('text-receipt-group');
  document.querySelectorAll('input[name="receipt-type"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.value === 'image') {
        imageGroup.classList.remove('hidden');
        textGroup.classList.add('hidden');
      } else {
        imageGroup.classList.add('hidden');
        textGroup.classList.remove('hidden');
      }
    });
  });

  // Image preview
  const fileInput = document.getElementById('receipt-image');
  const preview = document.getElementById('image-preview');
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      preview.innerHTML = `<img src="${url}" alt="پیش‌نمایش فیش" />`;
      preview.classList.remove('hidden');
    } else {
      preview.classList.add('hidden');
      preview.innerHTML = '';
    }
  });

  // Submit form
  const form = document.getElementById('receipt-form');
  const errorEl = document.getElementById('receipt-error');
  const submitBtn = document.getElementById('submit-receipt-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('hidden');
    submitBtn.disabled = true;
    submitBtn.textContent = 'در حال ثبت...';

    try {
      const receiptType = document.querySelector(
        'input[name="receipt-type"]:checked'
      ).value;

      let receiptUrl = null;
      let receiptText = null;

      if (receiptType === 'image') {
        const file = fileInput.files[0];
        if (!file) {
          throw new Error('لطفاً تصویر فیش را انتخاب کنید');
        }
        // Upload to Supabase Storage
        const ext = file.name.split('.').pop() || 'jpg';
        const fileName = `${currentUser.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await window.sb.storage
          .from(CONFIG.RECEIPTS_BUCKET)
          .upload(fileName, file, { contentType: file.type, upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = window.sb.storage
          .from(CONFIG.RECEIPTS_BUCKET)
          .getPublicUrl(fileName);

        receiptUrl = urlData.publicUrl;
      } else {
        receiptText = document.getElementById('receipt-text').value.trim();
        if (!receiptText) {
          throw new Error('لطفاً متن فیش یا کد پیگیری را وارد کنید');
        }
      }

      // Insert payment record
      const { data: payment, error: insertError } = await window.sb
        .from('payments')
        .insert({
          user_id: currentUser.id,
          amount_toman: amountToman,
          amount_rial: amountRial,
          status: 'pending',
          receipt_url: receiptUrl,
          receipt_text: receiptText,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Clear session amount
      sessionStorage.removeItem('pay_amount_toman');

      // Redirect to status page with payment id
      window.location.href = `status.html?id=${payment.id}`;
    } catch (err) {
      console.error(err);
      errorEl.textContent = err.message || 'خطا در ثبت فیش';
      errorEl.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = 'ثبت فیش و ادامه';
    }
  });
});
