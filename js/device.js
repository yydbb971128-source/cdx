(function () {
  var isMobile = /Android|iPhone|iPad|iPod|Windows Phone|Mobile/i.test(navigator.userAgent);
  var path = location.pathname;
  var filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
  var inMobileDir = path.indexOf('/m/') !== -1;

  var map = {
    'index.html':      'index.html',
    'business.html':   'business.html',
    'biz-detail.html': 'biz-detail.html',
    'projects.html':   'projects.html',
    'proj-detail.html': 'proj-detail.html',
    'news.html':       'news.html',
    'about.html':      'about.html'
  };

  if (isMobile && !inMobileDir && map[filename]) {
    location.replace('m/' + map[filename] + location.search + location.hash);
  }

  if (!isMobile && inMobileDir && map[filename]) {
    location.replace('../' + map[filename] + location.search + location.hash);
  }
})();
