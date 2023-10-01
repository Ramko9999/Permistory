import { Permission } from "../../../shared/interface";
import { useMediaSessions } from "../../hooks/use-media-session";
import { MediaChart } from "./chart";
import { MediaTable } from "./table";
import "./media.css";
import { addDays } from "../../../shared/util";

interface MediaDashboardProps {
  from: number;
  to: number;
  permission: Permission.AUDIO | Permission.VIDEO;
}

function getTitle(permission: Permission.AUDIO | Permission.VIDEO) {
  if (permission === Permission.AUDIO) {
    return "Microphone Usage";
  }
  return "Camera Usage";
}

function MediaDashboard({ from, to, permission }: MediaDashboardProps) {
  // Need to fetch information about the sessions that occured ON date 'to' as well. Hence why to: addDays(to, 1)
  // The 1 can be replaced by the time bucket: hour, day, month, if there exists one in the future
  const { status, mediaSessions } = useMediaSessions({
    from: from,
    to: addDays(to, 1),
    mediaPermission: permission,
  });

  return (
    <div className="media-dashboard">
      <div className="media-dashboard-title">{getTitle(permission)}</div>
      <MediaChart from={from} to={to} mediaSessions={mediaSessions} />
      <MediaTable from={from} to={to} mediaSessions={mediaSessions} />
    </div>
  );
}

interface AudioDashboardProps {
  from: number;
  to: number;
}

export function AudioDashboard({ from, to }: AudioDashboardProps) {
  return <MediaDashboard from={from} to={to} permission={Permission.AUDIO} />;
}

interface VideoDashboardProps {
  from: number;
  to: number;
}

export function VideoDashboard({ from, to }: VideoDashboardProps) {
  return <MediaDashboard from={from} to={to} permission={Permission.VIDEO} />;
}
