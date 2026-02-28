// CMS content loader for Jacob Schwartz Designs
// Fetches JSON content files and injects them into the page.
// Use **bold text** in content fields to highlight phrases.

function parseBold(text) {
  if (!text) return '';
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// Shared IntersectionObserver for scroll reveal — used by all pages and dynamic gallery rendering
var revealObserver = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

function loadCmsContent(config) {
  if (config.projectId) {
    fetch('./content/projects/' + config.projectId + '.json')
      .then(function(r) { return r.json(); })
      .then(function(d) {
        // Hero image
        var hero = document.getElementById('cms-hero');
        if (hero && d.hero_image) hero.src = d.hero_image;

        // Gallery
        var gallery = document.getElementById('cms-gallery');
        if (gallery && d.gallery && d.gallery.length) {
          gallery.className = 'project-images ' + (d.gallery_cols || 'cols-2');
          gallery.innerHTML = d.gallery.map(function(item) {
            return '<div class="img-cell ' + (item.layout || 'tall') + ' reveal"><img src="' + item.image + '" alt=""></div>';
          }).join('');
          gallery.querySelectorAll('.reveal').forEach(function(el) { revealObserver.observe(el); });
        }

        // Description
        var desc = document.getElementById('cms-description');
        if (desc && d.description) desc.innerHTML = parseBold(d.description);

        if (config.onLoad) config.onLoad(d);
      })
      .catch(function() {}); // silent fail — static content stays visible
  }

  if (config.page === 'about') {
    fetch('./content/about.json')
      .then(function(r) { return r.json(); })
      .then(function(d) { if (config.onLoad) config.onLoad(d); })
      .catch(function() {});
  }

  if (config.page === 'contact') {
    fetch('./content/site.json')
      .then(function(r) { return r.json(); })
      .then(function(d) { if (config.onLoad) config.onLoad(d); })
      .catch(function() {});
  }

  if (config.page === 'projects') {
    var ids = ['proctoru', 'titan', 'emerant', 'nbn', 'vecchia', 'jrburns', 'uab', 'create'];
    Promise.all(ids.map(function(id) {
      return fetch('./content/projects/' + id + '.json')
        .then(function(r) { return r.json(); })
        .catch(function() { return null; });
    })).then(function(projects) {
      if (config.onLoad) config.onLoad(projects.filter(Boolean));
    });
  }
}
