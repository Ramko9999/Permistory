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

export const Period = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
};

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

export function areDatesEqual(d1: Date, d2: Date) {
  return d1.toDateString() === d2.toDateString();
}

export function generateDateRange(start: Date, end: Date) {
  let range = [];
  for (
    const current = new Date(start);
    current.valueOf() <= end.valueOf();
    current.setDate(current.getDate() + 1)
  ) {
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

export function getTimePeriodDisplay(period: number) {
  const secs = Math.floor(period / Period.SECOND) % 60;
  const mins = Math.floor(period / Period.MINUTE) % 60;
  const hours = Math.floor(period / Period.HOUR);

  let builder = [];
  if (hours > 0) {
    builder.push(`${hours}h`);
  }
  if (mins > 0) {
    builder.push(`${mins}m`);
  }
  if (secs > 0) {
    builder.push(`${secs}s`);
  }
  return builder.join(" ");
}

export function getFaviconUrl(host: string, size: number = 32) {
  return `https://www.google.com/s2/favicons?domain=${host}&size=${size}`;
}

export function createDateRangeFromNow(daysInThePast: number) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - daysInThePast);
  fromDate.setHours(0, 0, 0, 0);

  const toDate = new Date();
  // playing with milliseconds is dangerous, have run into an infinite rendering issue before

  toDate.setHours(0, 0, 0, 0);
  return { from: truncTimeWithTz(fromDate).valueOf(), to: toDate.valueOf() };
}
