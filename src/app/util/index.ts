import { MediaSession } from "../../shared/interface";

export function getUnixToTime(unixTimestamp: number) {
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
}

export function getLastUsed(sessions: MediaSession[]) {
  const latestTimestamp = sessions
    .map(({ end }) => end)
    .reduce((latestTimestamp, currentTimestamp) =>
      Math.max(latestTimestamp, currentTimestamp)
    );

  const { days, hours, minutes } = getUnixToTime(latestTimestamp);
  return `${getMessageFromTime(days, hours, minutes)} ago`;
}

export function getTotalTime(data: MediaSession[]) {
  let millis = 0;
  for (const session of data) {
    millis += session.end - session.start;
  }

  const minutes = millis / (1000 * 60);
  const hours = minutes / 60;
  const days = hours / 24;
  return getMessageFromTime(days, hours, minutes);
}

export const getMessageFromMillis = (millis: number) => {
  const minutes = millis / (1000 * 60);
  const hours = minutes / 60;
  const days = hours / 24;
  return getMessageFromTime(days, hours, minutes);
};

export const roundMetric = (metric: number) => {
  if (metric < 0) {
    return `${metric.toFixed(2).toString()}`;
  }
  if (metric < 10) {
    return `${metric.toFixed(1).toString()}`;
  }
  return `${metric.toString()}`;
};

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

export function getHashedColor(token: string) {
  let hash = 0;
  for (let i = 0; i < token.length; i++) {
    hash = token.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash *= 100;
  const color = (hash & 0x00ffffff).toString(16).toUpperCase();
  return "#" + "00000".substring(0, 6 - color.length) + color;
}

export function truncTimeWithTz(datetime: Date) {
  const updatedDatetime = new Date(datetime);
  updatedDatetime.setHours(0, 0, 0, 0);
  return updatedDatetime;
}

const MONTHS = [
  "Jan.",
  "Feb.",
  "Mar.",
  "Apr.",
  "May",
  "Jun.",
  "Jul.",
  "Aug.",
  "Sept.",
  "Oct.",
  "Nov.",
  "Dec.",
];

export function getMonthDisplay(date: Date) {
  return MONTHS[date.getMonth()];
}

export function areDatesEqual(d1: Date, d2: Date){
    return d1.toDateString() === d2.toDateString();
}
