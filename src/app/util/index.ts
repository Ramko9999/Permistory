import { MediaSession } from "../../shared/interface";

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

export function generateDateRange(start: Date, end: Date){
  let range = [];
  for(const current = new Date(start); current.valueOf() <= end.valueOf(); current.setDate(current.getDate() + 1)){
    range.push(new Date(current));
  }
  return range;
}

export function formatDateForDashboard(date: Date) {
  const current = new Date();
  if (current.getFullYear() === date.getFullYear()) {
    return `${getMonthDisplay(date)} ${date.getDate()}`;
  }
  return `${getMonthDisplay(date)} ${date.getDate()}, ${date.getFullYear()}`;
}

export function getTimePeriodDisplay(periodInMillis: number){
  const secs = Math.floor(periodInMillis / 1000) % 60;
  const mins =  Math.floor(periodInMillis / (60 * 1000)) % 60;
  const hours = Math.floor(periodInMillis / (60 * 60 * 1000));

  let builder = [];
  if(hours > 0){
    builder.push(`${hours}h`);
  }
  if(mins > 0){
    builder.push(`${mins}m`);
  }
  if(secs > 0){
    builder.push(`${secs}s`);
  }
  return builder.join(" ");
}

export function getFaviconUrl(host: string, size: number = 32){
  return `https://www.google.com/s2/favicons?domain=${host}&size=${size}`
}