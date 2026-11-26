const SVG_NS = 'http://www.w3.org/2000/svg';

const ICON_PATHS = {
  chevronDown: ['m6 9 6 6 6-6'],
  link: [
    'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
    'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
  ],
};

export const APP_FILTERS = ['all', 'ops', 'pro'];

export const CATEGORIES = [
  { id: 'general', code: 'ACCOUNT', label_en: 'General & Account', label_ms: 'Umum & Akaun' },
  { id: 'dashboard', code: 'ALERTS', label_en: 'Dashboard & Alerts', label_ms: 'Dashboard & Amaran' },
  { id: 'patrol', code: 'PATROL', label_en: 'Patrol & Checkpoints', label_ms: 'Rondaan & Checkpoint' },
  { id: 'incidents', code: 'INCIDENTS', label_en: 'Reports & Panic', label_ms: 'Laporan & Panik' },
  { id: 'attendance', code: 'ZONE', label_en: 'Attendance & Zone', label_ms: 'Kehadiran & Zon' },
  { id: 'marshal', code: 'MARSHAL', label_en: 'Marshal & Face ID', label_ms: 'Marshal & Face ID' },
  { id: 'support', code: 'SUPPORT', label_en: 'App & Support', label_ms: 'Aplikasi & Sokongan' },
];

const UI_STRINGS = {
  en: {
    docTitle: 'GuardExpert Pro - Frequently Asked Questions (GEP Ops & GEP Pro)',
    brandSection: 'FAQ',
    heroEyebrow: 'GEP Ops & GEP Pro',
    heroTitle: 'Frequently Asked Questions',
    heroLead:
      'Clear answers, operational workflows, and troubleshooting guidance for GEP Ops and GEP Pro mobile applications.',
    searchPlaceholder: 'Search GEP Ops & GEP Pro...',
    searchPlaceholderMobile: 'Search clocking, patrol, Face ID, alerts...',
    appFilterLabel: 'Application',
    appAll: 'All Apps',
    appOps: 'GEP Ops',
    appPro: 'GEP Pro',
    appBadgeOps: 'GEP Ops',
    appBadgePro: 'GEP Pro',
    appBadgeBoth: 'GEP Ops & Pro',
    tabAll: 'All',
    expandAll: 'Expand all',
    collapseAll: 'Collapse all',
    questionCount: (n) => `${n} ${n === 1 ? 'question' : 'questions'}`,
    tipLabel: 'Note',
    copyLink: 'Copy link',
    copiedLink: 'Link copied to clipboard',
    readyShare: 'Link updated in address bar',
    emptyTitle: 'No matching questions found',
    emptyDesc: 'Select another application or topic filter, or refine your search keywords.',
    resetFilters: 'Reset filters',
    errorTitle: 'Unable to load FAQs',
    retry: 'Try again',
    fileError:
      'Browsers block loading faqs.json directly via file://. Please serve this folder using a local web server (for example, VS Code Live Server or "python -m http.server 8000").',
    loadError: (msg) => `Could not load faqs.json (${msg}).`,
    supportTitle: 'Need further assistance?',
    supportDescPrefix: 'In GEP Ops, open ',
    supportDescHighlight: 'Profile > Report Bug',
    supportDescSuffix:
      ' to submit screenshots with your device context attached automatically. For GEP Pro device or operational assistance, contact our support desk.',
    supportEmailBtn: 'Contact Support',
    footerChangelog: 'GEP Ops Release Notes',
    footerPrivacy: 'Privacy Policy',
  },
  ms: {
    docTitle: 'GuardExpert Pro - Soalan Lazim (GEP Ops & GEP Pro)',
    brandSection: 'Soalan Lazim',
    heroEyebrow: 'GEP Ops & GEP Pro',
    heroTitle: 'Soalan Lazim',
    heroLead:
      'Panduan ringkas, aliran kerja operasi, dan penyelesaian isu bagi aplikasi mudah alih GEP Ops serta GEP Pro.',
    searchPlaceholder: 'Cari GEP Ops & GEP Pro...',
    searchPlaceholderMobile: 'Cari kehadiran, rondaan, Face ID, amaran...',
    appFilterLabel: 'Aplikasi',
    appAll: 'Semua Aplikasi',
    appOps: 'GEP Ops',
    appPro: 'GEP Pro',
    appBadgeOps: 'GEP Ops',
    appBadgePro: 'GEP Pro',
    appBadgeBoth: 'GEP Ops & Pro',
    tabAll: 'Semua',
    expandAll: 'Buka semua',
    collapseAll: 'Tutup semua',
    questionCount: (n) => `${n} soalan`,
    tipLabel: 'Nota',
    copyLink: 'Salin pautan',
    copiedLink: 'Pautan telah disalin',
    readyShare: 'Pautan sedia pada bar alamat',
    emptyTitle: 'Tiada soalan yang sepadan',
    emptyDesc: 'Sila pilih tapisan aplikasi atau topik lain, atau gunakan kata kunci carian berbeza.',
    resetFilters: 'Tetapkan semula tapisan',
    errorTitle: 'Gagal memuatkan senarai soalan',
    retry: 'Cuba semula',
    fileError:
      'Pelayar web menyekat bacaan faqs.json secara terus melalui file://. Sila buka folder ini menggunakan pelayan tempatan (contohnya VS Code Live Server atau "python -m http.server 8000").',
    loadError: (msg) => `Gagal memuatkan faqs.json (${msg}).`,
    supportTitle: 'Perlukan bantuan lanjut?',
    supportDescPrefix: 'Di dalam GEP Ops, buka ',
    supportDescHighlight: 'Profil > Lapor Isu (Report Bug)',
    supportDescSuffix:
      ' untuk melampirkan tangkapan skrin bersama maklumat peranti secara automatik. Bagi bantuan peranti atau operasi GEP Pro, hubungi meja bantuan kami.',
    supportEmailBtn: 'Hubungi Sokongan',
    footerChangelog: 'Nota Kemas Kini GEP Ops',
    footerPrivacy: 'Dasar Privasi',
  },
};

