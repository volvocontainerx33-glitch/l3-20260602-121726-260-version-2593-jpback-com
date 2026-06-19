(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-button]"));
    var empty = document.querySelector("[data-empty-result]");
    var activeFilter = "全部";

    if (!input && buttons.length === 0) {
      return;
    }

    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }

    function apply() {
      var keyword = normalize(input ? input.value : "");
      var matched = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.textContent + " " + (card.getAttribute("data-filter") || ""));
        var passKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var passFilter = activeFilter === "全部" || haystack.indexOf(normalize(activeFilter)) !== -1;
        var visible = passKeyword && passFilter;
        card.style.display = visible ? "" : "none";
        if (visible) {
          matched += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", matched === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("active");
        });
        button.classList.add("active");
        activeFilter = button.getAttribute("data-filter-button") || "全部";
        apply();
      });
    });
    apply();
  }

  function attachHls(video, url) {
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      return;
    }
    video.src = url;
  }

  window.initMoviePlayer = function (url) {
    ready(function () {
      var video = document.querySelector("[data-player-video]");
      var cover = document.querySelector("[data-player-cover]");
      if (!video || !url) {
        return;
      }
      var prepared = false;

      function play() {
        if (!prepared) {
          attachHls(video, url);
          prepared = true;
        }
        if (cover) {
          cover.classList.add("is-hidden");
        }
        video.controls = true;
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {});
        }
      }

      if (cover) {
        cover.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
    });
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
  });
})();
