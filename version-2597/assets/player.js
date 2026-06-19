(function () {
    function attachSource(video, source) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return new Promise(function (resolve) {
                hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
            });
        }

        video.src = source;
        return Promise.resolve();
    }

    document.addEventListener('DOMContentLoaded', function () {
        var video = document.getElementById('movie-player');
        var button = document.querySelector('.play-layer');

        if (!video || !button) {
            return;
        }

        var source = video.getAttribute('data-video');
        var prepared = false;

        function play() {
            button.classList.add('is-hidden');
            video.setAttribute('controls', 'controls');

            var ready = prepared ? Promise.resolve() : attachSource(video, source);
            prepared = true;
            ready.then(function () {
                return video.play();
            }).catch(function () {
                button.classList.remove('is-hidden');
            });
        }

        button.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (!prepared) {
                play();
            }
        });
    });
}());
