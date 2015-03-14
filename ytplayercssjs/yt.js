(function(window) {
  'use strict';

  var volumeLevels = [ 0,10,20,30,40,50,60,70,80,90,100 ];
  var control, player, initialId;
  var container, playerState;

  document.addEventListener('DOMContentLoaded', initializeApi);
  window.loadVideo = loadVideoBeforePlayerLoaded;

  function loadVideoBeforePlayerLoaded(id) {
    // Called when loadVideo() runs before the YT player
    // has finished initializing. We just note the video ID,
    // so that initializeApi() can use it.
    initialId = id;
  }

  function onPlayerStateChange(state) {
    if (state.data == YT.PlayerState.PLAYING) {
      switchButtons("play", "pause");
    } else {
      switchButtons("pause", "play");
    }

    updateCaptionState();
  }

  function onPlayerReady() {
    createControls();

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

    control.turn_captions_on.style.display = "none";
    control.turn_captions_off.style.display = "none";

    control.turn_captions_on.onclick = function() {
      player.loadModule('captions');
      switchButtons('turn_captions_on', 'turn_captions_off');
    };

    control.turn_captions_off.onclick = function() {
      player.unloadModule('captions');
      switchButtons('turn_captions_off', 'turn_captions_on');
    };


    if (initialId) {
      player.cueVideoById(initialId);
    }
    player.setVolume(100);
    resetControls();
    player.pauseVideo();
    control.play.focus();
    showPlay();

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

  function updateCaptionState() {
    var tracklist = player.getOption("captions", "tracklist");
    var on = document.getElementById('turn_captions_on');
    var off = document.getElementById('turn_captions_off');

    if (tracklist && tracklist[0]) {
      // Captions are available and enabled
      on.style.display = 'none';
      off.style.display = '';
    } else if (tracklist && !tracklist[0]) {
      // Captions are available and disabled
      on.style.display = '';
      off.style.display = 'none';
    } else if (!tracklist) {
      // Captions are not available
      on.style.display = 'none';
      off.style.display = 'none';
    }
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

    container = document.getElementById('playercontainer');
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

  function createControls() {
    var elt = document.getElementById('controls');
    var buttonIds = [
      'play', 'pause', 'rewind', 'fwd',
      'reset', 'softer', 'louder', 'mute', 'unmute',
      'turn_captions_on', 'turn_captions_off'
    ];
    var title, fieldset;
    control = {};

    fieldset = document.createElement("fieldset");

    buttonIds.forEach(function(id) {
      var button = document.createElement("button");
      button.innerText = id.replace(/_/g, ' ');
      button.setAttribute('id', id);
      fieldset.appendChild(button);
      control[id] = button;
    });
    elt.appendChild(fieldset);

    playerState = document.createElement("div");
    playerState.setAttribute('id', 'playerstate');
    elt.appendChild(playerState);
  }

  function updateytplayerInfo() {
    var seconds = player.getCurrentTime();
    var length = player.getDuration();
    var percent = 100.0 * seconds / (length || 1);

    var currentTime = fmtTime(Math.round(seconds));
    var videoLength = fmtTime(Math.round(length));
    var videoPercent = Math.round(percent);
    var volume = player.getVolume();

    var text = (
      "Time: " + wrap(currentTime) +
      " of " + wrap(videoLength) +
      " [" + wrap(videoPercent) + "%]" +
      " &emsp; Volume: " + wrap(volume)
    );

    playerState.innerHTML = text;

    function wrap(text) {
      return '<span class="stat">' + text + '</span>';
    }
    function fmtTime(seconds) {
      var mm = Math.floor(seconds / 60);
      var ss = (seconds % 60);

      return mm + ":" + pad(ss, 2);
    }

    function pad(num,len) {
      return (1e15 + num + "").slice(-len);
    }
  }

})(window);
