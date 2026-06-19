(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var mobileNav = document.querySelector('[data-mobile-nav]');

        if (toggle && mobileNav) {
            toggle.addEventListener('click', function () {
                mobileNav.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('[data-hero]').forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var current = 0;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === current);
                });
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    show(index);
                });
            });

            if (slides.length > 1) {
                window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
        });

        document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var select = scope.querySelector('[data-filter-category]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.filter-card'));
            var empty = scope.querySelector('[data-empty-state]');
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');

            if (query && input && !input.value) {
                input.value = query;
            }

            function run() {
                var term = normalize(input ? input.value : '');
                var category = select ? select.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-category'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-tags'),
                        card.textContent
                    ].join(' '));
                    var cardCategory = card.getAttribute('data-category') || '';
                    var okTerm = !term || haystack.indexOf(term) !== -1;
                    var okCategory = !category || cardCategory === category;
                    var showCard = okTerm && okCategory;

                    card.hidden = !showCard;
                    if (showCard) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener('input', run);
            }
            if (select) {
                select.addEventListener('change', run);
            }
            run();
        });
    });
}());
