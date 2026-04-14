(function (global) {
  var MSite = (global.MSite = global.MSite || {});

  function hasParent(el, selector, stopAt) {
    var node = el;
    while (node && node !== stopAt) {
      if (node.matches && node.matches(selector)) return true;
      node = node.parentElement;
    }
    return false;
  }

  function getLastScrollablePage(target, pagesEl, sectionSelector) {
    if (!sectionSelector || !target.closest) return null;
    var page = target.closest(sectionSelector);
    if (page && pagesEl.contains(page)) return page;
    return null;
  }

  /**
   * @param {Object} opts
   * @param {boolean} [opts.addFpClass] - 为 html/body 添加 .fp
   * @param {Object<string, number>|null} [opts.hashMap] - location.hash 对应页码；null 则始终从第 0 页开始并在 pageshow 重置
   * @param {string} [opts.horizontalScrollSelector] - 内部横向滚动容器，避免误触整屏切换（如 .m-biz-scroll）
   * @param {string} [opts.lastScrollablePageSelector] - 可纵向滚动的最后一屏（如 .mb-last-page）
   */
  MSite.initFullpage = function (opts) {
    opts = opts || {};
    var pages = document.getElementById('mPages');
    var dots = document.querySelectorAll('.m-dot');
    var arrow = document.getElementById('mArrow');
    if (!pages || !dots.length || !arrow) return;

    var total = dots.length;
    var cur = 0;
    var isAnimating = false;
    var startX = 0;
    var startY = 0;
    var deltaX = 0;
    var deltaY = 0;
    var lockAxis = '';
    var ignoreSwipe = false;
    var startTarget = null;
    var trackingSwipe = false;

    var hashMap = opts.hashMap != null ? opts.hashMap : null;
    var horizontalSel = opts.horizontalScrollSelector || '';
    var lastPageSel = opts.lastScrollablePageSelector || '';

    if (opts.addFpClass) {
      document.documentElement.classList.add('fp');
      document.body.classList.add('fp');
    }

    function setViewportHeightVar() {
      var vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', vh + 'px');
    }

    function currentPageOffset() {
      return -cur * window.innerHeight;
    }

    function refreshIndicators() {
      dots.forEach(function (d, idx) {
        d.classList.toggle('active', idx === cur);
      });
      arrow.style.opacity = cur === total - 1 ? '0' : '1';
    }

    function syncCurrentPagePosition() {
      pages.style.transform = 'translate3d(0,' + currentPageOffset() + 'px,0)';
    }

    function goTo(i) {
      if (i < 0 || i >= total || isAnimating) return;
      cur = i;
      isAnimating = true;
      syncCurrentPagePosition();
      refreshIndicators();
      window.setTimeout(function () {
        isAnimating = false;
      }, 600);
    }

    function resetToFirstPage() {
      cur = 0;
      isAnimating = false;
      pages.style.transition = 'none';
      syncCurrentPagePosition();
      refreshIndicators();
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          pages.style.transition = '';
        });
      });
    }

    function initPageFromHash() {
      if (!hashMap) {
        resetToFirstPage();
        return;
      }
      var initHash = (location.hash || '').replace('#', '');
      cur = hashMap[initHash] !== undefined ? hashMap[initHash] : 0;
      isAnimating = false;
      pages.style.transition = 'none';
      syncCurrentPagePosition();
      refreshIndicators();
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          pages.style.transition = '';
        });
      });
    }

    arrow.addEventListener('click', function () {
      goTo(cur + 1);
    });

    setViewportHeightVar();
    initPageFromHash();

    window.addEventListener('resize', function () {
      setViewportHeightVar();
      syncCurrentPagePosition();
    });
    window.addEventListener('orientationchange', function () {
      setViewportHeightVar();
      syncCurrentPagePosition();
    });
    window.addEventListener('pageshow', function () {
      setViewportHeightVar();
      initPageFromHash();
    });

    document.addEventListener(
      'touchstart',
      function (e) {
        var target = e.target;
        if (!pages.contains(target)) {
          trackingSwipe = false;
          return;
        }
        trackingSwipe = true;
        startTarget = target;
        ignoreSwipe = hasParent(target, '.m-drawer,.m-drawer-mask,.m-hamburger', pages);
        if (ignoreSwipe) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        deltaX = 0;
        deltaY = 0;
        lockAxis = '';
      },
      { passive: true, capture: true },
    );

    document.addEventListener(
      'touchmove',
      function (e) {
        if (!trackingSwipe || ignoreSwipe) return;
        deltaX = e.touches[0].clientX - startX;
        deltaY = e.touches[0].clientY - startY;

        if (!lockAxis) {
          if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
            lockAxis = Math.abs(deltaY) >= Math.abs(deltaX) ? 'y' : 'x';
          } else {
            return;
          }
        }

        if (lockAxis === 'x') return;

        var lastPage = getLastScrollablePage(startTarget, pages, lastPageSel);
        if (lastPage) {
          var atTop = lastPage.scrollTop <= 0;
          var atBottom = lastPage.scrollTop + lastPage.clientHeight >= lastPage.scrollHeight - 1;
          if ((deltaY < 0 && !atBottom) || (deltaY > 0 && !atTop)) {
            return;
          }
        }

        if (horizontalSel && hasParent(startTarget, horizontalSel, pages) && lockAxis === 'x') {
          return;
        }

        e.preventDefault();
      },
      { passive: false, capture: true },
    );

    document.addEventListener(
      'touchend',
      function (e) {
        if (!trackingSwipe || ignoreSwipe) return;
        trackingSwipe = false;
        var endX = e.changedTouches[0].clientX;
        var dy = e.changedTouches[0].clientY - startY;
        var dx = endX - startX;
        var absX = Math.abs(dx);
        var absY = Math.abs(dy);

        if (absY < 35 || absY < absX) return;
        if (horizontalSel && hasParent(startTarget, horizontalSel, pages) && absX > absY) return;

        var lastPage = getLastScrollablePage(startTarget, pages, lastPageSel);
        if (lastPage) {
          var atTop = lastPage.scrollTop <= 0;
          var atBottom = lastPage.scrollTop + lastPage.clientHeight >= lastPage.scrollHeight - 1;
          if ((dy < 0 && !atBottom) || (dy > 0 && !atTop)) return;
        }

        if (absY > 45) goTo(cur + (dy < 0 ? 1 : -1));
      },
      { passive: true, capture: true },
    );

    document.addEventListener(
      'touchcancel',
      function () {
        trackingSwipe = false;
      },
      { passive: true, capture: true },
    );

    dots.forEach(function (d, i) {
      d.addEventListener('click', function () {
        goTo(i);
      });
    });

    MSite.initDrawer();
  };
})(typeof window !== 'undefined' ? window : this);
