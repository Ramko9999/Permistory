console.log("Script is running....");

let prevGetUserMedia = navigator.mediaDevices.getUserMedia;
navigator.mediaDevices.getUserMedia = function getUserMedia(constraints) {
  const shouldTrackAudio = constraints && "audio" in constraints && constraints.audio;
  const shouldTrackVideo = constraints && "video" in constraints && constraints.video;

  return new Promise((resolve, reject) => {

    prevGetUserMedia.bind(navigator.mediaDevices)(constraints)
      .then((stream) => {
        if (shouldTrackAudio) {
          attachAudioUsage(stream);
        }
        if (shouldTrackVideo) {
          attachVideoUsage(stream);
        }
        resolve(stream);
      })
      .catch((error) => {
        console.log(error);
      });
  });
}

let geolocation = navigator.geolocation.getCurrentPosition;
  navigator.geolocation.getCurrentPosition = function (success, error, options) {
  geolocation.apply(navigator.geolocation, [success, error, options]);
  notifyLocationIntent();
};

const attachAudioUsage = (stream) => {
  const sessionId = generateSessionId(10);
  const onStopAudioCallback = getOnStopCallback(stream.getAudioTracks().length, sessionId, "AUDIO");
  for (const track of stream.getAudioTracks()) {
    let prevTrackStop = track.stop;
    track.stop = function onStop() {
      prevTrackStop.apply(track, []);
      onStopAudioCallback();
    }
  }
  notifyUsageStart("AUDIO", sessionId);
}

const attachVideoUsage = (stream) => {
  const sessionId = generateSessionId(10);
  const onStopVideoCallback = getOnStopCallback(stream.getVideoTracks().length, sessionId, "VIDEO");
  for (const track of stream.getVideoTracks()) {
    let prevTrackStop = track.stop;
    track.stop = function onStop() {
      prevTrackStop.apply(track, []);
      onStopVideoCallback();
    }
  }
  notifyUsageStart("VIDEO", sessionId);
}

const getOnStopCallback = (tracksNeededToTrigger, session, device) => {
  let tracksTriggered = 0;
  return () => {
    tracksTriggered++;
    if (tracksTriggered === tracksNeededToTrigger) {
      notifyUsageEnd(device, session);
    }
  }
}

const generateSessionId = (length) => {
  const swap = (pool, i, j) => {
    let temp = pool[i];
    pool[i] = pool[j];
    pool[j] = temp;
  }

  let pool = [];
  for (let i = 0; i < 10; i++) {
    pool.push(i.toString());
  }
  for (let i = 0; i < 26; i++) {
    pool.push(String.fromCodePoint(65 + i));
  }

  let sessionId = [];
  for (let i = 0; i < length; i++) {
    let pickIndex = Math.floor(Math.random() * pool.length);
    swap(pool, pickIndex, pool.length - 1);
    sessionId.push(pool.pop())
  }

  return sessionId.join("");
}

const getDatetime = () => {
  return Date.now();
}

const notifyUsageStart = (device, sessionId) => {
  return window.postMessage({
    message_type: "MEDIA_INTENT",
    type: "BEGIN",
    session: sessionId,
    device: device,
    timestamp: getDatetime(),
    host: getHost()
  }, "*");
}

const notifyUsageEnd = (device, sessionId) => {
  return window.postMessage({
    message_type: "MEDIA_INTENT",
    type: "FINISH",
    session: sessionId,
    device: device,
    timestamp: getDatetime(),
    host: getHost()
  }, "*");
}


const notifyLocationIntent = () => {
  return window.postMessage({
    message_type: "LOCATION_INTENT",
    device: "LOCATION",
    timestamp: getDatetime(),
    host: getHost()
  })
}

const getHost = () => {
  const url = new URL(window.location.href);
  return url.host || url.hostname;
}