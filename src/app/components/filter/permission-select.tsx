import { Permission } from "../../../shared/interface";
import "./filter.css";

interface PermissionSelectProps {
  permission: Permission;
  onSelectPermission: (p: Permission) => void;
}

function getPermissionDisplay(permission: Permission) {
  if (permission === Permission.AUDIO) {
    return "Microphone";
  }
  return "Camera";
}

export function PermissionSelect({
  permission,
  onSelectPermission,
}: PermissionSelectProps) {
  return (
    <select
      className="permission-select filter"
      onChange={(ev) => onSelectPermission(ev.target.value as Permission)}
    >
      <option
        value={Permission.AUDIO}
        selected={permission === Permission.AUDIO}
      >
        {getPermissionDisplay(Permission.AUDIO)}
      </option>
      <option
        value={Permission.VIDEO}
        selected={permission === Permission.VIDEO}
      >
        {getPermissionDisplay(Permission.VIDEO)}
      </option>
    </select>
  );
}
