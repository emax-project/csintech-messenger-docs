(function () {
  var el = document.currentScript;
  var mdPath = el.getAttribute('data-md');
  var baseDir = mdPath.substring(0, mdPath.lastIndexOf('/') + 1);

  function fixRelativeUrls(markdown) {
    // rewrite markdown image/link targets that are relative (not http(s), not starting with /)
    return markdown.replace(/(!?\[[^\]]*\]\()(?!https?:\/\/|\/|#)([^)]+)(\))/g, function (m, pre, url, post) {
      return pre + baseDir + url + post;
    });
  }

  function slugify(text) {
    return text.trim().toLowerCase()
      .replace(/[^\w가-힣\s-]/g, '')
      .replace(/\s+/g, '-');
  }

  fetch(mdPath)
    .then(function (r) {
      if (!r.ok) throw new Error('fetch failed: ' + r.status);
      return r.text();
    })
    .then(function (raw) {
      var fixed = fixRelativeUrls(raw);
      var html = marked.parse(fixed, { mangle: false, headerIds: false });
      var container = document.getElementById('doc-content');
      container.innerHTML = html;

      // add ids to headings for in-page anchors
      container.querySelectorAll('h1, h2, h3').forEach(function (h) {
        if (!h.id) h.id = slugify(h.textContent || '');
      });

      // if URL has a hash, scroll to it now that content is rendered
      if (location.hash) {
        var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (target) target.scrollIntoView();
      }
    })
    .catch(function (err) {
      document.getElementById('doc-content').innerHTML =
        '<p style="color:#ff8080">문서를 불러오지 못했습니다: ' + err.message + '</p>';
    });
})();
