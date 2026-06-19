(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

  players.forEach(function (player) {
    var video = player.querySelector("video");
    var cover = player.querySelector(".video-cover");
    var stream = player.getAttribute("data-stream");
    var hls = null;
    var loaded = false;

    var loadStream = function () {
      if (loaded || !video || !stream) {
        return;
      }
      loaded = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }
    };

    var startPlay = function () {
      if (!video) {
        return;
      }
      loadStream();
      player.classList.add("is-playing");
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          player.classList.remove("is-playing");
        });
      }
    };

    if (cover) {
      cover.addEventListener("click", startPlay);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlay();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          player.classList.remove("is-playing");
        }
      });
      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  });
})();
