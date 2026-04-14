(function (global) {
  function pageName() {
    var path = location.pathname.replace(/\\/g, '/');
    var filename = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    return filename.replace('.html', '');
  }

  function applyRule(rule) {
    if (!rule || !rule.selector) return;
    var nodes = document.querySelectorAll(rule.selector);
    if (!nodes.length) {
      if (rule.selector === '.mn-banner-desc' && document.querySelector('.mn-banner') && rule.text) {
        var p = document.createElement('p');
        p.className = 'mn-banner-desc';
        p.textContent = rule.text;
        document.querySelector('.mn-banner').appendChild(p);
      }
      return;
    }
    var applyToNode = function (node) {
      if (!node || (node.classList && node.classList.contains('copy_right'))) return;
      if (rule.html !== undefined) node.innerHTML = rule.html;
      if (rule.text !== undefined) node.textContent = rule.text;
    };
    if (typeof rule.index === 'number') {
      applyToNode(nodes[rule.index]);
    } else {
      nodes.forEach(applyToNode);
    }
  }

  function run() {
    var copy = global.SiteCopy;
    if (!copy) return;
    (copy.commonRules || []).forEach(applyRule);

    var name = pageName();
    (copy.pages && copy.pages[name] ? copy.pages[name] : []).forEach(applyRule);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})(typeof window !== 'undefined' ? window : this);
