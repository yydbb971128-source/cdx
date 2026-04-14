(function (global) {
  var MSite = (global.MSite = global.MSite || {});

  MSite.initDrawer = function () {
    var btn = document.getElementById('mHamburger');
    var drawer = document.getElementById('mDrawer');
    var mask = document.getElementById('mDrawerMask');
    if (!btn || !drawer || !mask) return;
    function toggle() {
      btn.classList.toggle('open');
      drawer.classList.toggle('open');
      mask.classList.toggle('open');
    }
    btn.addEventListener('click', toggle);
    mask.addEventListener('click', toggle);
  };

  MSite.initNewsTabs = function () {
    var tabs = document.querySelectorAll('.mn-tab');
    var panels = document.querySelectorAll('.mn-panel');
    if (!tabs.length || !panels.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) {
          t.classList.remove('active');
        });
        panels.forEach(function (p) {
          p.classList.remove('active');
        });
        tab.classList.add('active');
        var target = document.getElementById('panel-' + tab.dataset.news);
        if (target) target.classList.add('active');
      });
    });
  };
})(typeof window !== 'undefined' ? window : this);
