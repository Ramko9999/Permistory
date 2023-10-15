import { Permission, MediaSession } from "../interface";
import { queryMediaSessions } from "../store";
import { truncTime } from "../util";
describe("queryMediaSessions", () => {
  const baseMediaSession: MediaSession = {
    host: "discord.com",
    permission: Permission.AUDIO,
    session: "1",
    start: new Date("9/24/2023, 1:43:16 PM").valueOf(),
    end: new Date("9/24/2023, 4:43:16 PM").valueOf(),
  };

  function patchStorage(...mediaSessions: MediaSession[]) {
    const byKey: { [index: string]: MediaSession[] } = {};
    mediaSessions.forEach((session) => {
      const key = `${session.permission}_${truncTime(session.start)}`;
      if (!(key in byKey)) {
        byKey[key] = [];
      }
      byKey[key].push(session);
    });

    const stub = (keys: string[]) => {
      return new Promise((resolve, _) => {
        const queryResult: { [index: string]: MediaSession[] } = {};
        keys
          .filter((key) => key in byKey)
          .forEach((key) => (queryResult[key] = byKey[key]));
        resolve(queryResult);
      });
    };

    global.chrome = {
      storage: {
        local: {
          //@ts-ignore chrome.storage.local.get is only used by passing in a set of keys
          get: stub,
        },
      },
    };
  }

  const from = new Date("9/24/2023, 12:00:00 AM").valueOf();
  const to = new Date("9/26/2023, 12:00:00 AM").valueOf();

  it("when a session completes within the same day", async () => {
    patchStorage(baseMediaSession);
    const sessions = await queryMediaSessions(from, to, Permission.AUDIO);
    expect(sessions).toEqual([baseMediaSession]);
  });

  it("when a session starts before 'from' and ends after 'to'", async () => {
    patchStorage({
      ...baseMediaSession,
      start: new Date("9/23/2023, 6:00:00 PM").valueOf(),
      end: new Date("9/26/2023, 6:00:00 PM").valueOf(),
    });
    const sessions = await queryMediaSessions(from, to, Permission.AUDIO);
    expect(sessions).toEqual([
      {
        ...baseMediaSession,
        start: from,
        end: new Date("9/25/2023, 12:00:00 AM").valueOf(),
      },
      {
        ...baseMediaSession,
        start: new Date("9/25/2023, 12:00:00 AM").valueOf(),
        end: to,
      },
    ]);
  });

  it("when a session extends into a subsequent day", async () => {
    patchStorage({
      ...baseMediaSession,
      start: new Date("9/24/2023, 6:00:00 PM").valueOf(),
      end: new Date("9/25/2023, 12:00:00 PM").valueOf(),
    });
    const sessions = await queryMediaSessions(from, to, Permission.AUDIO);
    expect(sessions).toEqual([
      {
        ...baseMediaSession,
        start: new Date("9/24/2023, 6:00:00 PM").valueOf(),
        end: new Date("9/25/2023, 12:00:00 AM").valueOf(),
      },
      {
        ...baseMediaSession,
        start: new Date("9/25/2023, 12:00:00 AM").valueOf(),
        end: new Date("9/25/2023, 12:00:00 PM").valueOf(),
      },
    ]);
  });

  it("when a session precedes the `from` and `to` by a day", async () => {
    patchStorage({
      ...baseMediaSession,
      start: new Date("9/23/2023, 12:00:00 AM").valueOf(),
      end: new Date("9/23/2023, 2:00:00 AM").valueOf(),
    });
    const sessions = await queryMediaSessions(from, to, Permission.AUDIO);
    expect(sessions).toEqual([]);
  });
});
