(function () {
    var toggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === current);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var localInput = document.querySelector('.local-filter-input');
    var localCards = Array.prototype.slice.call(document.querySelectorAll('[data-local-list] .movie-card'));

    if (localInput && localCards.length) {
        localInput.addEventListener('input', function () {
            var value = localInput.value.trim().toLowerCase();
            localCards.forEach(function (card) {
                var text = card.textContent.toLowerCase() + ' ' + [
                    card.getAttribute('data-title'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-type')
                ].join(' ').toLowerCase();
                card.classList.toggle('hidden-by-filter', value && text.indexOf(value) === -1);
            });
        });
    }

    var searchInput = document.querySelector('.global-search-input');
    var searchButton = document.querySelector('.global-search-button');
    var searchResults = document.querySelector('.global-search-results');

    function renderSearch() {
        if (!searchInput || !searchResults || !window.siteSearchItems) {
            return;
        }

        var value = searchInput.value.trim().toLowerCase();
        searchResults.innerHTML = '';

        if (!value) {
            searchResults.classList.remove('open');
            return;
        }

        var matched = window.siteSearchItems.filter(function (item) {
            return item.search.indexOf(value) !== -1;
        }).slice(0, 12);

        matched.forEach(function (item) {
            var link = document.createElement('a');
            link.className = 'search-result-card';
            link.href = item.url;
            link.innerHTML = '<strong>' + item.title + '</strong><small>' + item.meta + '</small>';
            searchResults.appendChild(link);
        });

        searchResults.classList.add('open');
    }

    if (searchInput && searchButton) {
        searchButton.addEventListener('click', renderSearch);
        searchInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                renderSearch();
            }
        });
        searchInput.addEventListener('input', function () {
            if (searchInput.value.trim().length >= 2) {
                renderSearch();
            } else if (searchResults) {
                searchResults.classList.remove('open');
            }
        });
    }
}());
