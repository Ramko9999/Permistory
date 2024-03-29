import { generateDateRange } from "../app/util";
import { MediaEvent, MediaEventType, MediaSession, Permission } from "./interface";
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

function getStorageKey(sessionStart: number, permission: Permission){
  return `${permission}_${truncTime(sessionStart)}`;
}

export async function createMediaSession(event: MediaEvent) {
  const key = getStorageKey(event.sessionStart, event.permission);
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
  const key = getStorageKey(event.sessionStart, event.permission);
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
 * Returns media sessions which occured between `from` and `to` at maximum granularity of day. Sessions can overlap from
 * the previous day to the next: 8/6 11:30pm to 8/7 3:00am. Sessions could theoretically extend beyond a day: 8/6 11:30pm to 8/7 11:47pm.
 * In order to handle these cases, sessions from the day preceding `from` will be fetched, and sessions will be sliced by day.
 * @param from unix milliseconds
 * @param to unix milliseconds
 * @param permission permission
 * @returns a list of media sessions
 */
export async function queryMediaSessions(
  from: number,
  to: number,
  permission: Permission
): Promise<MediaSession[]> {
  const keys = generateDateRange(
    new Date(removeDays(truncTime(from), 1)),
    new Date(truncTime(to))
  ).map((d) => getStorageKey(d.valueOf(), permission));

  const sessionsByKey = await get(keys);
  const canonicalSessions = Object.values(sessionsByKey).flat();

  return canonicalSessions
    .filter(
      ({ start, end }) =>
        // this has be to true if the session occured within `from` and `to`.
        Math.max(start, from) < Math.min(end, to)
    )
    .flatMap((session) => sliceMediaSession(session, from, to));
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
