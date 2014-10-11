
(function(window) {
  var ytplayer;
  var ids = [
    'play', 'pause', 'rewind', 'fwd',
    'reset', 'softer', 'louder', 'mute', 'unmute',
    'videotime', 'videolength', 'videopercent', 'volume'
  ];

  document.addEventListener('DOMContentLoaded', function(){
    window.onYouTubePlayerReady = function(playerId) {
      var i;
      var volumeLevels = new Array(0,10,20,30,40,50,60,70,80,90,100);
      var control = findControls(ids);
      window.loadVideo = load;
      window.resetControls = resetControls;
      ytplayer = document.getElementById("myytplayer");
      setInterval(updateytplayerInfo, 250);

      control.play.onclick = function() {
        ytplayer.playVideo();
        switchButtons('play', 'pause')
      };

      control.pause.onclick = function() {
        ytplayer.pauseVideo();
        switchButtons('pause', 'play');
      };
      control.fwd.onclick = function() {
        ytplayer.seekTo(ytplayer.getCurrentTime() + 15);
      };
      control.rewind.onclick = function() {
        time = ytplayer.getCurrentTime();
        time -= 15;
        if (time < 0) {
          time = 0;
        }
        ytplayer.seekTo(time);
      };
      control.mute.onclick = function() {
        ytplayer.mute();
        switchButtons('mute', 'unmute');
      };
      control.unmute.onclick = function() {
        ytplayer.unMute();
        switchButtons('unmute', 'mute');
      };
      control.softer.onclick = function() {
        var i;
        var vol = ytplayer.getVolume();

        for (i = volumeLevels.length - 1; i >= 0; i--){
          if (vol > volumeLevels[i]) {
            vol = volumeLevels[i];
            break;
          }
        };

        ytplayer.setVolume(vol);
      };
      control.louder.onclick = function() {
        var i;
        var vol = ytplayer.getVolume();
        for (i=0; i < volumeLevels.length; i++) {
          if (vol < volumeLevels[i]) {
            vol = volumeLevels[i];
            break;
          }
        };
        ytplayer.setVolume(vol);

      };
      control.reset.onclick = function() {
        ytplayer.pauseVideo();
        ytplayer.seekTo(0);
        showPlay();
      };

      initial_id = document.getElementById('youtube-initial-id').value;
      ytplayer.cueVideoById(initial_id);
      ytplayer.setVolume(100);
      resetControls();
      ytplayer.pauseVideo();
      showPlay();

      function updateytplayerInfo() {
        var seconds = ytplayer.getCurrentTime();
        var length = ytplayer.getDuration();
        var percent = 100.0 * seconds / (length || 1);

        control.videotime.textContent = fmtTime(Math.round(seconds));
        control.videolength.textContent = fmtTime(Math.round(length));
        control.videopercent.textContent = Math.round(percent);
        control.volume.textContent = ytplayer.getVolume();
      }

      function fmtTime(seconds) {
        mm = Math.floor(seconds / 60);
        ss = (seconds % 60);

        return mm + ":" + pad(ss, 2);
      }

      function pad(num,len) {
        return (1e15 + num + "").slice(-len);
      }


      function switchButtons(from, to) {
        control[from].style.display = 'none';
        control[to].style.display = '';
        control[to].focus();
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
        showPlay();
        showMute();
      }
    }

    function findControls(ids) {
      var i, controls = {};
      for (i = 0; i < ids.length; i++) {
        controls[ids[i]] = document.getElementById(ids[i]);
      }
      return controls;
    }

    function load(id) {
      ytplayer.loadVideoById(id, 0);
      resetControls();
    }

  });
})(window);
