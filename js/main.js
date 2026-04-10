/* ================================================================
   首页导航透明 → 滚动变白
================================================================ */
(function () {
  const nav = document.getElementById('mainNav');
  if (!nav || !nav.classList.contains('nav-transparent')) return;
  function check() {
    if (window.scrollY > 60) {
      nav.classList.remove('nav-transparent');
    } else {
      nav.classList.add('nav-transparent');
    }
  }
  window.addEventListener('scroll', check, { passive: true });
  check();
})();

/* ================================================================
   Scroll Reveal（NGC 风格：fade + slide-up，每个元素只触发一次）
================================================================ */
(function () {
  const els = document.querySelectorAll('[data-sr]');
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('sr-visible');
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 },
  );
  els.forEach((el) => io.observe(el));
})();

/* ================================================================
   平滑滚动锚点
================================================================ */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ================================================================
   首页：价值区卡片点击切换
================================================================ */
(function () {
  const cards = document.querySelectorAll('.val-card');
  cards.forEach((c) =>
    c.addEventListener('click', () => {
      cards.forEach((x) => x.classList.remove('active'));
      c.classList.add('active');
    }),
  );
})();

/* ================================================================
   通用 Tab 切换（data-tab / data-panel 对应）
================================================================ */
(function () {
  document.querySelectorAll('[data-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const group = tab.closest('[data-tab-group]') || tab.parentElement;
      const panelContainer = document.querySelector(tab.dataset.target || '#' + tab.dataset.tab + '-panels');
      // 同组 tab 取消高亮
      group.querySelectorAll('[data-tab]').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      // 对应 panel
      if (panelContainer) {
        panelContainer.querySelectorAll('[data-panel]').forEach((p) => p.classList.remove('active'));
        const active = panelContainer.querySelector('[data-panel="' + tab.dataset.tab + '"]');
        if (active) active.classList.add('active');
      }
    });
  });
})();

/* ================================================================
   行业资讯：Tab 切换
================================================================ */
(function () {
  const tabs = document.querySelectorAll('.news-tab');
  const panels = document.querySelectorAll('.news-panel');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      panels.forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById('panel-' + tab.dataset.news);
      if (target) target.classList.add('active');
    });
  });
})();

/* ================================================================
   主营业务：tab 高亮切换（锚点导航）
================================================================ */
(function () {
  const tabs = document.querySelectorAll('.biz-list-tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
})();

/* ================================================================
   项目卡片：点击切换（平滑滚动）
================================================================ */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    const container = document.querySelector('.proj-cards-container');
    if (!container) return;
    const step = 320;
    container.scrollLeft = 400;

    container.addEventListener('click', function (e) {
      const rect = container.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const halfWidth = rect.width / 2;
      if (clickX < halfWidth) {
        // 点左半边 → 向左滚动一格
        container.scrollBy({ left: -step, behavior: 'smooth' });
      } else {
        // 点右半边 → 向右滚动一格
        container.scrollBy({ left: step, behavior: 'smooth' });
      }
    });
  });
})();

/* ================================================================
   PC 专用：右下角回到顶部（仅视口 ≥992px 时插入 DOM 并监听滚动）
================================================================ */
(function () {
  const mq = window.matchMedia('(min-width: 992px)');
  let btn = null;

  function onScroll() {
    if (!btn) return;
    btn.classList.toggle('is-visible', window.scrollY > 280);
  }

  function mount() {
    if (btn) return;
    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', '回到顶部');
    btn.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(btn);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function unmount() {
    if (!btn) return;
    window.removeEventListener('scroll', onScroll);
    btn.remove();
    btn = null;
  }

  function sync() {
    if (mq.matches) mount();
    else unmount();
  }

  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', sync);
  } else if (typeof mq.addListener === 'function') {
    mq.addListener(sync);
  }
  sync();
})();
