import { MediaEvent, MediaEventType, MediaSession } from "./interface";
import { truncTime, addDays, removeDays } from "./util";

type MediaSessionsByKey = { [index: string]: MediaSession[] };

async function get(keys: string[]): Promise<MediaSessionsByKey> {
  return await chrome.storage.local.get(keys);
}

async function put(key: string, sessions: MediaSession[]) {
  let update: MediaSessionsByKey = {};
  update[key] = sessions;
  return await chrome.storage.local.set(update);
}

function getStorageKey({ sessionStart }: MediaEvent) {
  return truncTime(sessionStart).toString();
}

export async function createMediaSession(event: MediaEvent) {
  const key = getStorageKey(event);
  const sessionsByKey = await get([key]);
  console.log("CreateMediaSession", sessionsByKey);
  let sessions: MediaSession[] = [];
  if (key in sessionsByKey) {
    sessions = sessionsByKey[key];
  }
  const { host, session, permission, sessionStart } = event;
  sessions.push({
    host,
    session,
    permission,
    start: sessionStart,
    end: sessionStart,
  });
  await put(key, sessions);
}

async function updateMediaSesssion(event: MediaEvent) {
  const key = getStorageKey(event);
  const sessionsByKey = await get([key]);
  if (!(key in sessionsByKey)) {
    console.error(
      `Expected ${key} to be in storage when updating MediaSession ${event.session}`
    );
    return;
  }
  const mediaSessions = sessionsByKey[key];
  const hasSession = mediaSessions.some(
    ({ session }) => session === event.session
  );
  if (!hasSession) {
    console.error(
      `Expected ${event.session} to be in storage when updating MediaSession`
    );
    return;
  }
  const updatedSessions = mediaSessions.map((mediaSession) => {
    if (mediaSession.session === event.session) {
      console.log(
        `MediaSession ${event.session} duration: ${
          (event.timestamp - mediaSession.start) / 1000
        } seconds`
      );
      return { ...mediaSession, end: event.timestamp };
    }
    return mediaSession;
  });
  await put(key, updatedSessions);
}

/**
 * Returns media sessions which occured between `from` and `to`
 * @param from unix milliseconds
 * @param to unix milliseconds
 */
export async function queryMediaSessions(from: number, to: number) {
  // TODO: write tests. One of the core methods
  // some sessions can overlap from the previous day to the next. Consider a
  // session from 11:30 PM to 2:20 AM. Hence, we need to fetch data from 1 day before the requested `from`
  // and capture the part of the session that existed after `from`
  const lowerBound = removeDays(truncTime(from), 1);
  const upperBound = truncTime(to);
  // generate keys spanning from lowerBound to upperBound
  let keys = [];
  for (
    let currentDay = lowerBound;
    currentDay <= upperBound;
    currentDay = addDays(currentDay, 1)
  ) {
    keys.push(currentDay.toString());
  }
  const sessionsByKey = await get(keys);
  let canonicalSessions: MediaSession[] = [];
  for (const key in sessionsByKey) {
    canonicalSessions = [...canonicalSessions, ...sessionsByKey[key]];
  }

  return canonicalSessions
    .filter(({ start, end }) => end >= from && start < to)
    .map((mediaSession) => {
      let updatedSession = mediaSession;
      const { start, end } = updatedSession;
      if (start < from) {
        // capture the portion of the overlapping session which occured after `from`
        updatedSession = { ...updatedSession, start: from };
      }
      if (end > to) {
        // capture the portion of the overlapping session which occured before `to`
        updatedSession = { ...updatedSession, end: to };
      }
      return updatedSession;
    });
}

export async function storeMediaEvent(event: MediaEvent) {
  if (event.type === MediaEventType.START) {
    await createMediaSession(event);
  } else if (event.type === MediaEventType.TILL) {
    await updateMediaSesssion(event);
  } else {
    console.error(`Unsupported MediaEventType ${event.type}`);
  }
}
