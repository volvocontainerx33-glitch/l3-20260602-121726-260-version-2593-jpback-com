(function () {
    function createMoviePlayer(settings) {
        var video = document.getElementById(settings.videoId);
        var overlay = document.getElementById(settings.overlayId);
        var started = false;
        var hlsInstance = null;

        if (!video || !overlay || !settings.url) {
            return;
        }

        function attach() {
            if (started) {
                return;
            }

            started = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(settings.url);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = settings.url;
            } else {
                video.src = settings.url;
            }
        }

        function play() {
            attach();
            overlay.classList.add('is-hidden');
            video.controls = true;

            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.createMoviePlayer = createMoviePlayer;
}());
