import { MediaSession } from "../../../shared/interface";
import {
  areDatesEqual,
  generateDateRange,
  truncTimeWithTz,
  formatDateForDashboard,
  getTimePeriodDisplay,
  getFaviconUrl,
} from "../../util";
import "./media.css";

interface MediaTableBlockProps {
  day: number;
  mediaSessions: MediaSession[];
}

function MediaTableBlock({ day, mediaSessions }: MediaTableBlockProps) {
  const totalUsage = mediaSessions
    .map(({ end, start }) => end - start)
    .reduce((total, current) => total + current);
  return (
    <tbody>
      <tr>
        <th colSpan={3}>{formatDateForDashboard(new Date(day))}</th>
        <th>{`Total Usage: ${getTimePeriodDisplay(totalUsage)}`}</th>
      </tr>
      {mediaSessions.map(({ host, start, end }) => (
        <tr>
          <td>
            <div className="media-table-host-container">
              <img
                className="media-table-host-icon"
                src={getFaviconUrl(host)}
              />
              {host}
            </div>
          </td>
          <td>{new Date(start).toLocaleTimeString()}</td>
          <td>{new Date(end).toLocaleTimeString()}</td>
          <td>{getTimePeriodDisplay(end - start)}</td>
        </tr>
      ))}
    </tbody>
  );
}

export interface MediaTableProps {
  from: number;
  to: number;
  mediaSessions: MediaSession[];
}

export function MediaTable({ from, to, mediaSessions }: MediaTableProps) {
  const days = generateDateRange(
    truncTimeWithTz(new Date(from)),
    truncTimeWithTz(new Date(to))
  );
  return (
    <div className="media-table-container">
      <table className="media-table">
        {days.map((day) => {
          const relevantSessions = mediaSessions
            .filter(({ start }) =>
              areDatesEqual(truncTimeWithTz(new Date(start)), day)
            )
            .filter(({ start, end }) => end - start > 0);

          return relevantSessions.length > 0 ? (
            <MediaTableBlock
              day={day.valueOf()}
              mediaSessions={relevantSessions}
            />
          ) : null;
        })}
      </table>
    </div>
  );
}
