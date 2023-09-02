import { Device } from "../components/home/Home";
import { MediaSession } from "../../shared/interface";

export const getUnixToTime = (unixTimestamp: number) => {
  let elapsed = Math.abs(new Date().getTime() - unixTimestamp) / 1000;

  const days = Math.floor(elapsed / 86400);
  elapsed -= days * 86400;

  // calculate hours
  const hours = Math.floor(elapsed / 3600) % 24;
  elapsed -= hours * 3600;

  // calculate minutes
  const minutes = Math.floor(elapsed / 60) % 60;
  elapsed -= minutes * 60;

  return { days, hours, minutes };
};

export const getLastUsed = (data: MediaSession[], deviceType: Device) => {
  let lastUsedTime = null as any;
  for (const session of data) {
      if (lastUsedTime === null) {
        lastUsedTime = session.end;
      } else {
        lastUsedTime = Math.max(lastUsedTime, session.end);
      }
  }
  if (lastUsedTime === null) {
    return "Not enough data";
  }
  const { days, hours, minutes } = getUnixToTime(lastUsedTime);
  return `${getMessageFromTime(days, hours, minutes)} ago`;
};

export const getTotalTime = (data: MediaSession[], deviceType: Device) => {
  let millis = 0;
  for (const session of data) {
      millis += (session.end - session.start);
  }

  const hours = getTotalHoursFromMillis(millis);
  const days = getTotalDaysFromMillis(millis);
  const minutes = getTotalMinsFromMillis(millis);
  return getMessageFromTime(days, hours, minutes);
};

export const getTotalHoursFromMillis = (millis: number) => {
  return millis / (1000 * 3600);
};

export const getTotalMinsFromMillis = (millis: number) => {
  return millis / (1000 * 60);
};

export const getTotalDaysFromMillis = (millis: number) => {
  const hours = getTotalHoursFromMillis(millis);
  return hours / 24;
};

export const getMessageFromMillis = (millis: number) => {
    const hours = getTotalHoursFromMillis(millis);
    const days = getTotalDaysFromMillis(millis);
    const minutes = getTotalMinsFromMillis(millis);
    return getMessageFromTime(days, hours, minutes);
}

export const roundMetric = (metric: number) => {
    if (metric < 0) {
      return `${metric.toFixed(2).toString()}`;
    }
    if (metric < 10) {
      return `${metric.toFixed(1).toString()}`;
    }
    return `${metric.toString()}`;
}

export const getMessageFromTime = (
  days: number,
  hours: number,
  minutes: number
) => {
  if (days < 1) {
    if (hours < 1) {
      if (minutes < 1) {
        return `A few moments`;
      }
      return `${Math.floor(minutes)} mins`;
    } else {
      return `${roundMetric(hours)} hrs`;
    }
  } else {
    return `${roundMetric(days)} days`;
  }
};
