(function() {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function hideBrokenImages() {
    selectAll("img").forEach(function(img) {
      img.addEventListener("error", function() {
        img.classList.add("is-hidden");
      });
    });
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function() {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");
    if (!root) {
      return;
    }

    var slides = selectAll("[data-hero-slide]", root);
    var dots = selectAll("[data-hero-dot]", root);
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });

      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function schedule() {
      clearInterval(timer);
      timer = setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener("click", function() {
        show(i);
        schedule();
      });
    });

    if (prev) {
      prev.addEventListener("click", function() {
        show(index - 1);
        schedule();
      });
    }

    if (next) {
      next.addEventListener("click", function() {
        show(index + 1);
        schedule();
      });
    }

    show(0);
    schedule();
  }

  function initLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    var cards = selectAll("[data-card-search]");
    var empty = document.querySelector("[data-empty-state]");

    if (!input || !cards.length) {
      return;
    }

    function apply() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function(card) {
        var text = (card.getAttribute("data-card-search") || "").toLowerCase();
        var matched = !query || text.indexOf(query) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    input.addEventListener("input", apply);
    apply();
  }

  function initSearchPage() {
    var root = document.querySelector("[data-search-page]");
    if (!root || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var keywordInput = root.querySelector("[data-search-keyword]");
    var yearSelect = root.querySelector("[data-search-year]");
    var regionSelect = root.querySelector("[data-search-region]");
    var resultGrid = root.querySelector("[data-search-results]");
    var empty = root.querySelector("[data-empty-state]");

    function params() {
      return new URLSearchParams(window.location.search);
    }

    function createCard(item) {
      var link = document.createElement("a");
      link.className = "movie-card";
      link.href = item.detail;
      link.setAttribute(
        "data-card-search",
        [
          item.title,
          item.year,
          item.region,
          item.genre,
          item.tags
        ].join(" ")
      );

      link.innerHTML =
        '<div class="poster">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="poster-label">' + escapeHtml(item.year) + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<h3 class="card-title">' + escapeHtml(item.title) + '</h3>' +
          '<div class="card-meta">' +
            '<span>' + escapeHtml(item.region) + '</span>' +
            '<span>' + escapeHtml(item.genre) + '</span>' +
          '</div>' +
          '<p class="card-text">' + escapeHtml(item.oneLine) + '</p>' +
        '</div>';

      var img = link.querySelector("img");
      img.addEventListener("error", function() {
        img.classList.add("is-hidden");
      });

      return link;
    }

    function escapeHtml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function render() {
      var keyword = (keywordInput.value || "").trim().toLowerCase();
      var year = yearSelect.value;
      var region = regionSelect.value;
      var results = window.MOVIE_SEARCH_DATA.filter(function(item) {
        var text = [
          item.title,
          item.year,
          item.region,
          item.genre,
          item.tags,
          item.oneLine
        ].join(" ").toLowerCase();

        var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        var yearMatched = !year || item.year === year;
        var regionMatched = !region || item.region.indexOf(region) !== -1;

        return keywordMatched && yearMatched && regionMatched;
      }).slice(0, 120);

      resultGrid.innerHTML = "";
      results.forEach(function(item) {
        resultGrid.appendChild(createCard(item));
      });

      if (empty) {
        empty.style.display = results.length ? "none" : "block";
      }
    }

    var query = params().get("q");
    if (query && keywordInput) {
      keywordInput.value = query;
    }

    [keywordInput, yearSelect, regionSelect].forEach(function(el) {
      if (el) {
        el.addEventListener("input", render);
        el.addEventListener("change", render);
      }
    });

    render();
  }

  function initPlayer() {
    var panel = document.querySelector("[data-player]");
    if (!panel) {
      return;
    }

    var video = panel.querySelector("video");
    var layer = panel.querySelector("[data-play-layer]");
    var button = panel.querySelector("[data-play-button]");
    var status = panel.querySelector("[data-player-status]");
    var prepared = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function prepareSource() {
      if (prepared) {
        return;
      }

      var hlsSource = video.getAttribute("data-hls");
      var mp4Source = video.getAttribute("data-mp4");

      if (video.canPlayType("application/vnd.apple.mpegurl") && hlsSource) {
        video.src = hlsSource;
        prepared = true;
        setStatus("已连接高清播放源。");
        return;
      }

      if (window.Hls && window.Hls.isSupported && window.Hls.isSupported() && hlsSource) {
        var hls = new window.Hls();
        hls.loadSource(hlsSource);
        hls.attachMedia(video);
        prepared = true;
        setStatus("已初始化 HLS 播放。");
        return;
      }

      if (mp4Source) {
        video.src = mp4Source;
        prepared = true;
        setStatus("已连接高清播放源。");
      }
    }

    function start() {
      prepareSource();

      var playPromise = video.play();
      if (layer) {
        layer.classList.add("is-hidden");
      }

      if (playPromise && playPromise.catch) {
        playPromise.catch(function() {
          if (layer) {
            layer.classList.remove("is-hidden");
          }
          setStatus("点击播放按钮开始观看。");
        });
      }
    }

    if (button) {
      button.addEventListener("click", start);
    }

    video.addEventListener("play", function() {
      if (layer) {
        layer.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function() {
      if (!video.ended && layer) {
        layer.classList.remove("is-hidden");
      }
    });
  }

  ready(function() {
    hideBrokenImages();
    initMobileMenu();
    initHero();
    initLocalFilter();
    initSearchPage();
    initPlayer();
  });
})();
