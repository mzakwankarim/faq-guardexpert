import {
  APP_FILTERS,
  CATEGORIES,
  appendHighlightedText,
  createSvgIcon,
  getAppBadgeLabel,
  getCategoryMeta,
  getUiStrings,
  pickLocalized,
  pickLocalizedList,
} from './utils.js';

const DATA_URL = './faqs.json';
const LANG_STORAGE_KEY = 'gep_ops_faq_lang';
const CHANGELOG_LANG_KEY = 'gep_ops_changelog_lang';

const dom = {
  brandSection: document.getElementById('brand-section'),
  heroEyebrow: document.getElementById('hero-eyebrow'),
  heroTitle: document.getElementById('hero-title'),
  heroLead: document.getElementById('hero-lead'),
  appFilterLabel: document.getElementById('app-filter-label'),
  appSwitch: document.getElementById('app-switch'),
  searchDesktop: document.getElementById('search-input-desktop'),
  searchDesktopClear: document.getElementById('search-clear-desktop'),
  mobileSearchBtn: document.getElementById('mobile-search-btn'),
  mobileSearchDrawer: document.getElementById('mobile-search-drawer'),
  searchMobile: document.getElementById('search-input-mobile'),
  searchMobileClear: document.getElementById('search-clear-mobile'),
  langSwitch: document.getElementById('lang-switch'),
  categoryTabs: document.getElementById('category-tabs'),
  resultCount: document.getElementById('result-count'),
  toggleAllBtn: document.getElementById('toggle-all-btn'),
  loadingState: document.getElementById('loading-state'),
  faqMount: document.getElementById('faq-mount'),
  emptyState: document.getElementById('empty-state'),
  emptyTitle: document.getElementById('empty-title'),
  emptyDesc: document.getElementById('empty-desc'),
  resetFiltersBtn: document.getElementById('reset-filters-btn'),
  errorState: document.getElementById('error-state'),
  errorTitle: document.getElementById('error-title'),
  errorMessage: document.getElementById('error-message'),
  retryBtn: document.getElementById('retry-load-btn'),
  supportTitle: document.getElementById('support-title'),
  supportDesc: document.getElementById('support-desc'),
  supportEmailBtn: document.getElementById('support-email-btn'),
  footerChangelog: document.getElementById('footer-changelog'),
  footerPrivacy: document.getElementById('footer-privacy'),
  backToTopBtn: document.getElementById('back-to-top-btn'),
  toast: document.getElementById('toast'),
};

function resolveInitialParams() {
  const params = new URLSearchParams(window.location.search);
  const urlLang = (params.get('lang') || '').toLowerCase();
  let lang = 'en';

  if (urlLang === 'ms' || urlLang === 'bm' || urlLang === 'my') {
    lang = 'ms';
  } else if (urlLang === 'en') {
    lang = 'en';
  } else {
    try {
      const saved =
        window.localStorage.getItem(LANG_STORAGE_KEY) ||
        window.localStorage.getItem(CHANGELOG_LANG_KEY);
      if (saved === 'ms' || saved === 'en') lang = saved;
    } catch (_) {}
  }

  const rawApp = (params.get('app') || 'all').toLowerCase();
  let validApp = 'all';
  if (rawApp === 'ops' || rawApp === 'gep-ops' || rawApp === 'gepops') {
    validApp = 'ops';
  } else if (rawApp === 'pro' || rawApp === 'gep-pro' || rawApp === 'geppro') {
    validApp = 'pro';
  } else if (APP_FILTERS.includes(rawApp)) {
    validApp = rawApp;
  }

  const rawCategory = (params.get('category') || 'all').toLowerCase();
  const legacyCategoryMap = {
    auth: 'general',
    manage: 'attendance',
    reports: 'support',
  };
  const mappedCategory = legacyCategoryMap[rawCategory] || rawCategory;
  const validCategory =
    mappedCategory === 'all' || CATEGORIES.some((c) => c.id === mappedCategory)
      ? mappedCategory
      : 'all';

  return {
    lang,
    app: validApp,
    category: validCategory,
    query: (params.get('q') || '').trim(),
  };
}

const initial = resolveInitialParams();

const state = {
  faqs: [],
  app: initial.app,
  category: initial.category,
  query: initial.query,
  lang: initial.lang,
  openIds: new Set(),
};

