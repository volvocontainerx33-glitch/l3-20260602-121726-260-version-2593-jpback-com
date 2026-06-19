(function () {
    const menuToggle = document.querySelector("[data-menu-toggle]");
    const mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    const hero = document.querySelector("[data-hero]");
    if (hero) {
        const slides = Array.from(hero.querySelectorAll(".hero-slide"));
        const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
        let current = 0;

        function showSlide(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 6200);
        }
    }

    const grids = document.querySelectorAll(".js-card-grid");
    grids.forEach(function (grid) {
        const wrap = grid.closest(".section-wrap") || document;
        const input = wrap.querySelector(".js-search-input");
        const select = wrap.querySelector(".js-filter-select");
        const empty = wrap.querySelector("[data-empty-state]");
        const cards = Array.from(grid.querySelectorAll(".movie-card"));
        const typeSet = new Set();

        cards.forEach(function (card) {
            const type = card.getAttribute("data-type") || "";
            if (type) {
                typeSet.add(type);
            }
        });

        if (select) {
            Array.from(typeSet).sort().forEach(function (type) {
                const option = document.createElement("option");
                option.value = type;
                option.textContent = type;
                select.appendChild(option);
            });
        }

        function applyFilter() {
            const keyword = input ? input.value.trim().toLowerCase() : "";
            const selectedType = select ? select.value : "";
            let shown = 0;

            cards.forEach(function (card) {
                const haystack = (card.getAttribute("data-search") || "").toLowerCase();
                const cardType = card.getAttribute("data-type") || "";
                const matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                const matchedType = !selectedType || selectedType === cardType;
                const visible = matchedKeyword && matchedType;
                card.style.display = visible ? "" : "none";
                if (visible) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.classList.toggle("is-visible", shown === 0);
            }
        }

        if (input) {
            input.addEventListener("input", applyFilter);
            const params = new URLSearchParams(window.location.search);
            const query = params.get("q");
            if (query) {
                input.value = query;
            }
        }

        if (select) {
            select.addEventListener("change", applyFilter);
        }

        applyFilter();
    });
}());
