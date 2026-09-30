/*!
 * InvoiceCraft — Professional Invoice Generator
 * Pure HTML/CSS/JavaScript · No backend · Data stays in the browser (localStorage)
 *
 * Sections:
 *  1. Config            6. Editor UI (form, items, totals)
 *  2. Translations      7. Live preview (invoice HTML)
 *  3. Helpers           8. Drafts, autosave, numbering
 *  4. State             9. PDF export & print
 *  5. Calculations     10. Actions, events & init
 */
(() => {
  'use strict';

  /* =====================================================================
     1. CONFIG — tweak these to rebrand / customize
     ===================================================================== */
  const KEYS = {                         // localStorage keys
    autosave: 'ic.autosave',
    drafts:   'ic.drafts',
    counter:  'ic.counter',
    prefs:    'ic.prefs'
  };
  const NUMBER_PREFIX = 'INV-';          // → INV-001, INV-002 …
  const NUMBER_PAD = 3;
  const AUTOSAVE_MS = 30000;             // auto-save every 30 seconds
  const PAGE_W = 794, PAGE_H = 1123;     // A4 at 96 dpi (CSS px)
  const MAX_LOGO_MB = 5;
  const TEMPLATES = ['minimal', 'classic', 'modern'];
  const ACCENTS = ['#2563eb', '#1e40af', '#0284c7', '#4f46e5', '#0f766e', '#334155', '#0f172a'];
  const CURRENCIES = ['USD', 'EUR', 'GBP', 'IQD', 'SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD',
                      'EGP', 'MAD', 'TRY', 'CAD', 'AUD', 'CHF', 'INR', 'PKR', 'JPY', 'CNY', 'BRL', 'MXN', 'NGN', 'ZAR'];

  /** DEMO BUILD — set to false for the full (paid) version. */
  const DEMO_MODE = true;
  const DEMO_WATERMARK = 'نسخة تجريبية — InvoiceCraft Demo';

  /* =====================================================================
     2. TRANSLATIONS (English / Arabic)
     ===================================================================== */
  const I18N = {
    en: {
      brandTag: 'Invoice Generator', new: 'New', sample: 'Sample Data', save: 'Save Draft', drafts: 'Load Draft',
      clear: 'Clear All', print: 'Print', download: 'Download PDF', langToggle: 'العربية',
      tabEdit: 'Edit', tabPreview: 'Preview',
      secDesign: 'Design', template: 'Template', tplMinimal: 'Minimal', tplClassic: 'Classic', tplModern: 'Modern',
      accent: 'Accent color', customColor: 'Custom color',
      secFrom: 'Your Business', secClient: 'Bill To', secDetails: 'Invoice Details', secItems: 'Line Items',
      secTotals: 'Tax & Discount', secNotes: 'Notes & Terms',
      logoDrop: 'Click or drop your logo', logoHint: `PNG, JPG or SVG · max ${MAX_LOGO_MB} MB`, logoRemove: 'Remove',
      name: 'Full name', company: 'Company', email: 'Email', phone: 'Phone', address: 'Address',
      phName: 'Jane Doe', phCompany: 'Acme Studio', phEmail: 'jane@acme.com', phPhone: '+1 555 000 1234',
      phAddress: 'Street, City, Country', phClientName: 'Client name', phClientCompany: 'Client company',
      phClientEmail: 'billing@client.com',
      invNumber: 'Invoice #', currency: 'Currency', issueDate: 'Issue date', dueDate: 'Due date',
      dueIn: 'Due in (days):', dueNow: 'On receipt',
      status: 'Status stamp', stNone: 'None', stUnpaid: 'Unpaid', stPaid: 'Paid', stOverdue: 'Overdue',
      description: 'Description', qty: 'Qty', rate: 'Rate', amount: 'Amount',
      phItem: 'Item or service description', addItem: 'Add item', removeItem: 'Remove item',
      taxRate: 'Tax rate (%)', discount: 'Discount',
      notes: 'Notes', terms: 'Payment terms',
      phNotes: 'Thank you for your business!', phTerms: 'e.g. Payment due within 14 days. Bank: … IBAN: …',
      subtotal: 'Subtotal', tax: 'Tax', discountLbl: 'Discount', total: 'Total', amountDue: 'Amount due',
      privacy: '🔒 100% private — your data never leaves this browser.',
      livePreview: 'Live preview', previewSub: 'A4 · updates as you type',
      // Invoice document labels
      invTitle: 'Invoice', invFrom: 'From', invTo: 'Bill to', invIssued: 'Issue date', invDue: 'Due date',
      invNotes: 'Notes', invTerms: 'Payment terms', invThanks: 'Thank you for your business!',
      invNoItems: 'No line items yet — add your first item in the editor.',
      // Status & messages
      statusSaved: 'Saved {t}', statusUnsaved: 'Unsaved changes', statusReady: 'Auto-save on',
      draftsTitle: 'Saved drafts', draftsEmpty: 'No drafts yet',
      draftsEmptyHint: 'Click “Save Draft” to keep an invoice for later.', open: 'Open', del: 'Delete',
      noClient: 'No client', cancel: 'Cancel',
      confirmClearTitle: 'Clear everything?',
      confirmClearMsg: 'All fields of the current invoice will be erased. Saved drafts are not affected.',
      confirmClearOk: 'Clear all',
      confirmDelTitle: 'Delete this draft?', confirmDelMsg: 'Draft {n} will be permanently deleted.', confirmDelOk: 'Delete',
      toastSaved: 'Draft {n} saved', toastLoaded: 'Draft {n} opened', toastDeleted: 'Draft deleted',
      toastCleared: 'Invoice cleared', toastSample: 'Sample invoice loaded', toastNew: 'New invoice {n} — your business details were kept',
      toastPdf: 'Generating PDF…', toastPdfOk: 'PDF downloaded', toastPdfErr: 'Could not create the PDF. Try Print → “Save as PDF”.',
      toastLib: 'PDF engine not loaded (offline?). Use Print → “Save as PDF” instead.',
      toastLogoBig: `Logo is too large (max ${MAX_LOGO_MB} MB)`, toastBadImg: 'Please choose an image file',
      toastQuota: 'Browser storage is full — delete some drafts or use a smaller logo.',
      toastWelcome: 'Welcome! Here’s a sample invoice — press “New” to start your own.'
    },
    ar: {
      brandTag: 'مُنشئ الفواتير', new: 'جديدة', sample: 'بيانات تجريبية', save: 'حفظ كمسودة', drafts: 'فتح مسودة',
      clear: 'مسح الكل', print: 'طباعة', download: 'تحميل PDF', langToggle: 'English',
      tabEdit: 'تحرير', tabPreview: 'معاينة',
      secDesign: 'التصميم', template: 'القالب', tplMinimal: 'بسيط', tplClassic: 'كلاسيكي', tplModern: 'عصري',
      accent: 'اللون الأساسي', customColor: 'لون مخصص',
      secFrom: 'بيانات عملك', secClient: 'فاتورة إلى', secDetails: 'تفاصيل الفاتورة', secItems: 'البنود',
      secTotals: 'الضريبة والخصم', secNotes: 'ملاحظات وشروط',
      logoDrop: 'انقر أو اسحب شعارك هنا', logoHint: `PNG أو JPG أو SVG · الحد ${MAX_LOGO_MB} ميغابايت`, logoRemove: 'إزالة',
      name: 'الاسم الكامل', company: 'الشركة', email: 'البريد الإلكتروني', phone: 'الهاتف', address: 'العنوان',
      phName: 'محمد أحمد', phCompany: 'استوديو الإبداع', phEmail: 'name@company.com', phPhone: '+964 770 000 0000',
      phAddress: 'الشارع، المدينة، الدولة', phClientName: 'اسم العميل', phClientCompany: 'شركة العميل',
      phClientEmail: 'billing@client.com',
      invNumber: 'رقم الفاتورة', currency: 'العملة', issueDate: 'تاريخ الإصدار', dueDate: 'تاريخ الاستحقاق',
      dueIn: 'الاستحقاق خلال (أيام):', dueNow: 'عند الاستلام',
      status: 'ختم الحالة', stNone: 'بدون', stUnpaid: 'غير مدفوعة', stPaid: 'مدفوعة', stOverdue: 'متأخرة',
      description: 'الوصف', qty: 'الكمية', rate: 'السعر', amount: 'المبلغ',
      phItem: 'وصف المنتج أو الخدمة', addItem: 'إضافة بند', removeItem: 'حذف البند',
      taxRate: 'نسبة الضريبة (%)', discount: 'الخصم',
      notes: 'ملاحظات', terms: 'شروط الدفع',
      phNotes: 'شكراً لتعاملكم معنا!', phTerms: 'مثال: يُستحق الدفع خلال 14 يوماً. البنك: … رقم الحساب: …',
      subtotal: 'المجموع الفرعي', tax: 'الضريبة', discountLbl: 'الخصم', total: 'الإجمالي', amountDue: 'المبلغ المستحق',
      privacy: '🔒 خصوصية تامة — بياناتك لا تغادر متصفحك أبداً.',
      livePreview: 'معاينة مباشرة', previewSub: 'A4 · تتحدث أثناء الكتابة',
      invTitle: 'فاتورة', invFrom: 'من', invTo: 'فاتورة إلى', invIssued: 'تاريخ الإصدار', invDue: 'تاريخ الاستحقاق',
      invNotes: 'ملاحظات', invTerms: 'شروط الدفع', invThanks: 'شكراً لتعاملكم معنا!',
      invNoItems: 'لا توجد بنود بعد — أضف أول بند من المحرر.',
      statusSaved: 'حُفظ {t}', statusUnsaved: 'تغييرات غير محفوظة', statusReady: 'الحفظ التلقائي مفعّل',
      draftsTitle: 'المسودات المحفوظة', draftsEmpty: 'لا توجد مسودات بعد',
      draftsEmptyHint: 'اضغط «حفظ كمسودة» للاحتفاظ بالفاتورة لاحقاً.', open: 'فتح', del: 'حذف',
      noClient: 'بدون عميل', cancel: 'إلغاء',
      confirmClearTitle: 'مسح كل شيء؟', confirmClearMsg: 'سيتم مسح جميع حقول الفاتورة الحالية. المسودات المحفوظة لن تتأثر.',
      confirmClearOk: 'مسح الكل',
      confirmDelTitle: 'حذف هذه المسودة؟', confirmDelMsg: 'سيتم حذف المسودة {n} نهائياً.', confirmDelOk: 'حذف',
      toastSaved: 'تم حفظ المسودة {n}', toastLoaded: 'تم فتح المسودة {n}', toastDeleted: 'تم حذف المسودة',
      toastCleared: 'تم مسح الفاتورة', toastSample: 'تم تحميل فاتورة تجريبية', toastNew: 'فاتورة جديدة {n} — تم الاحتفاظ ببيانات عملك',
      toastPdf: 'جارٍ إنشاء ملف PDF…', toastPdfOk: 'تم تحميل ملف PDF', toastPdfErr: 'تعذّر إنشاء PDF. جرّب الطباعة ← «حفظ كـ PDF».',
      toastLib: 'محرك PDF غير محمّل (بدون اتصال؟). استخدم الطباعة ← «حفظ كـ PDF».',
      toastLogoBig: `حجم الشعار كبير جداً (الحد ${MAX_LOGO_MB} ميغابايت)`, toastBadImg: 'يرجى اختيار ملف صورة',
      toastQuota: 'مساحة التخزين ممتلئة — احذف بعض المسودات أو استخدم شعاراً أصغر.',
      toastWelcome: 'مرحباً! هذه فاتورة تجريبية — اضغط «جديدة» لبدء فاتورتك.'
    }
  };

  /* =====================================================================
     3. HELPERS
     ===================================================================== */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : 0; };
  const pad = (n, len = 2) => String(n).padStart(len, '0');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nl2br = (s) => esc(s).replace(/\n/g, '<br>');
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const todayISO = () => toISO(new Date());
  const addDays = (iso, days) => {
    const d = new Date((iso || todayISO()) + 'T00:00:00');
    if (isNaN(d)) return '';
    d.setDate(d.getDate() + days);
    return toISO(d);
  };
  const getPath = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  const setPath = (obj, path, val) => {
    const keys = path.split('.'); const last = keys.pop();
    keys.reduce((o, k) => o[k], obj)[last] = val;
  };
  const hexToRgba = (hex, a) => {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const n = parseInt(full, 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  };

  /** Safe localStorage wrapper (handles quota errors & private mode). */
  const store = {
    get(key, fallback = null) {
      try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); }
      catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch { toast(t('toastQuota'), 'error'); return false; }
    },
    remove(key) { try { localStorage.removeItem(key); } catch { /* ignore */ } }
  };

  /* =====================================================================
     4. STATE
     ===================================================================== */
  let prefs = Object.assign({ lang: 'en' }, store.get(KEYS.prefs, {}));
  let state = null;         // current invoice (set in init)
  let dirty = false;        // unsaved changes since last autosave
  let lastSavedAt = null;

  /** Translate a key, with optional {placeholders}. */
  function t(key, vars) {
    let s = (I18N[prefs.lang] && I18N[prefs.lang][key]) ?? I18N.en[key] ?? key;
    if (vars) Object.keys(vars).forEach((k) => { s = s.replace(`{${k}}`, vars[k]); });
    return s;
  }

  /* ---- Invoice numbering (INV-001, INV-002 …) ---- */
  const getCounter = () => parseInt(store.get(KEYS.counter, 0), 10) || 0;
  const numberValue = (str) => { const m = String(str || '').match(/(\d+)(?!.*\d)/); return m ? parseInt(m[1], 10) : 0; };
  const nextNumber = () => NUMBER_PREFIX + pad(getCounter() + 1, NUMBER_PAD);
  /** Mark a number as "used" (on save / download / print) so the next "New" gets the following one. */
  function commitNumber(str) {
    const n = numberValue(str);
    if (n > getCounter()) store.set(KEYS.counter, n);
  }

  /** A fresh, empty invoice. `keep` lets us carry over sender info/design. */
  function blankState(keep = {}) {
    const today = todayISO();
    return {
      template: keep.template || 'modern',
      accent: keep.accent || ACCENTS[0],
      sender: keep.sender ? clone(keep.sender) : { name: '', company: '', address: '', email: '', phone: '', logo: '' },
      client: { name: '', company: '', address: '', email: '' },
      invoice: { number: nextNumber(), date: today, due: addDays(today, 14), currency: keep.currency || 'USD', status: '' },
      items: [{ desc: '', qty: 1, rate: '' }],
      taxRate: '', discount: '', discountType: 'percent',
      notes: '', terms: ''
    };
  }

  /** Merge loaded data over defaults so older/partial saves never break the app. */
  function normalize(data) {
    const base = blankState();
    if (!data || typeof data !== 'object') return base;
    const s = Object.assign(base, data);
    s.sender = Object.assign(blankState().sender, data.sender || {});
    s.client = Object.assign(blankState().client, data.client || {});
    s.invoice = Object.assign(blankState().invoice, data.invoice || {});
    s.items = Array.isArray(data.items) && data.items.length ? data.items : base.items;
    if (!TEMPLATES.includes(s.template)) s.template = 'modern';
    return s;
  }

  /** Demo invoice — localized for EN / AR. */
  function sampleState() {
    const today = todayISO();
    const logo = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e3a8a"/><stop offset="1" stop-color="#38bdf8"/></linearGradient></defs>' +
      '<rect width="120" height="120" rx="28" fill="url(#g)"/>' +
      '<path d="M32 84V36l28 26 28-26v48" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    const base = {
      template: state ? state.template : 'modern',
      accent: state ? state.accent : ACCENTS[0],
      invoice: { number: nextNumber(), date: today, due: addDays(today, 14), currency: 'USD', status: 'unpaid' },
      discountType: 'percent'
    };
    if (prefs.lang === 'ar') {
      return normalize(Object.assign(base, {
        sender: { name: 'أحمد الساعدي', company: 'استوديو الرافدين للتصميم', address: 'شارع الجزائر، مجمع النخيل\nالبصرة، العراق',
                  email: 'ahmed@rafidain.studio', phone: '+964 780 123 4567', logo },
        client: { name: 'سارة الموسوي', company: 'شركة دجلة للتقنية', address: 'حي المنصور، شارع 14\nبغداد، العراق', email: 'finance@dijlah.tech' },
        items: [
          { desc: 'تصميم هوية بصرية متكاملة (شعار، ألوان، خطوط)', qty: 1, rate: 1500 },
          { desc: 'تصميم واجهات موقع إلكتروني — 6 صفحات', qty: 6, rate: 300 },
          { desc: 'تطوير الواجهة الأمامية (ساعة)', qty: 20, rate: 40 },
          { desc: 'باقة صيانة ودعم شهرية', qty: 1, rate: 200 }
        ],
        taxRate: 5, discount: 10,
        notes: 'شكراً لثقتكم بنا، سعدنا بالعمل معكم ونتطلع لمشاريع قادمة!',
        terms: 'يُستحق الدفع خلال 14 يوماً من تاريخ الفاتورة.\nتحويل بنكي: مصرف الرافدين — رقم الحساب 0123456789'
      }));
    }
    return normalize(Object.assign(base, {
      sender: { name: 'Sarah Mitchell', company: 'Mitchell Creative Studio', address: '221 Harbor Street, Suite 4\nSan Francisco, CA 94107',
                email: 'hello@mitchellstudio.co', phone: '+1 (415) 555-0132', logo },
      client: { name: 'James Carter', company: 'Northwind Technologies', address: '1200 Market Avenue\nAustin, TX 78701', email: 'accounts@northwind.io' },
      items: [
        { desc: 'Brand identity design (logo, palette, typography)', qty: 1, rate: 1800 },
        { desc: 'Website UI/UX design — 6 pages', qty: 6, rate: 350 },
        { desc: 'Front-end development (hours)', qty: 24, rate: 85 },
        { desc: 'Monthly maintenance retainer', qty: 1, rate: 250 }
      ],
      taxRate: 8, discount: 5,
      notes: 'Thank you for choosing Mitchell Creative Studio — it was a pleasure working with you!',
      terms: 'Payment is due within 14 days.\nBank transfer: Bank of America · IBAN US12 3456 7890 1234 · SWIFT BOFAUS3N'
    }));
  }

  /* =====================================================================
     5. CALCULATIONS & FORMATTING
     ===================================================================== */
  function totals(s = state) {
    const subtotal = s.items.reduce((sum, it) => sum + num(it.qty) * num(it.rate), 0);
    const discount = s.discountType === 'fixed'
      ? Math.min(num(s.discount), subtotal)
      : subtotal * Math.min(num(s.discount), 100) / 100;
    const tax = (subtotal - discount) * num(s.taxRate) / 100;   // tax applied after discount
    return { subtotal, discount, tax, total: subtotal - discount + tax };
  }

  const locale = () => (prefs.lang === 'ar' ? 'ar-u-nu-latn' : 'en-US');   // Arabic text, Latin digits

  /** Currency amounts always use Western formatting ("$1,500.00") for clarity in both languages. */
  function money(value, currency = state.invoice.currency) {
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(value || 0);
    } catch {
      try { return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value || 0); }
      catch { return `${(value || 0).toFixed(2)} ${currency}`; }
    }
  }
  /** Wrap left-to-right runs (money, phones, emails, numbers) so they never get scrambled in RTL. */
  const ltr = (html) => `<span class="ltr">${html}</span>`;
  const M = (value, currency, prefix = '') => ltr(prefix + money(value, currency));
  const qtyFmt = (v) => new Intl.NumberFormat(locale(), { maximumFractionDigits: 3 }).format(num(v));

  function fmtDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    return new Intl.DateTimeFormat(locale(), { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
  }

  function currencySymbol(code) {
    try {
      const part = new Intl.NumberFormat('en-US', { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' })
        .formatToParts(0).find((p) => p.type === 'currency');
      return part ? part.value : code;
    } catch { return code; }
  }

  /* =====================================================================
     6. EDITOR UI
     ===================================================================== */

  /** Apply the language to the whole UI (text, placeholders, direction). */
  function applyLanguage() {
    const html = document.documentElement;
    html.lang = prefs.lang;
    html.dir = prefs.lang === 'ar' ? 'rtl' : 'ltr';
    $$('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$('[data-i18n-ph]').forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    $$('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
    buildCurrencyOptions();
    buildSwatches();
    renderItems();
    renderMiniTotals();
    updateSaveStatus();
    renderPreview();
  }

  function buildCurrencyOptions() {
    const sel = $('#currencySelect');
    let names = null;
    try { names = new Intl.DisplayNames([prefs.lang], { type: 'currency' }); } catch { /* old browsers */ }
    sel.innerHTML = CURRENCIES.map((c) =>
      `<option value="${c}">${c} — ${esc(names ? names.of(c) : c)}</option>`).join('');
    sel.value = state.invoice.currency;
  }

  function buildSwatches() {
    const isCustom = !ACCENTS.includes(state.accent);
    $('#swatches').innerHTML = ACCENTS.map((c) =>
      `<button type="button" class="swatch${c === state.accent ? ' active' : ''}" style="background:${c}"
        data-action="accent" data-value="${c}" aria-label="${c}"></button>`).join('') +
      `<label class="swatch swatch-custom${isCustom ? ' active' : ''}" title="${esc(t('customColor'))}">
        <input type="color" id="customAccent" value="${esc(state.accent)}"></label>`;
  }

  /** Push the state into every form control. */
  function fillForm() {
    $$('[data-bind]').forEach((el) => {
      const v = getPath(state, el.dataset.bind);
      el.value = v ?? '';
    });
    $$('.tpl-btn').forEach((b) => b.classList.toggle('active', b.dataset.value === state.template));
    $$('[data-action="discount-type"]').forEach((b) => b.classList.toggle('active', b.dataset.value === state.discountType));
    $$('.tpl-thumb').forEach((el) => el.style.setProperty('--a', state.accent));
    buildCurrencyOptions();
    buildSwatches();
    updateLogoUI();
    renderItems();
    renderMiniTotals();
  }

  function updateLogoUI() {
    const logo = state.sender.logo;
    const img = $('#logoPreview');
    img.hidden = !logo;
    if (logo) img.src = logo; else img.removeAttribute('src');
    $('#dzEmpty').hidden = !!logo;
    $('#logoRemove').hidden = !logo;
  }

  /** (Re)build item rows. Only called on add/remove/load so typing never loses focus. */
  function renderItems() {
    $('#itemsList').innerHTML = state.items.map((it, i) => `
      <div class="item-row" data-index="${i}">
        <div class="cell cell-desc"><span class="cell-label">${esc(t('description'))}</span>
          <input type="text" data-field="desc" value="${esc(it.desc)}" placeholder="${esc(t('phItem'))}" aria-label="${esc(t('description'))}"></div>
        <div class="cell cell-qty"><span class="cell-label">${esc(t('qty'))}</span>
          <input type="number" data-field="qty" value="${esc(it.qty)}" min="0" step="any" inputmode="decimal" placeholder="1" aria-label="${esc(t('qty'))}"></div>
        <div class="cell cell-rate"><span class="cell-label">${esc(t('rate'))}</span>
          <input type="number" data-field="rate" value="${esc(it.rate)}" min="0" step="any" inputmode="decimal" placeholder="0.00" aria-label="${esc(t('rate'))}"></div>
        <div class="item-amount">${M(num(it.qty) * num(it.rate))}</div>
        <button type="button" class="icon-btn danger" data-action="remove-item" title="${esc(t('removeItem'))}" aria-label="${esc(t('removeItem'))}">
          <svg class="ic"><use href="#i-trash"/></svg></button>
      </div>`).join('');
  }

  function updateRowAmount(i) {
    const row = $(`.item-row[data-index="${i}"] .item-amount`);
    if (row) row.innerHTML = M(num(state.items[i].qty) * num(state.items[i].rate));
  }

  function renderMiniTotals() {
    const x = totals();
    $('#miniTotals').innerHTML = `
      <div class="row"><span>${t('subtotal')}</span><span>${M(x.subtotal)}</span></div>
      ${x.discount ? `<div class="row"><span>${t('discountLbl')}</span><span>${M(x.discount, undefined, '−')}</span></div>` : ''}
      ${x.tax ? `<div class="row"><span>${t('tax')} (${num(state.taxRate)}%)</span><span>${M(x.tax)}</span></div>` : ''}
      <div class="row total"><span>${t('total')}</span><span>${M(x.total)}</span></div>`;
    $('#fixedBtn').textContent = currencySymbol(state.invoice.currency);
  }

  function updateSaveStatus() {
    const el = $('#saveStatus');
    el.classList.toggle('unsaved', dirty);
    const time = lastSavedAt ? new Intl.DateTimeFormat(locale(), { hour: '2-digit', minute: '2-digit' }).format(lastSavedAt) : '';
    $('.txt', el).textContent = dirty ? t('statusUnsaved') : (lastSavedAt ? t('statusSaved', { t: time }) : t('statusReady'));
  }

  function updateDraftCount() {
    const n = store.get(KEYS.drafts, []).length;
    const el = $('#draftCount');
    el.textContent = n;
    el.hidden = n === 0;
  }

  /* =====================================================================
     7. LIVE PREVIEW — builds the invoice document HTML
     ===================================================================== */
  function renderPreview() {
    const s = state, x = totals(), sd = s.sender, cl = s.client;
    const inv = $('#invoice');
    inv.className = `inv tpl-${s.template}`;
    inv.dir = prefs.lang === 'ar' ? 'rtl' : 'ltr';
    inv.lang = prefs.lang;
    inv.style.setProperty('--accent', s.accent);
    inv.style.setProperty('--accent-soft', hexToRgba(s.accent, 0.08));

    const fromName = sd.company || sd.name;
    const clientName = cl.company || cl.name;
    const line = (v) => (v ? `<div class="inv-line">${nl2br(v)}</div>` : '');
    const lineLtr = (v) => (v ? `<div class="inv-line">${ltr(esc(v))}</div>` : '');
    const statusLabel = { paid: t('stPaid'), unpaid: t('stUnpaid'), overdue: t('stOverdue') }[s.invoice.status];

    const rows = s.items.filter((it) => it.desc || num(it.rate) || num(it.qty) > 1);
    const rowsHTML = rows.length
      ? rows.map((it, i) => `
          <tr>
            <td class="c-idx">${pad(i + 1)}</td>
            <td class="c-desc">${nl2br(it.desc) || '—'}</td>
            <td class="c-num">${qtyFmt(it.qty)}</td>
            <td class="c-num">${M(num(it.rate))}</td>
            <td class="c-num c-amt">${M(num(it.qty) * num(it.rate))}</td>
          </tr>`).join('')
      : `<tr class="inv-empty"><td colspan="5">${t('invNoItems')}</td></tr>`;

    const discountLabel = s.discountType === 'percent' && num(s.discount) ? ` (${num(s.discount)}%)` : '';
    const contact = [sd.email, sd.phone].filter(Boolean).map((v) => ltr(esc(v))).join('  ·  ');

    inv.innerHTML = `
      <header class="inv-top">
        <div class="inv-brand">
          ${sd.logo ? `<img class="inv-logo" src="${sd.logo}" alt="">` : ''}
          <div>
            ${fromName ? `<div class="inv-company">${esc(fromName)}</div>` : ''}
            ${sd.company && sd.name ? `<div class="inv-person">${esc(sd.name)}</div>` : ''}
          </div>
        </div>
        <div class="inv-heading">
          <h1 class="inv-title">${t('invTitle')}</h1>
          <div class="inv-number">${ltr('# ' + esc(s.invoice.number))}</div>
          ${statusLabel ? `<span class="inv-badge badge-${s.invoice.status}">${statusLabel}</span>` : ''}
        </div>
      </header>

      <div class="inv-body">
        <section class="inv-parties">
          <div class="inv-party">
            <span class="inv-label">${t('invFrom')}</span>
            ${fromName ? `<div class="inv-party-name">${esc(fromName)}</div>` : ''}
            ${sd.company && sd.name ? line(sd.name) : ''}
            ${line(sd.address)}${lineLtr(sd.email)}${lineLtr(sd.phone)}
          </div>
          <div class="inv-party">
            <span class="inv-label">${t('invTo')}</span>
            ${clientName ? `<div class="inv-party-name">${esc(clientName)}</div>` : ''}
            ${cl.company && cl.name ? line(cl.name) : ''}
            ${line(cl.address)}${lineLtr(cl.email)}
          </div>
          <div class="inv-dates">
            <div><span class="inv-label">${t('invIssued')}</span><strong>${fmtDate(s.invoice.date)}</strong></div>
            <div><span class="inv-label">${t('invDue')}</span><strong>${fmtDate(s.invoice.due)}</strong></div>
            <div class="inv-due-amt"><span class="inv-label">${t('amountDue')}</span><strong>${M(x.total)}</strong></div>
          </div>
        </section>

        <table class="inv-table">
          <thead><tr>
            <th class="c-idx">#</th>
            <th class="c-desc">${t('description')}</th>
            <th class="c-num">${t('qty')}</th>
            <th class="c-num">${t('rate')}</th>
            <th class="c-num">${t('amount')}</th>
          </tr></thead>
          <tbody>${rowsHTML}</tbody>
        </table>

        <section class="inv-summary">
          <div class="inv-extra">
            ${s.notes ? `<div><span class="inv-label">${t('invNotes')}</span><p>${nl2br(s.notes)}</p></div>` : ''}
            ${s.terms ? `<div><span class="inv-label">${t('invTerms')}</span><p>${nl2br(s.terms)}</p></div>` : ''}
          </div>
          <div class="inv-totals">
            <div class="inv-row"><span>${t('subtotal')}</span><span>${M(x.subtotal)}</span></div>
            ${x.discount ? `<div class="inv-row"><span>${t('discountLbl')}${discountLabel}</span><span>${M(x.discount, undefined, '−')}</span></div>` : ''}
            ${num(s.taxRate) ? `<div class="inv-row"><span>${t('tax')} (${num(s.taxRate)}%)</span><span>${M(x.tax)}</span></div>` : ''}
            <div class="inv-row inv-grand"><span>${t('total')}</span><span>${M(x.total)}</span></div>
          </div>
        </section>
      </div>

      <footer class="inv-foot">
        <strong>${t('invThanks')}</strong>
        <span>${contact}</span>
      </footer>`;

    // Demo watermark — diagonal ribbon in the bottom-right corner (also appears when printing)
    if (DEMO_MODE) {
      inv.insertAdjacentHTML('beforeend',
        `<div class="demo-ribbon" aria-hidden="true"><span dir="rtl">${esc(DEMO_WATERMARK)}</span></div>`);
    }

    $('#tplChip').textContent = t('tpl' + s.template[0].toUpperCase() + s.template.slice(1));
    fitPreview();
  }

  /** Scale the A4 paper to fit the preview column. */
  function fitPreview() {
    const wrap = $('#paperWrap'), paper = $('#paperScale');
    const avail = wrap.clientWidth;
    if (!avail) return;                       // hidden (mobile edit tab)
    const scale = Math.min(1, avail / PAGE_W);
    paper.style.transform = `scale(${scale})`;
    paper.style.left = `${Math.max(0, (avail - PAGE_W * scale) / 2)}px`;
    wrap.style.height = `${paper.offsetHeight * scale}px`;
  }

  /* =====================================================================
     8. DRAFTS, AUTOSAVE, CHANGE TRACKING
     ===================================================================== */
  let rafId = 0;
  /** Called after every edit: mark dirty and re-render preview on the next frame. */
  function changed() {
    dirty = true;
    updateSaveStatus();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => { renderPreview(); renderMiniTotals(); });
  }

  function autosave(force = false) {
    if (!dirty && !force) return;
    if (store.set(KEYS.autosave, state)) {
      dirty = false;
      lastSavedAt = new Date();
      updateSaveStatus();
    }
  }

  function saveDraft() {
    if (DEMO_MODE) {
      showDemoPopup();
      return;
    }
    const drafts = store.get(KEYS.drafts, []);
    const entry = {
      id: state.invoice.number || nextNumber(),
      savedAt: Date.now(),
      client: state.client.company || state.client.name,
      total: totals().total,
      currency: state.invoice.currency,
      data: clone(state)
    };
    const idx = drafts.findIndex((d) => d.id === entry.id);
    if (idx >= 0) drafts.splice(idx, 1);
    drafts.unshift(entry);                                  // newest first
    if (!store.set(KEYS.drafts, drafts)) return;
    commitNumber(entry.id);
    autosave(true);
    updateDraftCount();
    toast(t('toastSaved', { n: entry.id }));
  }

  function openDrafts() {
    if (DEMO_MODE) {
      showDemoPopup();
      return;
    }
    const drafts = store.get(KEYS.drafts, []);
    const list = $('#draftsList');
    if (!drafts.length) {
      list.innerHTML = `<div class="empty"><svg class="ic"><use href="#i-folder"/></svg>
        <strong>${t('draftsEmpty')}</strong>${t('draftsEmptyHint')}</div>`;
    } else {
      const dt = new Intl.DateTimeFormat(locale(), { dateStyle: 'medium', timeStyle: 'short' });
      list.innerHTML = drafts.map((d) => `
        <div class="draft">
          <div class="draft-icon"><svg class="ic"><use href="#i-file"/></svg></div>
          <div class="draft-info">
            <strong>${esc(d.id)}</strong>
            <span>${esc(d.client || t('noClient'))} · ${dt.format(new Date(d.savedAt))}</span>
          </div>
          <div class="draft-total">${M(d.total, d.currency)}</div>
          <div class="draft-actions">
            <button class="btn btn-sm btn-primary" data-action="draft-load" data-id="${esc(d.id)}">${t('open')}</button>
            <button class="icon-btn danger" data-action="draft-delete" data-id="${esc(d.id)}" title="${t('del')}" aria-label="${t('del')}">
              <svg class="ic"><use href="#i-trash"/></svg></button>
          </div>
        </div>`).join('');
    }
    openModal('#draftsModal');
  }

  function loadDraft(id) {
    if (DEMO_MODE) {
      showDemoPopup();
      return;
    }
    const d = store.get(KEYS.drafts, []).find((x) => x.id === id);
    if (!d) return;
    state = normalize(d.data);
    fillForm();
    renderPreview();
    autosave(true);
    closeModals();
    toast(t('toastLoaded', { n: id }));
  }

  async function deleteDraft(id) {
    const ok = await confirmDialog(t('confirmDelTitle'), t('confirmDelMsg', { n: id }), t('confirmDelOk'));
    if (!ok) return;
    store.set(KEYS.drafts, store.get(KEYS.drafts, []).filter((x) => x.id !== id));
    updateDraftCount();
    openDrafts();
    toast(t('toastDeleted'));
  }

  /* =====================================================================
     9. PDF EXPORT (jsPDF + html2canvas) & PRINT
     The preview is rendered to a canvas → embedded in an A4 PDF.
     This keeps Arabic shaping, fonts, logos & template styling pixel-perfect.
     ===================================================================== */
  async function downloadPDF(btn) {
    if (DEMO_MODE) {
      showDemoPopup();
      return;
    }
    if (!window.jspdf || !window.html2canvas) { toast(t('toastLib'), 'error'); return; }
    const buttons = $$('[data-action="download"]');
    buttons.forEach((b) => b.classList.add('loading'));
    toast(t('toastPdf'), 'info');
    const host = document.createElement('div');
    try {
      if (document.fonts && document.fonts.ready) await document.fonts.ready;

      // Render an unscaled clone off-screen (the preview itself is CSS-scaled)
      host.style.cssText = `position:fixed;top:0;left:-${PAGE_W * 3}px;width:${PAGE_W}px;z-index:-1;pointer-events:none;`;
      const doc = $('#invoice').cloneNode(true);
      doc.removeAttribute('id');
      host.appendChild(doc);
      document.body.appendChild(host);

      const canvas = await window.html2canvas(doc, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
        windowWidth: PAGE_W, scrollX: 0, scrollY: 0
      });

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
      const mmPerPx = 210 / PAGE_W;
      const ratio = canvas.width / doc.offsetWidth;          // canvas px per CSS px
      const totalH = doc.offsetHeight;

      if (totalH <= PAGE_H + 4) {
        // Single page — the common case
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, Math.min(297, totalH * mmPerPx));
      } else {
        // Multi-page: slice at row boundaries so no line item is cut in half
        const rootTop = doc.getBoundingClientRect().top;
        const breaks = $$('.inv-top, .inv-parties, thead, tbody tr, .inv-extra > div, .inv-totals, .inv-summary', doc)
          .map((el) => el.getBoundingClientRect().bottom - rootTop);
        const MARGIN = 40;                                     // top/bottom margin on continuation pages (px)
        let start = 0, page = 0;
        while (start < totalH - 1) {
          const top = page ? MARGIN : 0;
          let end = start + (PAGE_H - top - MARGIN);
          if (end >= totalH) end = totalH;
          else {
            const fits = breaks.filter((b) => b > start + 120 && b <= end);
            if (fits.length) end = Math.max(...fits);
          }
          const slice = document.createElement('canvas');
          slice.width = canvas.width;
          slice.height = Math.max(1, Math.round((end - start) * ratio));
          const ctx = slice.getContext('2d');
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, 0, slice.width, slice.height);
          ctx.drawImage(canvas, 0, Math.round(start * ratio), canvas.width, slice.height, 0, 0, canvas.width, slice.height);
          if (page) pdf.addPage();
          pdf.addImage(slice.toDataURL('image/jpeg', 0.95), 'JPEG', 0, top * mmPerPx, 210, (end - start) * mmPerPx);
          start = end; page++;
        }
        // Page numbers
        const count = pdf.getNumberOfPages();
        for (let i = 1; i <= count; i++) {
          pdf.setPage(i);
          pdf.setFontSize(8);
          pdf.setTextColor(148, 163, 184);
          pdf.text(`${i} / ${count}`, 105, 292, { align: 'center' });
        }
      }

      const fileBase = [state.invoice.number, state.client.company || state.client.name]
        .filter(Boolean).join('_').replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '-') || 'invoice';
      pdf.setProperties({ title: `${t('invTitle')} ${state.invoice.number}`, author: state.sender.company || state.sender.name, creator: 'InvoiceCraft' });
      pdf.save(`${fileBase}.pdf`);

      commitNumber(state.invoice.number);
      autosave(true);
      toast(t('toastPdfOk'));
    } catch (err) {
      console.error('[InvoiceCraft] PDF error:', err);
      toast(t('toastPdfErr'), 'error');
    } finally {
      host.remove();
      buttons.forEach((b) => b.classList.remove('loading'));
    }
  }

  function printInvoice() {
    commitNumber(state.invoice.number);
    autosave(true);
    const prevView = document.body.dataset.view;
    document.body.dataset.view = 'preview';                  // ensure preview is visible on mobile
    setTimeout(() => {
      window.print();
      document.body.dataset.view = prevView;
      fitPreview();
    }, 50);
  }

  /* =====================================================================
     10. ACTIONS, MODALS, TOASTS, EVENTS, INIT
     ===================================================================== */

  function handleLogo(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast(t('toastBadImg'), 'error'); return; }
    if (file.size > MAX_LOGO_MB * 1024 * 1024) { toast(t('toastLogoBig'), 'error'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // Downscale to max 480px to keep localStorage small & PDFs crisp
        let w = img.naturalWidth || 480, h = img.naturalHeight || 240;
        const r = Math.min(1, 480 / Math.max(w, h));
        w = Math.round(w * r); h = Math.round(h * r);
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        try { state.sender.logo = c.toDataURL('image/png'); } catch { state.sender.logo = reader.result; }
        updateLogoUI();
        changed();
      };
      img.onerror = () => toast(t('toastBadImg'), 'error');
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function toast(message, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    $('#toasts').appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, type === 'error' ? 4500 : 2600);
  }

  function openModal(sel) { $(sel).hidden = false; }
  function closeModals() { $$('.modal').forEach((m) => { m.hidden = true; }); }

  let confirmResolve = null;
  function confirmDialog(title, message, okText) {
    $('#confirmTitle').textContent = title;
    $('#confirmMsg').textContent = message;
    $('#confirmOk').textContent = okText;
    $('#confirmModal').hidden = false;
    setTimeout(() => $('#confirmOk').focus(), 30);
    return new Promise((resolve) => { confirmResolve = resolve; });
  }
  function resolveConfirm(value) {
    $('#confirmModal').hidden = true;
    if (confirmResolve) { confirmResolve(value); confirmResolve = null; }
  }

  function setView(view) {
    document.body.dataset.view = view;
    $$('.mobile-tabs .tab').forEach((b) => b.classList.toggle('active', b.dataset.value === view));
    window.scrollTo({ top: 0 });
    if (view === 'preview') requestAnimationFrame(fitPreview);
  }

  /** All clickable actions (buttons use data-action="…"). */
  const ACTIONS = {
    new() {
      state = blankState({ sender: state.sender, template: state.template, accent: state.accent, currency: state.invoice.currency });
      fillForm(); renderPreview(); autosave(true);
      toast(t('toastNew', { n: state.invoice.number }));
    },
    sample() {
      state = sampleState();
      fillForm(); renderPreview(); changed();
      toast(t('toastSample'));
    },
    save: saveDraft,
    drafts: openDrafts,
    async clear() {
      const ok = await confirmDialog(t('confirmClearTitle'), t('confirmClearMsg'), t('confirmClearOk'));
      if (!ok) return;
      state = blankState({ template: state.template, accent: state.accent });
      fillForm(); renderPreview(); autosave(true);
      toast(t('toastCleared'));
    },
    print: printInvoice,
    download: downloadPDF,
    lang() {
      prefs.lang = prefs.lang === 'ar' ? 'en' : 'ar';
      store.set(KEYS.prefs, prefs);
      applyLanguage();
    },
    'add-item'() {
      state.items.push({ desc: '', qty: 1, rate: '' });
      renderItems(); changed();
      const inputs = $$('.item-row [data-field="desc"]');
      inputs[inputs.length - 1].focus();
    },
    'remove-item'(btn) {
      const i = +btn.closest('.item-row').dataset.index;
      state.items.splice(i, 1);
      if (!state.items.length) state.items.push({ desc: '', qty: 1, rate: '' });
      renderItems(); changed();
    },
    template(btn) {
      state.template = btn.dataset.value;
      $$('.tpl-btn').forEach((b) => b.classList.toggle('active', b === btn));
      changed();
    },
    accent(btn) { setAccent(btn.dataset.value); },
    due(btn) {
      state.invoice.due = addDays(state.invoice.date, +btn.dataset.value);
      $('#dueInput').value = state.invoice.due;
      changed();
    },
    'discount-type'(btn) {
      state.discountType = btn.dataset.value;
      $$('[data-action="discount-type"]').forEach((b) => b.classList.toggle('active', b === btn));
      changed();
    },
    'logo-remove'() { state.sender.logo = ''; updateLogoUI(); changed(); },
    'close-modal': closeModals,
    'confirm-yes'() { resolveConfirm(true); },
    'confirm-no'() { resolveConfirm(false); },
    'draft-load'(btn) { loadDraft(btn.dataset.id); },
    'draft-delete'(btn) { deleteDraft(btn.dataset.id); },
    view(btn) { setView(btn.dataset.value); }
  };

  function setAccent(color) {
    state.accent = color;
    $$('.swatch').forEach((s) => s.classList.toggle('active', s.dataset.value === color));
    const custom = $('.swatch-custom');
    if (custom) custom.classList.toggle('active', !ACCENTS.includes(color));
    $$('.tpl-thumb').forEach((el) => el.style.setProperty('--a', color));
    changed();
  }

  function bindEvents() {
    // Generic click delegation
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn || !ACTIONS[btn.dataset.action]) return;
      e.preventDefault();
      ACTIONS[btn.dataset.action](btn, e);
    });

    // Form inputs → state (two-way binding)
    const onInput = (e) => {
      const el = e.target;
      if (el.id === 'customAccent') { setAccent(el.value); return; }
      if (el.dataset.bind) {
        setPath(state, el.dataset.bind, el.value);
        if (el.dataset.bind === 'invoice.currency') state.items.forEach((_, i) => updateRowAmount(i));
      } else if (el.dataset.field) {
        const i = +el.closest('.item-row').dataset.index;
        state.items[i][el.dataset.field] = el.value;
        updateRowAmount(i);
      } else return;
      changed();
    };
    const editor = $('#editor');
    editor.addEventListener('input', onInput);
    editor.addEventListener('change', onInput);

    // Enter in the last item's description adds a new row
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.dataset.field === 'desc') {
        e.preventDefault();
        const rows = $$('.item-row');
        const row = e.target.closest('.item-row');
        if (row === rows[rows.length - 1]) ACTIONS['add-item']();
        else $('[data-field="desc"]', rows[rows.indexOf(row) + 1]).focus();
      }
    });

    // Logo upload + drag & drop
    $('#logoInput').addEventListener('change', (e) => { handleLogo(e.target.files[0]); e.target.value = ''; });
    const dz = $('#dropzone');
    ['dragenter', 'dragover'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('drag'); }));
    ['dragleave', 'drop'].forEach((ev) => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove('drag'); }));
    dz.addEventListener('drop', (e) => handleLogo(e.dataTransfer.files[0]));

    // Keyboard shortcuts: Ctrl/Cmd+S save · Ctrl/Cmd+P print · Esc closes dialogs
    document.addEventListener('keydown', (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); saveDraft(); }
      else if (mod && e.key.toLowerCase() === 'p') { e.preventDefault(); printInvoice(); }
      else if (e.key === 'Escape') { if (confirmResolve) resolveConfirm(false); else closeModals(); }
    });

    // Keep preview scaled to its column
    let lastW = 0;
    new ResizeObserver(() => {
      const w = $('#paperWrap').clientWidth;
      if (w !== lastW) { lastW = w; fitPreview(); }
    }).observe($('#paperWrap'));
    if (document.fonts) document.fonts.ready.then(fitPreview);

    // Auto-save every 30 s, and whenever the tab is hidden/closed
    setInterval(() => autosave(), AUTOSAVE_MS);
    document.addEventListener('visibilitychange', () => { if (document.hidden) autosave(); });
    window.addEventListener('beforeunload', () => autosave());
    window.addEventListener('afterprint', fitPreview);
  }

  /* =====================================================================
     11. DEMO MODE — popup + watermark styles
     (Injected from JS so index.html / style.css stay untouched.)
     ===================================================================== */
  function injectDemoStyles() {
    if (document.getElementById('demoStyles')) return;
    const style = document.createElement('style');
    style.id = 'demoStyles';
    style.textContent = `
      /* Watermark ribbon (bottom-right, rotated 45°) */
      .inv .demo-ribbon {
        position: absolute; right: -118px; bottom: 78px; z-index: 6;
        width: 440px; padding: 11px 0;
        transform: rotate(-45deg);
        background: linear-gradient(90deg, rgba(30, 58, 138, .78), rgba(37, 99, 235, .78));
        border-top: 1px solid rgba(255, 255, 255, .35);
        border-bottom: 1px solid rgba(255, 255, 255, .35);
        box-shadow: 0 6px 18px -6px rgba(15, 23, 42, .45);
        color: #fff; text-align: center; white-space: nowrap;
        font: 700 13px/1.4 'Cairo', 'Inter', system-ui, sans-serif;
        letter-spacing: 0 !important; text-transform: none !important;
        opacity: .9; pointer-events: none; user-select: none;
      }

      /* Demo popup (reuses the app's .modal / .modal-card / .btn styles) */
      #demoModal .demo-card { overflow: hidden; padding-top: 34px; font-family: 'Cairo', 'Inter', system-ui, sans-serif; }
      #demoModal .demo-strip {
        position: absolute; top: 0; left: 0; right: 0; height: 5px;
        background: linear-gradient(90deg, #1e3a8a, #2563eb, #38bdf8);
      }
      #demoModal .demo-icon {
        width: 58px; height: 58px; margin: 0 auto; border-radius: 16px;
        display: grid; place-items: center; color: #fff;
        background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #38bdf8 100%);
        box-shadow: 0 12px 26px -10px rgba(37, 99, 235, .7);
      }
      #demoModal .demo-icon .ic { width: 26px; height: 26px; }
      #demoModal h3 { margin: 16px 0 8px; font-size: 20px; font-weight: 800; }
      #demoModal p { margin: 0 0 24px; font-size: 14.5px; line-height: 1.9; color: #475569; }
      #demoModal .btn { height: 44px; font-size: 15px; border-radius: 12px; }
    `;
    document.head.appendChild(style);
  }

  /** Modal explaining that this is a limited demo. Closes via button, backdrop or Esc. */
  function showDemoPopup() {
    closeModals();                                   // e.g. hide the drafts modal if it was open
    let modal = $('#demoModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'demoModal';
      modal.className = 'modal';
      modal.hidden = true;
      modal.innerHTML = `
        <div class="modal-backdrop" data-action="close-modal"></div>
        <div class="modal-card modal-sm demo-card" role="dialog" aria-modal="true"
             aria-labelledby="demoTitle" aria-describedby="demoMsg" dir="rtl" lang="ar">
          <span class="demo-strip" aria-hidden="true"></span>
          <div class="demo-icon" aria-hidden="true"><svg class="ic"><use href="#i-file"/></svg></div>
          <h3 id="demoTitle">🔒 نسخة تجريبية</h3>
          <p id="demoMsg">هذه نسخة تجريبية محدودة. للحصول على النسخة الكاملة مع تحميل PDF والحفظ، يرجى الشراء.</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-primary" id="demoClose" data-action="close-modal">إغلاق</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
    }
    modal.hidden = false;
    setTimeout(() => $('#demoClose').focus(), 30);
  }

  function init() {
    if (DEMO_MODE) injectDemoStyles();
    const saved = store.get(KEYS.autosave);
    const firstVisit = !saved && !getCounter() && !store.get(KEYS.drafts, []).length;
    state = saved ? normalize(saved) : (firstVisit ? sampleState() : blankState());
    if (saved) lastSavedAt = null;

    bindEvents();
    fillForm();
    applyLanguage();          // also renders preview
    updateDraftCount();
    if (firstVisit) setTimeout(() => toast(t('toastWelcome'), 'info'), 600);

    // Offline support (service worker needs http/https — not file://)
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
      window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
