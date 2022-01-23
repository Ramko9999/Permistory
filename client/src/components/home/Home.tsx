import React, { useState } from "react";
import { Session } from "../../interfaces/Session";
import "./Home.css";
import StackedBarGraph from "../stacked_bar_graph";
import ParentSize from '@visx/responsive/lib/components/ParentSize';

import mockData from "../../utils/mock";
import { getLastUsed, getTotalHours, getUnixToTime } from "../../utils/Time";

enum device {
  CAMERA = "VIDEO",
  MICROPHONE = "AUDIO",
  LOCATION = "LOCATION",
}

const permissions = [
  { name: "Camera", type: device.CAMERA },
  { name: "Microphone", type: device.MICROPHONE },
  { name: "Location", type: device.LOCATION },
];

const ranges = ["Last Week", "Last Month", "Last Year"];

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
              {getLastUsed(mockData)}{" "}
              <span className="last-used-tag"> ago </span>
            </div>
          </div>
          <div className="stat-container">
            <div className="stat-label">Total Hours Used</div>
            <div className="stat">{getTotalHours(mockData)}</div>
          </div>
        </div>

        <div style={{marginTop : "2rem"}}> 
        <ParentSize>{({ width, height }) => <StackedBarGraph width={width} height={400}/>}</ParentSize>
        </div>
        
        <div className="apps-list">
          <div className="app-row">
            <div>Website</div>
            <div>Hours</div>
          </div>
          {mockData.map((app) => (
            <div className="app-row" key={app.host}>
              <div> {app.host} </div>{" "}
              <div>{getUnixToTime(app.duration).hours}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;
