import { generateId } from "../shared/util";
import { MediaEvent, MediaEventType, Permission } from "../shared/interface";

const PUSH_USAGE_PERIOD = 10_000; //10s
const HOST = window.location.hostname;

function monkeyPatchMedia() {
  const prevGetUserMedia = navigator.mediaDevices.getUserMedia;
  navigator.mediaDevices.getUserMedia = function patch(constraints) {
    const didRequestAudio =
      constraints && "audio" in constraints && constraints.audio;
    const didRequestVideo =
      constraints && "video" in constraints && constraints.video;
    return new Promise(async (resolve, reject) => {
      try {
        const stream = await prevGetUserMedia.bind(navigator.mediaDevices)(
          constraints
        );
        try {
          if (didRequestAudio) {
            trackAudioUsage(stream);
          }
          if (didRequestVideo) {
            trackVideoUsage(stream);
          }
        } catch (error) {
          console.error(`Error when attaching media usage tracking`, error);
        } finally {
          resolve(stream);
        }
      } catch (error) {
        reject(error);
      }
    });
  };
}

function trackVideoUsage(stream: MediaStream) {
  const sessionStart = Date.now();
  const metadata = {
    session: generateId(),
    sessionStart,
    host: HOST,
    permission: Permission.VIDEO,
  };
  const usageCron = setInterval(() => {
    publishMediaEvent({
      ...metadata,
      type: MediaEventType.TILL,
      timestamp: Date.now(),
    });
  }, PUSH_USAGE_PERIOD);

  const trackIds = new Set(stream.getVideoTracks().map((track) => track.id));

  // todo: consider onended events as well
  for (const track of stream.getVideoTracks()) {
    const prevTrackStop = track.stop;
    track.stop = () => {
      trackIds.delete(track.id);
      if (trackIds.size === 0) {
        clearInterval(usageCron);
        publishMediaEvent({
          ...metadata,
          type: MediaEventType.TILL,
          timestamp: Date.now(),
        });
        console.log("Shutdown Video Usage Polling");
      }
      prevTrackStop.apply(track, []);
    };
  }

  // todo: consider exposing track.label, which contains the device itself
  publishMediaEvent({
    ...metadata,
    type: MediaEventType.START,
    timestamp: sessionStart,
  });
}

function trackAudioUsage(stream: MediaStream) {
  const sessionStart = Date.now();
  const metadata = {
    sessionStart,
    session: generateId(),
    host: HOST,
    permission: Permission.AUDIO,
  };
  const usageCron = setInterval(() => {
    publishMediaEvent({
      ...metadata,
      type: MediaEventType.TILL,
      timestamp: Date.now(),
    });
  }, PUSH_USAGE_PERIOD);

  const trackIds = new Set(stream.getAudioTracks().map((track) => track.id));

  // todo: consider onended events as well
  for (const track of stream.getAudioTracks()) {
    const prevTrackStop = track.stop;
    track.stop = () => {
      trackIds.delete(track.id);
      if (trackIds.size === 0) {
        clearInterval(usageCron);
        publishMediaEvent({
          ...metadata,
          type: MediaEventType.TILL,
          timestamp: Date.now(),
        });
        console.log("Shutdown Audio Usage Polling");
      }
      prevTrackStop.apply(track, []);
    };
  }

  // todo: consider exposing track.label, which contains the device itself
  publishMediaEvent({
    ...metadata,
    type: MediaEventType.START,
    timestamp: sessionStart,
  });
}

function publishMediaEvent(event: MediaEvent) {
  window.postMessage(event, "*");
}

console.log("Script is running...");
monkeyPatchMedia();