export function getUiStrings(lang) {
  return UI_STRINGS[lang === 'ms' ? 'ms' : 'en'];
}

export function getCategoryMeta(catId, lang) {
  const found = CATEGORIES.find((c) => c.id === catId) || CATEGORIES[0];
  return {
    id: found.id,
    code: found.code,
    label: lang === 'ms' ? found.label_ms : found.label_en,
  };
}

export function getAppBadgeLabel(appScope, lang) {
  const t = getUiStrings(lang);
  if (appScope === 'ops') return t.appBadgeOps;
  if (appScope === 'pro') return t.appBadgePro;
  return t.appBadgeBoth;
}

export function pickLocalized(obj, key, lang) {
  if (!obj) return '';
  if (lang === 'ms') {
    const msVal = obj[`${key}_ms`];
    if (typeof msVal === 'string' && msVal.trim()) return msVal.trim();
  }
  const val = obj[key];
  return typeof val === 'string' ? val.trim() : '';
}

export function pickLocalizedList(obj, key, lang) {
  if (!obj) return [];
  if (lang === 'ms' && Array.isArray(obj[`${key}_ms`]) && obj[`${key}_ms`].length > 0) {
    return obj[`${key}_ms`];
  }
  return Array.isArray(obj[key]) ? obj[key] : [];
}

export function createSvgIcon(name, size = 16, extraClass = '') {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', extraClass ? `icon ${extraClass}` : 'icon');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');

  (ICON_PATHS[name] || []).forEach((d) => {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  });

  return svg;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function appendHighlightedText(parent, text, query) {
  const content = String(text || '');
  const trimmed = String(query || '').trim();
  if (!trimmed) {
    parent.appendChild(document.createTextNode(content));
    return;
  }

  const regex = new RegExp(`(${escapeRegExp(trimmed)})`, 'gi');
  content.split(regex).forEach((part) => {
    if (!part) return;
    if (part.toLowerCase() === trimmed.toLowerCase()) {
      const mark = document.createElement('mark');
      mark.className = 'search-mark';
      mark.textContent = part;
      parent.appendChild(mark);
    } else {
      parent.appendChild(document.createTextNode(part));
    }
  });
}
