export enum Permission {
  VIDEO = "video",
  AUDIO = "audio",
  LOCATION = "location",
}

export interface PermissionEvent {
  permission: Permission;
}

export enum MediaEventType {
  START = "start",
  TILL = "till",
}

export interface MediaEvent extends PermissionEvent {
  type: MediaEventType;
  session: string;
  sessionStart: number;
  host: string;
  timestamp: number;
}

export interface MediaSession {
  session: string;
  start: number;
  permission: Permission; // VIDEO or AUDIO
  host: string;
  end: number;
}

export interface LocationEvent extends PermissionEvent {
  host: string;
  timestamp: number;
}

export interface Settings {
  isDarkMode: boolean;
}
