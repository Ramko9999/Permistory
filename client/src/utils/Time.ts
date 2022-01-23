import { Session } from "../interfaces/Session";

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

export const getLastUsed = (data: Session[]) => {
  let lastUsedTime = data[0].endingTimestamp;
  for (const session of data) {
    lastUsedTime = Math.max(lastUsedTime, session.endingTimestamp);
  }
  const { days, hours, minutes } = getUnixToTime(lastUsedTime);

  if (days < 1 || days === NaN) {
    if (hours < 1 || hours === NaN) {
      return `${minutes} mins`;
    } else {
      return `${hours} hrs`;
    }
  } else {
    return `${days} days`;
  }
};

export const getTotalHours = (data: Session[]) => {
  let millis = 0;
  for (const session of data) {
    millis += session.duration;
  }
  return getTotalHoursFromMillis(millis);
};


export const getTotalHoursFromMillis = (millis: number) => {
  return millis / (1000 * 3600);
}
