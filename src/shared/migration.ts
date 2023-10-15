import { generateDateRange } from "../app/util";
import { MediaEvent, MediaEventType, MediaSession } from "./interface";
import { truncTime, truncTimeWithTz, removeDays } from "./util";

function getStorageKey({ sessionStart, permission }: MediaEvent) {
  return `${permission}_${truncTime(sessionStart)}`;
}

export async function copyMediaSessions(sessions: MediaSession[], dryRun: boolean = true) {
  let copy: {[index: string]: MediaSession[]} = {};
  for(const mediaSession of sessions){
    const {start, permission} = mediaSession;
    //@ts-ignore
    const key = getStorageKey({sessionStart: start, permission});
    if(!(key in copy)){
        copy[key] = [];
    }
    copy[key].push(mediaSession);
  }

  console.log("Copying...", copy);
  await chrome.storage.local.set(copy)
}