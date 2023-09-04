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

interface MediaUsageTableBlockProps {
  day: number;
  mediaSessions: MediaSession[];
}

function MediaUsageTableBlock({
  day,
  mediaSessions,
}: MediaUsageTableBlockProps) {
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
            <div className="host-icon">
              <img className="icon" src={getFaviconUrl(host)}/>
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

export interface MediaUsageTableProps {
  from: number;
  to: number;
  mediaSessions: MediaSession[];
}

export function MediaUsageTable({
  from,
  to,
  mediaSessions,
}: MediaUsageTableProps) {
  const days = generateDateRange(
    truncTimeWithTz(new Date(from)),
    truncTimeWithTz(new Date(to))
  );
  return (
    <div className="table-container">
      <table>
        {days.map((day) => {
          const relevantSessions = mediaSessions
            .filter(({ start }) =>
              areDatesEqual(truncTimeWithTz(new Date(start)), day)
            )
            .filter(({ start, end }) => end - start > 0);

          return relevantSessions.length > 0 ? (
            <MediaUsageTableBlock
              day={day.valueOf()}
              mediaSessions={relevantSessions}
            />
          ) : null;
        })}
      </table>
    </div>
  );
}
