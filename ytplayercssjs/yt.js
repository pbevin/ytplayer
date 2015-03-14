(function(window) {
  'use strict';

  var volumeLevels = [ 0,10,20,30,40,50,60,70,80,90,100 ];
  var ids = [
    'play', 'pause', 'rewind', 'fwd',
    'reset', 'softer', 'louder', 'mute', 'unmute',
    'videotime', 'videolength', 'videopercent', 'volume'
  ];
  var control, player, initialId;

  document.addEventListener('DOMContentLoaded', initializeApi);
  window.loadVideo = loadVideoBeforePlayerLoaded;

  function onPlayerStateChange(state) {
    if (state.data == YT.PlayerState.PLAYING) {
      switchButtons("play", "pause");
    } else {
      switchButtons("pause", "play");
    }
  }

  function onPlayerReady() {
    control = findControls(ids);
    setInterval(updateytplayerInfo, 250);
    window.loadVideo = loadVideo;
    window.resetControls = resetControls;

    control.play.onclick = function() {
      player.playVideo();
      switchButtons('play', 'pause');
    };

    control.pause.onclick = function() {
      player.pauseVideo();
      switchButtons('pause', 'play');
    };
    control.fwd.onclick = function() {
      player.seekTo(player.getCurrentTime() + 15);
    };
    control.rewind.onclick = function() {
      var time = player.getCurrentTime();
      time -= 15;
      if (time < 0) {
        time = 0;
      }
      player.seekTo(time);
    };
    control.mute.onclick = function() {
      player.mute();
      switchButtons('mute', 'unmute');
    };
    control.unmute.onclick = function() {
      player.unMute();
      switchButtons('unmute', 'mute');
    };
    control.softer.onclick = function() {
      var i;
      var vol = player.getVolume();

      for (i = volumeLevels.length - 1; i >= 0; --i) {
        if (vol > volumeLevels[i]) {
          vol = volumeLevels[i];
          break;
        }
      }

      player.setVolume(vol);
    };
    control.louder.onclick = function() {
      var i;
      var vol = player.getVolume();
      for (i=0; i < volumeLevels.length; ++i) {
        if (vol < volumeLevels[i]) {
          vol = volumeLevels[i];
          break;
        }
      }
      player.setVolume(vol);

    };
    control.reset.onclick = function() {
      player.pauseVideo();
      player.seekTo(0);
      showPlay();
    };

    if (initialId) {
      player.cueVideoById(initialId);
    }
    player.setVolume(100);
    resetControls();
    player.pauseVideo();
    showPlay();

    function updateytplayerInfo() {
      var seconds = player.getCurrentTime();
      var length = player.getDuration();
      var percent = 100.0 * seconds / (length || 1);

      control.videotime.textContent = fmtTime(Math.round(seconds));
      control.videolength.textContent = fmtTime(Math.round(length));
      control.videopercent.textContent = Math.round(percent);
      control.volume.textContent = player.getVolume();
    }

    function fmtTime(seconds) {
      var mm = Math.floor(seconds / 60);
      var ss = (seconds % 60);

      return mm + ":" + pad(ss, 2);
    }

    function pad(num,len) {
      return (1e15 + num + "").slice(-len);
    }

    function showPlay() {
      control.pause.style.display = 'none';
      control.play.style.display = '';
    }

    function showMute() {
      control.unmute.style.display = 'none';
      control.mute.style.display = '';
    }

    function resetControls() {
      showMute();
    }

    function loadVideo(id) {
      player.loadVideoById(id, 0);
      resetControls();
    }
  }

  function switchButtons(from, to) {
    control[from].style.display = 'none';
    control[to].style.display = '';
    control[to].focus();
  }

  function initializeApi() {
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    var playerVars = {
      autoplay: 0,
      controls: 0,
    };
    var container = document.getElementById('playercontainer');
    if (!container) {
      console.error("Can't find #playercontainer element");
      return;
    }
    var videoId = initialId || container.getAttribute("data-video-id");
    var captions = container.getAttribute("data-captions");
    if (captions) {
      playerVars.cc_load_policy = 1;
    }
    var lang = container.getAttribute("data-language");
    if (lang) {
      playerVars.hl = lang;
    }
    var start = container.getAttribute("data-start");
    if (start) {
      playerVars.start = start;
    }

    var width = container.getAttribute("data-width");
    var height = container.getAttribute("data-height");

    window.onYouTubeIframeAPIReady = function() {
      player = new YT.Player('playercontainer', {
        width: width || "640",
        height: height || "480",
        videoId: videoId,
        playerVars: playerVars,
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    };
  }

  function findControls(ids) {
    var i, controls = {};
    for (i = 0; i < ids.length; i++) {
      controls[ids[i]] = document.getElementById(ids[i]);
    }
    return controls;
  }

  function loadVideoBeforePlayerLoaded(id) {
    // Called when loadVideo() runs before the YT player
    // has finished initializing. We just note the video ID,
    // so that initializeApi() can use it.
    initialId = id;
  }

})(window);
