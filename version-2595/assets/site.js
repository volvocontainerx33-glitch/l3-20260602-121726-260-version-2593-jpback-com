(function () {
  var header = document.querySelector(".site-header");
  var toggle = document.querySelector("[data-mobile-toggle]");
  if (toggle && header) {
    toggle.addEventListener("click", function () {
      header.classList.toggle("is-open");
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".spotlight-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".spotlight-dot"));
  if (slides.length > 1) {
    var current = 0;
    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
      });
    });
    setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var params = new URLSearchParams(window.location.search);
  var queryFromUrl = params.get("q") || "";
  var input = document.querySelector("[data-page-search]");
  var yearSelect = document.querySelector("[data-year-filter]");
  var genreSelect = document.querySelector("[data-genre-filter]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var noResult = document.querySelector("[data-no-result]");

  var normalize = function (value) {
    return String(value || "").toLowerCase().replace(/\s+/g, "");
  };

  var applyFilter = function () {
    if (!cards.length) {
      return;
    }
    var query = normalize(input ? input.value : queryFromUrl);
    var year = yearSelect ? yearSelect.value : "";
    var genre = genreSelect ? genreSelect.value : "";
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.dataset.title,
        card.dataset.genre,
        card.dataset.tags,
        card.dataset.region,
        card.dataset.year
      ].join(" "));
      var matchQuery = !query || haystack.indexOf(query) !== -1;
      var matchYear = !year || card.dataset.year === year;
      var matchGenre = !genre || normalize(card.dataset.genre).indexOf(normalize(genre)) !== -1 || normalize(card.dataset.tags).indexOf(normalize(genre)) !== -1;
      var show = matchQuery && matchYear && matchGenre;
      card.style.display = show ? "" : "none";
      if (show) {
        visible += 1;
      }
    });

    if (noResult) {
      noResult.classList.toggle("is-visible", visible === 0);
    }
  };

  if (input && queryFromUrl) {
    input.value = queryFromUrl;
  }

  if (input) {
    input.addEventListener("input", applyFilter);
  }
  if (yearSelect) {
    yearSelect.addEventListener("change", applyFilter);
  }
  if (genreSelect) {
    genreSelect.addEventListener("change", applyFilter);
  }
  applyFilter();
})();
