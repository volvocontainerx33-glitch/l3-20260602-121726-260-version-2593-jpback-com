(function () {
    function queryAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    queryAll("[data-search-form]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var input = form.querySelector("input[name='q']");
            var value = input ? input.value.trim() : "";
            var target = "./search.html";
            if (value) {
                target += "?q=" + encodeURIComponent(value);
            }
            window.location.href = target;
        });
    });

    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = queryAll("[data-hero-slide]", hero);
        var dots = queryAll("[data-hero-dot]", hero);
        var current = 0;
        var timer = null;

        function setSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
                dot.setAttribute("aria-current", dotIndex === current ? "true" : "false");
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                setSlide(current + 1);
            }, 5000);
        }

        queryAll("[data-hero-prev]", hero).forEach(function (button) {
            button.addEventListener("click", function () {
                setSlide(current - 1);
                startTimer();
            });
        });

        queryAll("[data-hero-next]", hero).forEach(function (button) {
            button.addEventListener("click", function () {
                setSlide(current + 1);
                startTimer();
            });
        });

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                setSlide(index);
                startTimer();
            });
        });

        if (slides.length) {
            setSlide(0);
            startTimer();
        }
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var cards = queryAll("[data-movie-card]");
    var emptyState = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    function normalize(value) {
        return String(value || "").toLowerCase().replace(/\s+/g, "");
    }

    function applyFilter() {
        if (!filterInput || !cards.length) {
            return;
        }
        var term = normalize(filterInput.value);
        var visible = 0;
        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search"));
            var matched = !term || text.indexOf(term) !== -1;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });
        if (emptyState) {
            emptyState.classList.toggle("is-visible", visible === 0);
        }
    }

    if (filterInput) {
        if (initialQuery) {
            filterInput.value = initialQuery;
        }
        filterInput.addEventListener("input", applyFilter);
        applyFilter();
    }
})();
