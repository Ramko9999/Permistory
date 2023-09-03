import { useEffect, useState, useMemo } from "react";
import { Permission, MediaSession } from "../../shared/interface";
import { queryMediaSessions } from "../../shared/store";

export interface UseMediaSessionProps {
  mediaPermission: Permission; // VIDEO or AUDIO
  from: number; // unix millis
  to: number; // unix millis
}

enum RequestStatus {
  LOADING,
  SUCCESS,
  ERROR,
}

interface UseMediaSessionResult {
  status: RequestStatus;
  mediaSessions: MediaSession[];
}

export function useMediaSessions({
  mediaPermission,
  from,
  to,
}: UseMediaSessionProps): UseMediaSessionResult {
  const [status, setStatus] = useState<RequestStatus>(RequestStatus.LOADING);
  const [sessions, setSessions] = useState<MediaSession[]>([]);
  useEffect(() => {
    setStatus(RequestStatus.LOADING);
    queryMediaSessions(from, to)
      .then((sessions) => {
        setStatus(RequestStatus.SUCCESS);
        setSessions(
          sessions.filter(({ permission }) => permission === mediaPermission)
        );
      })
      .catch((error) => {
        console.error("Error fetching MediaSessions from the store", error);
        setStatus(RequestStatus.ERROR);
      });
  }, [from, to]);

  return {
    status,
    mediaSessions: sessions,
  };
}
