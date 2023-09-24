import { generateDateRange } from "../app/util";
import { MediaEvent, MediaEventType, MediaSession } from "./interface";
import { truncTime, truncTimeWithTz, removeDays } from "./util";

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

function sliceMediaSession(
  { start, end, ...metadata }: MediaSession,
  from: number,
  to: number
) {
  let begin = Math.max(start, from);
  const finish = Math.min(to, end);
  const slicePoints = generateDateRange(
    new Date(truncTimeWithTz(begin)),
    new Date(truncTimeWithTz(finish))
  ).map((d) => d.valueOf());

  const slices: MediaSession[] = [];
  for (const slicePoint of slicePoints) {
    if (slicePoint > begin && slicePoint < finish) {
      slices.push({ ...metadata, start: begin, end: slicePoint });
      begin = slicePoint;
    }
  }
  slices.push({ ...metadata, start: begin, end: finish });
  return slices;
}

/**
 * Returns media sessions which occured between `from` and `to`
 * @param from unix milliseconds
 * @param to unix milliseconds
 */
export async function queryMediaSessions(
  from: number,
  to: number
): Promise<MediaSession[]> {
  // Sessions can overlap from the previous day to the next. Consider a session from Aug. 6 11:30 pm
  // to Aug. 7th 2:20 AM. We have to fetch a day prior to from and slice the canonical MediaSessions to contain them
  // with a day.
  const keys = generateDateRange(
    new Date(removeDays(truncTime(from), 1)),
    new Date(truncTime(to))
  ).map((d) => d.valueOf().toString());

  const sessionsByKey = await get(keys);
  const canonicalSessions = Object.values(sessionsByKey).flat();

  return canonicalSessions.flatMap((session) =>
    sliceMediaSession(session, from, to)
  );
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