let toastTimer = null;

function showToast(message) {
  dom.toast.textContent = message;
  dom.toast.classList.add('visible');
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    dom.toast.classList.remove('visible');
  }, 2200);
}

function matchesAppFilter(item, appFilter) {
  const scope = item.app || 'both';
  if (appFilter === 'all') return true;
  return scope === 'both' || scope === appFilter;
}

function syncUrlParams() {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('lang', state.lang);
    if (state.app === 'all') url.searchParams.delete('app');
    else url.searchParams.set('app', state.app);

    if (state.category === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', state.category);

    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  } catch (_) {}
}

function updateStructuredData() {
  if (!state.faqs.length) return;
  let scriptEl = document.getElementById('faq-jsonld');
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'faq-jsonld';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }

  const mainEntity = state.faqs.map((item) => {
    const q = pickLocalized(item, 'question', state.lang);
    const a = pickLocalized(item, 'answer', state.lang);
    const steps = pickLocalizedList(item, 'steps', state.lang);
    const fullAnswer = steps.length ? `${a} ${steps.join(' ')}` : a;
    return {
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: fullAnswer,
      },
    };
  });

  scriptEl.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  });
}

function applyStaticLocalization() {
  const t = getUiStrings(state.lang);
  document.documentElement.lang = state.lang;
  document.title = t.docTitle;

  dom.brandSection.textContent = t.brandSection;
  dom.heroEyebrow.textContent = t.heroEyebrow;
  dom.heroTitle.textContent = t.heroTitle;
  dom.heroLead.textContent = t.heroLead;
  dom.appFilterLabel.textContent = t.appFilterLabel;
  dom.searchDesktop.placeholder = t.searchPlaceholder;
  dom.searchMobile.placeholder = t.searchPlaceholderMobile;

  dom.appSwitch.querySelectorAll('.app-btn').forEach((btn) => {
    const appKey = btn.dataset.app;
    if (appKey === 'all') {
      btn.textContent = t.appAll;
    } else if (appKey === 'ops') {
      const labelEl = btn.querySelector('span:last-child');
      if (labelEl) labelEl.textContent = t.appOps;
    } else if (appKey === 'pro') {
      const labelEl = btn.querySelector('span:last-child');
      if (labelEl) labelEl.textContent = t.appPro;
    }
  });

  dom.categoryTabs.querySelectorAll('.cat-tab').forEach((tab) => {
    const key = tab.dataset.category;
    if (key === 'all') {
      tab.textContent = t.tabAll;
    } else {
      tab.textContent = getCategoryMeta(key, state.lang).label;
    }
  });

  dom.emptyTitle.textContent = t.emptyTitle;
  dom.emptyDesc.textContent = t.emptyDesc;
  dom.resetFiltersBtn.textContent = t.resetFilters;
  dom.errorTitle.textContent = t.errorTitle;
  dom.retryBtn.textContent = t.retry;

  dom.supportTitle.textContent = t.supportTitle;
  dom.supportDesc.textContent = '';
  dom.supportDesc.appendChild(document.createTextNode(t.supportDescPrefix));
  const strong = document.createElement('strong');
  strong.textContent = t.supportDescHighlight;
  dom.supportDesc.appendChild(strong);
  dom.supportDesc.appendChild(document.createTextNode(t.supportDescSuffix));
  dom.supportEmailBtn.textContent = t.supportEmailBtn;

  dom.footerChangelog.textContent = t.footerChangelog;
  dom.footerChangelog.href = `https://mzakwankarim.github.io/version-log-ops/?lang=${state.lang}`;
  dom.footerPrivacy.textContent = t.footerPrivacy;

  dom.langSwitch.querySelectorAll('.lang-btn').forEach((btn) => {
    const active = btn.dataset.lang === state.lang;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });

  updateAppSwitchStyles();
  updateToggleAllLabel();
  updateStructuredData();
}

function setLanguage(nextLang) {
  const normalized = nextLang === 'ms' ? 'ms' : 'en';
  if (state.lang === normalized) return;
  state.lang = normalized;

  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, normalized);
  } catch (_) {}

  syncUrlParams();
  applyStaticLocalization();
  if (state.faqs.length > 0) renderFaqs();
}

