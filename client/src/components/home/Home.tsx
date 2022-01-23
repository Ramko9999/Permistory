import React, { useState } from "react";
import { Session } from "../../interfaces/Session";
import "./Home.css";

const permissions = [
  { name: "Camera", type: "CAMERA" },
  { name: "Microphone", type: "MICROPHONE" },
  { name: "Location", type: "LOCATION" },
];
const ranges = ["Last Week", "Last Month", "Last Year"];


const getHostName = (url: string) => {
  return url.substring(8);
}

const apps = [
  { name: "https://amazon.com", duration: "4hrs" },
  { name: "htpps://web.skype.com", duration: "4hrs" },
  { name: "htpps://facebook.com", duration: "4hrs" },
  { name: "htpps://youtube.com", duration: "4hrs" },
  { name: "htpps://youtube.com", duration: "4hrs" },
  { name: "htpps://youtube.com", duration: "4hrs" },
  { name: "htpps://youtube.com", duration: "4hrs" },
  { name: "htpps://youtube.com", duration: "4hrs" },
  { name: "htpps://youtube.com", duration: "4hrs" },
  { name: "htpps://youtube.com", duration: "4hrs" },
  { name: "htpps://youtube.com", duration: "4hrs" },
  { name: "htpps://youtube.com", duration: "4hrs" },
  { name: "htpps://youtube.com", duration: "4hrs" },
];

const mockData = [
  {
    "host": "amazon.com",
    "startingTimestamp": "1642856400",
    "endingTimestamp": "1642857900",
    "duration": "1500",
    "session": "string",
    "device": "VIDEO"
  },
  {
    "host": "web.skype.com",
    "startingTimestamp": "1642852800",
    "endingTimestamp": "1642856400",
    "duration": "3600",
    "session": "string",
    "device": "VIDEO"
  },
  {
    "host": "amazon.com",
    "startingTimestamp": "1642852800",
    "endingTimestamp": "1642854300",
    "duration": "1500",
    "session": "string",
    "device": "AUDIO"
  }
];

enum device {
  CAMERA = "VIDEO",
  MICROPHONE = "AUDIO" 
};

const getLastUsed = (data: Session[]) => {
  let lastUsedTime = data[0].endingTimestamp;
  for (const session of data) {
    lastUsedTime = Math.max(lastUsedTime, session.endingTimestamp);
  }
  lastUsedTime = lastUsedTime - Date.now();

  return (lastUsedTime - Date.now());
}

function Home() {
  const [permissionIdx, setPermissionIdx] = useState<number>(0);
  const [rangeIdx, setRangeIdx] = useState<number>(0);

  const onPermissionSwitchHandler = () => {
    if (permissionIdx === permissions.length - 1) {
      setPermissionIdx(0);
    } else {
      setPermissionIdx(permissionIdx + 1);
    }
  };

  const onRangeSwitchHandler = () => {
    if (rangeIdx === ranges.length - 1) {
      setRangeIdx(0);
    } else {
      setRangeIdx(rangeIdx + 1);
    }
  };

  return (
    <>
      <div className="container">
        <div className="menu-container">
          <h2>Analytics</h2>
          <div className="select-containers">
            <button onClick={onPermissionSwitchHandler}>
              {permissions[permissionIdx].name}
            </button>
            <button onClick={onRangeSwitchHandler}>{ranges[rangeIdx]}</button>
          </div>
        </div>
        <div className="stats">
          <div className="stat-container">
            <div className="stat-label">Last Used</div>
            <div className="stat">
              4hrs <span className="last-used-tag"> ago </span>
            </div>
          </div>
          <div className="stat-container">
            <div className="stat-label">Total Hours Used</div>
            <div className="stat">1000</div>
          </div>
        </div>
        <div className="apps-list">
            <div className="app-row">
              <div>
                Website
              </div>
              <div>
                Hours
              </div>

            </div>
            {apps.map((app) => (
              <div className="app-row">
                <div> {getHostName(app.name)} </div> <div>{app.duration}</div>
              </div>
            ))}

        </div>
      </div>
    </>
  );
}

export default Home;
