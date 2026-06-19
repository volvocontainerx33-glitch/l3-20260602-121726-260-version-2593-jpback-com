(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector("[data-menu-button]");
  var navLinks = document.querySelector("[data-nav-links]");

  if (menuButton && navLinks) {
    menuButton.addEventListener("click", function () {
      navLinks.classList.toggle("is-open");
    });
  }

  var slides = all(".hero-slide");
  var dots = all(".hero-dots button");
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === activeIndex);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    showSlide(0);

    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5600);
  }

  all("[data-filter-area]").forEach(function (area) {
    var input = area.querySelector("[data-search-input]");
    var yearSelect = area.querySelector("[data-year-filter]");
    var regionSelect = area.querySelector("[data-region-filter]");
    var genreSelect = area.querySelector("[data-genre-filter]");
    var scope = area.parentElement || document;
    var cards = all(".movie-card, .ranking-row", scope);

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function applyFilter() {
      var query = normalize(input && input.value);
      var year = normalize(yearSelect && yearSelect.value);
      var region = normalize(regionSelect && regionSelect.value);
      var genre = normalize(genreSelect && genreSelect.value);

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute("data-search"));
        var cardYear = normalize(card.getAttribute("data-year"));
        var cardRegion = normalize(card.getAttribute("data-region"));
        var cardGenre = normalize(card.getAttribute("data-genre"));

        var matched = true;

        if (query && searchText.indexOf(query) === -1) {
          matched = false;
        }

        if (year && cardYear !== year) {
          matched = false;
        }

        if (region && cardRegion.indexOf(region) === -1) {
          matched = false;
        }

        if (genre && cardGenre.indexOf(genre) === -1) {
          matched = false;
        }

        card.hidden = !matched;
      });
    }

    [input, yearSelect, regionSelect, genreSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", applyFilter);
        control.addEventListener("change", applyFilter);
      }
    });
  });

  all("[data-start-player]").forEach(function (button) {
    button.addEventListener("click", function () {
      window.setTimeout(function () {
        var cover = document.querySelector(".player-cover");

        if (cover) {
          cover.click();
        }
      }, 80);
    });
  });
})();