function syncSearchInputs(value) {
  state.query = value;
  if (dom.searchDesktop.value !== value) dom.searchDesktop.value = value;
  if (dom.searchMobile.value !== value) dom.searchMobile.value = value;
  dom.searchDesktopClear.classList.toggle('hidden', !value);
  dom.searchMobileClear.classList.toggle('hidden', !value);
}

function updateAppSwitchStyles() {
  dom.appSwitch.querySelectorAll('.app-btn').forEach((btn) => {
    const active = btn.dataset.app === state.app;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

function syncCategoryVisibilityAndStyles() {
  const appMatched = state.faqs.filter((item) => matchesAppFilter(item, state.app));
  const availableCategories = new Set(appMatched.map((item) => item.category));

  if (state.category !== 'all' && state.faqs.length > 0 && !availableCategories.has(state.category)) {
    state.category = 'all';
  }

  dom.categoryTabs.querySelectorAll('.cat-tab').forEach((tab) => {
    const catKey = tab.dataset.category;
    const shouldHide =
      catKey !== 'all' && state.faqs.length > 0 && !availableCategories.has(catKey);
    tab.classList.toggle('hidden', shouldHide);

    const active = catKey === state.category;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', String(active));
  });
}

function getFilteredFaqs() {
  const q = state.query.trim().toLowerCase();
  return state.faqs.filter((item) => {
    if (!matchesAppFilter(item, state.app)) {
      return false;
    }
    if (state.category !== 'all' && item.category !== state.category) {
      return false;
    }
    if (!q) return true;

    const appKeyword =
      item.app === 'ops'
        ? 'gep ops'
        : item.app === 'pro'
          ? 'gep pro guardexpertpro'
          : 'gep ops gep pro guardexpertpro';

    const haystack = [
      item.id || '',
      appKeyword,
      item.question || '',
      item.question_ms || '',
      item.answer || '',
      item.answer_ms || '',
      ...(item.steps || []),
      ...(item.steps_ms || []),
      item.tip || '',
      item.tip_ms || '',
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });
}

function areAllVisibleOpen(visibleItems) {
  if (visibleItems.length === 0) return false;
  if (state.query.trim()) return true;
  return visibleItems.every((item) => state.openIds.has(item.id));
}

function updateToggleAllLabel() {
  const t = getUiStrings(state.lang);
  const visible = getFilteredFaqs();
  const allOpen = areAllVisibleOpen(visible);
  dom.toggleAllBtn.textContent = allOpen ? t.collapseAll : t.expandAll;
  dom.toggleAllBtn.classList.toggle('hidden', visible.length === 0);
}

async function handleCopyLink(faqId) {
  const t = getUiStrings(state.lang);
  const url = `${window.location.origin}${window.location.pathname}${window.location.search}#${encodeURIComponent(faqId)}`;
  try {
    window.history.replaceState(null, '', `${window.location.search}#${encodeURIComponent(faqId)}`);
  } catch (_) {}

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      showToast(t.copiedLink);
      return;
    }
  } catch (_) {}

  showToast(t.readyShare);
}

function buildFaqItem(item, { lang, query, forceOpen }) {
  const t = getUiStrings(lang);
  const scope = item.app === 'ops' || item.app === 'pro' ? item.app : 'both';

  const details = document.createElement('details');
  details.className = 'faq-item';
  details.id = item.id;
  details.open = forceOpen || state.openIds.has(item.id);

  details.addEventListener('toggle', () => {
    if (query.trim()) return;
    if (details.open) state.openIds.add(item.id);
    else state.openIds.delete(item.id);
    updateToggleAllLabel();
  });

  const summary = document.createElement('summary');
  summary.className = 'faq-summary';

  const summaryMain = document.createElement('div');
  summaryMain.className = 'faq-summary-main';

  const appPill = document.createElement('span');
  appPill.className = `app-pill ${scope}`;
  appPill.textContent = getAppBadgeLabel(scope, lang);
  summaryMain.appendChild(appPill);

  const qSpan = document.createElement('span');
  qSpan.className = 'faq-question';
  appendHighlightedText(qSpan, pickLocalized(item, 'question', lang), query);
  summaryMain.appendChild(qSpan);

  summary.appendChild(summaryMain);

  const chevWrap = document.createElement('span');
  chevWrap.className = 'faq-chevron-wrap';
  chevWrap.appendChild(createSvgIcon('chevronDown', 15, 'faq-chevron'));
  summary.appendChild(chevWrap);

  details.appendChild(summary);

  const body = document.createElement('div');
  body.className = 'faq-body';

  const answerText = pickLocalized(item, 'answer', lang);
  if (answerText) {
    const p = document.createElement('p');
    p.className = 'faq-answer';
    appendHighlightedText(p, answerText, query);
    body.appendChild(p);
  }

  const steps = pickLocalizedList(item, 'steps', lang);
  if (steps.length > 0) {
    const ol = document.createElement('ol');
    ol.className = 'faq-steps';
    steps.forEach((step) => {
      const li = document.createElement('li');
      appendHighlightedText(li, step, query);
      ol.appendChild(li);
    });
    body.appendChild(ol);
  }

  const tipText = pickLocalized(item, 'tip', lang);
  if (tipText) {
    const tipBox = document.createElement('div');
    tipBox.className = 'faq-tip';
    const badge = document.createElement('span');
    badge.className = 'faq-tip-label';
    badge.textContent = t.tipLabel;
    tipBox.appendChild(badge);
    const tipBody = document.createElement('span');
    appendHighlightedText(tipBody, tipText, query);
    tipBox.appendChild(tipBody);
    body.appendChild(tipBox);
  }

  const itemFooter = document.createElement('div');
  itemFooter.className = 'faq-item-footer';
  const copyBtn = document.createElement('button');
  copyBtn.type = 'button';
  copyBtn.className = 'copy-link-btn';
  copyBtn.appendChild(createSvgIcon('link', 13));
  const copyText = document.createElement('span');
  copyText.textContent = t.copyLink;
  copyBtn.appendChild(copyText);
  copyBtn.addEventListener('click', () => handleCopyLink(item.id));
  itemFooter.appendChild(copyBtn);
  body.appendChild(itemFooter);

  details.appendChild(body);
  return details;
}

function renderFaqs() {
  const t = getUiStrings(state.lang);
  syncCategoryVisibilityAndStyles();
  dom.faqMount.textContent = '';

  const filtered = getFilteredFaqs();
  dom.resultCount.textContent = t.questionCount(filtered.length);
  updateToggleAllLabel();

  if (filtered.length === 0) {
    dom.emptyState.classList.remove('hidden');
    return;
  }

  dom.emptyState.classList.add('hidden');
  const forceOpen = Boolean(state.query.trim());
  const frag = document.createDocumentFragment();

  CATEGORIES.forEach((cat) => {
    const groupItems = filtered.filter((item) => item.category === cat.id);
    if (groupItems.length === 0) return;

    const meta = getCategoryMeta(cat.id, state.lang);
    const section = document.createElement('section');
    section.className = 'faq-group';
    section.id = `topic-${cat.id}`;

    const aside = document.createElement('aside');
    aside.className = 'faq-aside';

    const badge = document.createElement('span');
    badge.className = `cat-badge ${cat.id}`;
    badge.textContent = meta.code;
    aside.appendChild(badge);

    const title = document.createElement('h2');
    title.className = 'aside-title';
    title.textContent = meta.label;
    aside.appendChild(title);

    const count = document.createElement('span');
    count.className = 'aside-count';
    count.textContent = t.questionCount(groupItems.length);
    aside.appendChild(count);

    const card = document.createElement('div');
    card.className = 'faq-card';
    groupItems.forEach((item) => {
      card.appendChild(
        buildFaqItem(item, {
          lang: state.lang,
          query: state.query,
          forceOpen,
        })
      );
    });

    section.appendChild(aside);
    section.appendChild(card);
    frag.appendChild(section);
  });

  dom.faqMount.appendChild(frag);
}

function resetAllFilters() {
  state.app = 'all';
  state.category = 'all';
  syncSearchInputs('');
  updateAppSwitchStyles();
  syncUrlParams();
  renderFaqs();
}

function scrollToHashTarget() {
  const rawHash = decodeURIComponent(window.location.hash.replace(/^#/, '')).trim();
  if (!rawHash) return;

  let target = document.getElementById(rawHash);
  if (!target && state.faqs.some((item) => item.id === rawHash)) {
    state.app = 'all';
    state.category = 'all';
    syncSearchInputs('');
    updateAppSwitchStyles();
    renderFaqs();
    target = document.getElementById(rawHash);
  }
  if (!target) return;

  if (target.tagName.toLowerCase() === 'details') {
    target.open = true;
    state.openIds.add(target.id);
    updateToggleAllLabel();
    target.classList.add('item-highlight');
    window.setTimeout(() => target.classList.remove('item-highlight'), 2400);
  }

  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function loadFaqs() {
  const t = getUiStrings(state.lang);
  dom.loadingState.classList.remove('hidden');
  dom.errorState.classList.add('hidden');
  dom.emptyState.classList.add('hidden');
  dom.faqMount.textContent = '';

  try {
    const res = await fetch(DATA_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const raw = await res.json();
    if (!Array.isArray(raw)) throw new Error('faqs.json must be a JSON array.');

    state.faqs = raw;
    if (raw.length > 0 && state.openIds.size === 0 && !window.location.hash) {
      const firstVisible = getFilteredFaqs()[0] || raw[0];
      state.openIds.add(firstVisible.id);
    }

    dom.loadingState.classList.add('hidden');
    updateAppSwitchStyles();
    updateStructuredData();
    renderFaqs();
    scrollToHashTarget();
  } catch (err) {
    dom.loadingState.classList.add('hidden');
    dom.resultCount.textContent = t.questionCount(0);
    dom.errorMessage.textContent =
      window.location.protocol === 'file:' ? t.fileError : t.loadError(err.message);
    dom.errorState.classList.remove('hidden');
  }
}

function bindEvents() {
  const onSearchInput = (e) => {
    syncSearchInputs(e.target.value);
    renderFaqs();
  };

  dom.searchDesktop.addEventListener('input', onSearchInput);
  dom.searchMobile.addEventListener('input', onSearchInput);

  dom.searchDesktopClear.addEventListener('click', () => {
    syncSearchInputs('');
    dom.searchDesktop.focus();
    renderFaqs();
  });

  dom.searchMobileClear.addEventListener('click', () => {
    syncSearchInputs('');
    dom.searchMobile.focus();
    renderFaqs();
  });

  dom.mobileSearchBtn.addEventListener('click', () => {
    const isOpen = dom.mobileSearchDrawer.classList.toggle('is-open');
    dom.mobileSearchBtn.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      dom.searchMobile.focus();
    } else if (state.query) {
      syncSearchInputs('');
      renderFaqs();
    }
  });

  [dom.searchDesktop, dom.searchMobile].forEach((input) => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state.query) {
          syncSearchInputs('');
          renderFaqs();
        } else if (dom.mobileSearchDrawer.classList.contains('is-open')) {
          dom.mobileSearchBtn.click();
        }
      }
    });
  });

  dom.langSwitch.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
  });

  dom.appSwitch.querySelectorAll('.app-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const nextApp = btn.dataset.app || 'all';
      if (state.app === nextApp) return;
      state.app = nextApp;
      updateAppSwitchStyles();
      syncCategoryVisibilityAndStyles();
      syncUrlParams();
      renderFaqs();
    });
  });

  dom.categoryTabs.querySelectorAll('.cat-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      state.category = tab.dataset.category || 'all';
      syncCategoryVisibilityAndStyles();
      syncUrlParams();
      renderFaqs();
    });
  });

  dom.toggleAllBtn.addEventListener('click', () => {
    if (state.query.trim()) {
      syncSearchInputs('');
    }
    const visible = getFilteredFaqs();
    const shouldClose = areAllVisibleOpen(visible);
    visible.forEach((item) => {
      if (shouldClose) state.openIds.delete(item.id);
      else state.openIds.add(item.id);
    });
    renderFaqs();
  });

  dom.resetFiltersBtn.addEventListener('click', resetAllFilters);
  dom.retryBtn.addEventListener('click', loadFaqs);

  window.addEventListener(
    'scroll',
    () => {
      dom.backToTopBtn.classList.toggle('visible', window.scrollY > 420);
    },
    { passive: true }
  );

  dom.backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('hashchange', scrollToHashTarget);
}

syncSearchInputs(state.query);
applyStaticLocalization();
bindEvents();
loadFaqs();
