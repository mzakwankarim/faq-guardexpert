# GuardExpert Pro - Frequently Asked Questions (GEP Ops & GEP Pro)

Static, zero-build editorial FAQ & help guide page covering both **GEP Ops** (supervisor companion app) and **GEP Pro** (field patrol & attendance terminal app), powered by `faqs.json` and styled to match `version-log-ops`.

## Folder Structure

```text
faq-ops/
├── index.html       # Semantic HTML shell with Favicon, Open Graph & FAQPage JSON-LD
├── assets/
│   └── logo.png     # GuardExpert Pro brand emblem
├── css/
│   └── styles.css   # Editorial light theme matching version-log-ops
├── js/
│   ├── app.js       # State, URL params (?app=, ?lang=, ?category=, ?q=, #id), search, filters, deep links
│   └── utils.js     # Localization (EN/BM), app & category metadata, search highlight, SVG icons
├── faqs.json        # Bilingual FAQ data for GEP Ops and GEP Pro
└── README.md        # Usage & maintenance guide
```

## URL Parameters (App Integration)

- **`?app=all|ops|pro`** - Filters questions to All Apps, GEP Ops (including shared items), or GEP Pro (including shared items).
- **`?lang=ms`** (or **`?lang=en`**) - Opens directly in Bahasa Melayu or English (persisted in `localStorage`).
- **`?category=general|dashboard|patrol|incidents|attendance|marshal|support`** - Opens filtered to a specific topic.
- **`?q=face`** - Pre-fills the search query and auto-expands matching answers.
- **`#register-face-id`** - Scrolls straight to a specific question and opens it automatically.

Examples opened from each mobile app:
```text
GEP Ops: https://mzakwankarim.github.io/faq-ops/?app=ops&lang=ms
GEP Pro: https://mzakwankarim.github.io/faq-ops/?app=pro&lang=ms
Direct:  https://mzakwankarim.github.io/faq-ops/?app=pro&lang=en#gep-pro-panic-mode
```

## How to Add a New FAQ

Open `faqs.json` and add a new object (`*_ms`, `steps`, and `tip` fields are optional; `*_ms` automatically falls back to English if omitted):

```json
{
  "id": "unique-question-slug",
  "app": "pro",
  "category": "patrol",
  "question": "Question in English?",
  "question_ms": "Soalan dalam Bahasa Melayu?",
  "answer": "Clear answer in English.",
  "answer_ms": "Jawapan ringkas dalam Bahasa Melayu.",
  "steps": [
    "Optional step 1 in English.",
    "Optional step 2 in English."
  ],
  "steps_ms": [
    "Langkah 1 dalam Bahasa Melayu.",
    "Langkah 2 dalam Bahasa Melayu."
  ],
  "tip": "Optional helpful note.",
  "tip_ms": "Nota tambahan pilihan."
}
```

- Valid `app` values: `ops`, `pro`, `both`.
- Valid `category` values: `general`, `dashboard`, `patrol`, `incidents`, `attendance`, `marshal`, `support`.

## Local Preview

Open with **VS Code Live Server** or run:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000`.
