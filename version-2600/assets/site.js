(function () {
  'use strict';

  var HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMobileMenu() {
    var button = qs('[data-menu-button]');
    var panel = qs('[data-mobile-menu]');
    if (!button || !panel) {
      return;
    }

    button.addEventListener('click', function () {
      var isOpen = panel.classList.toggle('is-open');
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (slides.length <= 1) {
      show(0);
      return;
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')));
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initBackTop() {
    var button = qs('[data-back-top]');
    if (!button) {
      return;
    }

    function toggle() {
      button.classList.toggle('is-visible', window.scrollY > 500);
    }

    window.addEventListener('scroll', toggle, { passive: true });
    button.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    toggle();
  }

  function initImageFallbacks() {
    qsa('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-missing');
      });
    });
  }

  function initFilters() {
    var toolbar = qs('[data-filter-page]');
    if (!toolbar) {
      return;
    }

    var scope = toolbar.parentElement || document;
    var queryInput = qs('[data-filter-query]', toolbar);
    var regionSelect = qs('[data-filter-region]', toolbar);
    var typeSelect = qs('[data-filter-type]', toolbar);
    var yearSelect = qs('[data-filter-year]', toolbar);
    var count = qs('[data-filter-count]', toolbar);
    var cards = qsa('[data-card]', scope);

    function apply() {
      var query = normalize(queryInput && queryInput.value);
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var searchable = normalize(card.getAttribute('data-search'));
        var cardRegion = card.getAttribute('data-region') || '';
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var matched = true;

        if (query && searchable.indexOf(query) === -1) {
          matched = false;
        }
        if (region && cardRegion !== region) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }
        if (year && cardYear.indexOf(year) === -1) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部';
      }
    }

    [queryInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', apply);
      control.addEventListener('change', apply);
    });

    apply();
  }

  function createSearchCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card">',
      '  <a class="movie-card-link" href="' + escapeHtml(movie.href) + '">',
      '    <figure class="poster-frame">',
      '      <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '高清封面" loading="lazy">',
      '      <span class="year-pill">' + escapeHtml(movie.year) + '</span>',
      '      <span class="hover-play" aria-hidden="true">▶</span>',
      '    </figure>',
      '    <div class="movie-card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="movie-meta-line">',
      '        <span>' + escapeHtml(movie.region) + '</span>',
      '        <span>' + escapeHtml(movie.type) + '</span>',
      '      </div>',
      '      <div class="chip-row">' + tags + '</div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('\n');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initSearchPage() {
    var shell = qs('[data-search-page]');
    if (!shell || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    var form = qs('[data-search-form]', shell);
    var input = qs('[data-search-input]', shell);
    var results = qs('[data-search-results]', shell);
    var summary = qs('[data-search-summary]', shell);
    var empty = qs('[data-search-empty]', shell);
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    function search(query) {
      var normalized = normalize(query);
      if (!normalized) {
        results.innerHTML = '';
        summary.textContent = '输入关键词后显示匹配影片。';
        empty.hidden = true;
        return;
      }

      var matches = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        return normalize(movie.search).indexOf(normalized) !== -1;
      }).slice(0, 96);

      results.innerHTML = matches.map(createSearchCard).join('\n');
      summary.textContent = '共找到 ' + matches.length + ' 条匹配结果' + (matches.length >= 96 ? '，已优先显示前 96 条。' : '。');
      empty.hidden = matches.length > 0;
      initImageFallbacks();
    }

    input.value = initial;
    search(initial);

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var target = query ? 'search.html?q=' + encodeURIComponent(query) : 'search.html';
      window.history.replaceState(null, '', target);
      search(query);
    });

    input.addEventListener('input', function () {
      search(input.value);
    });
  }

  function loadHlsScript(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = qs('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = HLS_CDN;
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function attachStream(video, stream, onReady) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      video.addEventListener('loadedmetadata', onReady, { once: true });
      video.load();
      return;
    }

    loadHlsScript(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, onReady);
        video._hls = hls;
      } else {
        video.src = stream;
        video.addEventListener('loadedmetadata', onReady, { once: true });
        video.load();
      }
    });
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (stage) {
      var video = qs('video[data-src]', stage);
      var overlay = qs('.js-play-trigger', stage);
      var prepared = false;
      if (!video) {
        return;
      }

      function playVideo() {
        var stream = video.getAttribute('data-src');
        if (!stream) {
          return;
        }

        stage.classList.add('is-loading');

        function start() {
          stage.classList.remove('is-loading');
          stage.classList.add('is-playing');
          var playPromise = video.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
              stage.classList.remove('is-playing');
            });
          }
        }

        if (!prepared) {
          prepared = true;
          attachStream(video, stream, start);
        } else {
          start();
        }
      }

      if (overlay) {
        overlay.addEventListener('click', function (event) {
          event.stopPropagation();
          playVideo();
        });
      }

      stage.addEventListener('click', function (event) {
        if (event.target === video && prepared) {
          return;
        }
        playVideo();
      });

      video.addEventListener('play', function () {
        stage.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          stage.classList.remove('is-playing');
        }
      });

      video.addEventListener('ended', function () {
        stage.classList.remove('is-playing');
      });
    });
  }

  onReady(function () {
    initMobileMenu();
    initHero();
    initBackTop();
    initImageFallbacks();
    initFilters();
    initSearchPage();
    initPlayers();
  });
})();
