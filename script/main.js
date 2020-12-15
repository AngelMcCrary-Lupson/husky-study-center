/**
 * @name handleFail
 * @param err - error thrown by any function
 * @description Helper function to handle errors
 */
let handleFail = function(err){
    console.log("Error : ", err);
};

var remoteContainer = document.getElementById("remote-container");
var count = 0;

var channelName = localStorage.getItem("channelName");
var username = localStorage.getItem("username");

var call_duration = document.getElementById("call_duration");

document.getElementById("channel_name").innerText = channelName;

document.getElementById('disconnect_call').onclick = () =>  {
    disconnectCall();
}

/**
 * @name disconnectCall
 * @param null
 * @description function to disconnect the call for a local user
 */
function disconnectCall(){
    client.leave();
    if (client.leave) {
        window.location.href = 'index.html';
    }
}

var isMuted = false; //Default state of mic

document.getElementById('mute_mic').onclick = () =>  {
    toggleMic();
}

/**
 * @name toggleMic
 * @param null
 * @description function to switch between enabling and disabling a microphone
 */
function toggleMic() {
    if (isMuted) {
        isMuted = false;
        globalstream.enableAudio();
    } else {
        isMuted = true;
        globalstream.muteAudio();
    }
}

var isShare = false; //Default state of screen share

document.getElementById('share_btn').onclick = () =>  {
    toggleShare();
}

/**
 * @name toggleShare
 * @param null
 * @description function to switch between enabling and disabling screen share
 */
function toggleShare() {
    if (isShare) {
        isShare = false;
        localStream2 = AgoraRTC.createStream({audio: true, video: true, screen: false});
        localStream2.init(function(){
          var newVideoTrack = localStream2.getVideoTrack();
          globalstream.replaceTrack(newVideoTrack);
        });
        toggleCameraBtn();
    } else {
      isShare = true;
      localStream2 = AgoraRTC.createStream({audio: true, video: false, screen: true});
      localStream2.init(function(){
        var newVideoTrack = localStream2.getVideoTrack();
        globalstream.replaceTrack(newVideoTrack);
      });
       toggleCameraBtn();
    }
}

var isCameraOn = true; // Default state of camera

document.getElementById('disable_camera').onclick = () =>  {
    toggleCamera();
}

var cameraBtnOn = true;

/**
 * @name toggleCameraBtn
 * @param null
 * @description disables changing the camera's state
 */
function toggleCameraBtn() {
  if (cameraBtnOn) {
    document.getElementById("disable_camera").disabled = true;
    cameraBtnOn = false;
  } else {
    document.getElementById("disable_camera").disabled = false;
    cameraBtnOn = true;
  }
}

/**
 * @name toggleCamera
 * @param null
 * @description function to switch between enabling and disabling a camera
 */
function toggleCamera() {
    if (isCameraOn) {
        isCameraOn = false;
        globalstream.muteVideo();
    } else {
        isCameraOn = true;
        globalstream.enableVideo();
    }
}

var isMusicOn = true; // Default state of music view port

document.getElementById('bg_song_btn').onclick = () => {
  toggleMusic();
}

/**
 * @name toggleMusic
 * @param null
 * @description function to switch between showing the background music frame view
 */
function toggleMusic() {
  let frame = document.getElementById("bg_music");
  if (isMusicOn) {
    isMusicOn = false;
    frame.classList.add("visible");
  } else {
    isMusicOn = true;
    frame.classList.remove("visible");
  }
}

/**
 * @name addVideoStream
 * @param streamId
 * @description Helper function to add the video stream to "remote-container"
 */
function addVideoStream(streamId){
    count = count + 1;
    let displayName = document.createElement("button");
    displayName.innerText = username;
    displayName.classList = "name";
    displayName.id = streamId + "_btn";
    displayName.title = "Toggle Pinned Video";
    let streamDiv = document.createElement("div");
    streamDiv.id = streamId;
    streamDiv.classList = "flex";
    streamDiv.style.marginBottom = "3vw";
    streamDiv.appendChild(displayName);
    streamDiv.onclick = function() { pinVideo(streamId); }; // Allows the stream to be pinnable
    remoteContainer.appendChild(streamDiv);
}

var isPinned = false; // Default state of pinned stream view port

/**
 * @name pinVideo
 * @param streamId
 * @description Toggles the pinned stream view port and which remote stream is in view
 */
function pinVideo(streamId) {
    let pinStream = document.getElementById("player_" + streamId);
    let pinDiv = document.getElementById("pinned");
    let nameDiv = document.getElementById(streamId);
    let music_btn = document.getElementById("bg_song_btn");
    let pin_btns = document.getElementsByClassName("name");
    let curr_pin_btn = document.getElementById(streamId + "_btn");
    // Toggles the pinned stream and its viewport
    if (isPinned) {
      toggleMusic();
      isPinned = false;
      pinDiv.classList = "visible";
      remoteContainer.appendChild(nameDiv);
      remoteContainer.appendChild(pinStream);
      music_btn.disabled = false;
      enablePins(pin_btns);
    } else {
      toggleMusic();
      music_btn.disabled = true;
      disablePins(pin_btns);
      curr_pin_btn.disabled = false;
      isPinned = true;
      pinDiv.classList = "";
      pinStream.insertBefore(nameDiv, pinStream.firstChild);
      pinDiv.appendChild(pinStream);
    }
}

/**
 * @name disablePins
 * @param null
 * @description disables changing the pinned stream
 */
function disablePins(pins) {
    for (let i = 0; i < pins.length; i++) {
      pins[i].disabled = true;
    }
}

/**
 * @name enablePins
 * @param null
 * @description enables changing the pinned stream
 */
function enablePins(pins) {
    for (let i = 0; i < pins.length; i++) {
      pins[i].disabled = false;
    }
}

/**
 * @name removeVideoStream
 * @param evt - Remove event
 * @description Helper function to remove the video stream from "remote-container"
 */
function removeVideoStream (evt) {
  let stream = evt.stream;
  count = count - 1;
  let id = stream.streamId;
  let streamDiv = document.getElementById("player_" + id);
  let extraDiv = document.getElementById(id);
  stream.stop();
  let remDiv = document.getElementById('remote-container');
  remDiv.removeChild(extraDiv);
  remDiv.removeChild(streamDiv);
}

//Creating client
let client = AgoraRTC.createClient({
    mode : 'live',
    codec : "h264"
});

var stream = AgoraRTC.createStream({
  streamID: 0,
  audio:true,
  video:true,
  screen:false
});

//Initializing client
client.init("dc96e5c14025414ea38980c9b1b1fbe4", function(){
    console.log("Initialized successfully!");
});

//Joining the client
client.join(null, channelName, null, function(uid){

    let localstream = AgoraRTC.createStream({
        streamID : uid,
        audio : true,
        video : true,
        screen : false
    });

    globalstream = localstream;

    // Session logs
    setInterval(() => {
        client.getSessionStats((stats) => {
          let time = new Date(stats.Duration * 1000).toISOString().substr(11, 8);
          call_duration.innerText = "Current In-Call Session Duration: " + time;
        });
      }, 1000);

    //Publishing the stream.
    localstream.init(function(){
        localstream.play('me');
        client.publish(localstream, handleFail);

        client.on('stream-added', (evt)=>{
            client.subscribe(evt.stream,handleFail);
        });

        client.on('stream-subscribed', (evt)=>{
            let stream = evt.stream;
            addVideoStream(stream.getId());
            stream.play('remote-container');
            // Mute the remote user
            // stream.setAudioVolume(0);
        });
        client.on('peer-leave', removeVideoStream);
    },handleFail);

},handleFail);
