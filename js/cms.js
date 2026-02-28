// CMS content loader for Jacob Schwartz Designs
// Fetches JSON content files and injects them into the page.
// Use **bold text** in content fields to highlight phrases.

function parseBold(text) {
  if (!text) return '';
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function loadCmsContent(config) {
  if (config.projectId) {
    fetch('./content/projects/' + config.projectId + '.json')
      .then(function(r) { return r.json(); })
      .then(function(d) { if (config.onLoad) config.onLoad(d); })
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
