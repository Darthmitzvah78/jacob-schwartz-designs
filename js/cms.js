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

// Load all projects in order from projects-order.json
function loadProjectsInOrder(callback) {
  fetch('./content/projects-order.json')
    .then(function(r) { return r.json(); })
    .then(function(order) {
      return Promise.all(order.projects.map(function(id) {
        return fetch('./content/projects/' + id + '.json')
          .then(function(r) { return r.json(); })
          .then(function(d) { d._id = id; return d; })
          .catch(function() { return null; });
      }));
    })
    .then(function(projects) { callback(projects.filter(Boolean)); })
    .catch(function() { callback([]); });
}

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
    loadProjectsInOrder(function(projects) {
      if (config.onLoad) config.onLoad(projects);
    });
  }
}

// Render the projects list page from CMS data
function renderProjectsList(projects) {
  var list = document.getElementById('cms-projects-list');
  if (!list) return;

  var total = projects.length;
  var countEl = document.getElementById('cms-project-count');
  if (countEl) countEl.textContent = String(total).padStart(2, '0') + ' Projects';

  list.innerHTML = projects.map(function(p, i) {
    var flip = i % 2 === 1 ? ' flip' : '';
    var thumb = p.thumbnail || p.hero_image || '';
    var url = 'jsd-project.html?id=' + p._id;
    return '<a href="' + url + '" class="project-row' + flip + ' reveal" data-id="' + p._id + '">' +
      '<div class="project-thumb"><img src="' + thumb + '" alt="' + p.title + '"></div>' +
      '<div class="project-info">' +
        '<div class="project-meta"><span class="project-num">' + p.num + '</span><span class="project-category">' + p.category + '</span></div>' +
        '<p class="project-name">' + p.title + '</p>' +
        '<span class="project-arrow">→</span>' +
      '</div>' +
    '</a>';
  }).join('');

  list.querySelectorAll('.reveal').forEach(function(el) { revealObserver.observe(el); });

  // Re-attach hover listeners for cursor
  list.querySelectorAll('a').forEach(function(el) {
    var dot = document.getElementById('cursorDot');
    var ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;
    el.addEventListener('mouseenter', function() { dot.classList.add('hover'); ring.classList.add('hover'); });
    el.addEventListener('mouseleave', function() { dot.classList.remove('hover'); ring.classList.remove('hover'); });
  });
}
