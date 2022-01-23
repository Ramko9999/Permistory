import React, { useEffect, useState } from "react";
import { Session } from "../../interfaces/Session";
import "./Home.css";
import StackedBarGraph from "../stacked_bar_graph";
import ParentSize from '@visx/responsive/lib/components/ParentSize';

import mockData from "../../utils/mock";
import { getLastUsed, getTotalHours, getTotalHoursFromMillis } from "../../utils/Time";
import UsageService from "../../services/Usage";

export enum Device {
  CAMERA = "VIDEO",
  MICROPHONE = "AUDIO",
  LOCATION = "LOCATION",
}

const permissions = [
  { name: "Camera", type: Device.CAMERA },
  { name: "Microphone", type: Device.MICROPHONE },
  { name: "Location", type: Device.LOCATION },
];

const ranges = ["Last Week", "Last Month", "Last Year"];

function Home() {
  const [permissionIdx, setPermissionIdx] = useState<number>(0);
  const [rangeIdx, setRangeIdx] = useState<number>(0);

  //const [data, setData] = useState<Session[]>(mockData);
  
  const [data, setData] = useState<Session[]>([]);
  
  useEffect(() => {
    UsageService.getUsageData(permissions[0].type).then(setData);
  }, [])

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

  if (data.length === 0) {
      return (<div> We haven't tracked your data yet </div>);
  }

  const getAggregatedHostUsage = (data: Session[]) => {
    const aggregatedMap = new Map();
    for(const session of data){
        if(!aggregatedMap.has(session.host)){
            aggregatedMap.set(session.host, 0);
        }
        aggregatedMap.set(session.host, session.duration + aggregatedMap.get(session.host));
    }

    let aggregatedDataByHost : any = [];
    aggregatedMap.forEach((totalDuration, host) => {
        aggregatedDataByHost.push({host, totalDuration});
    });

    return aggregatedDataByHost;
  }

  const displayHours = (hours : number) => {
      if (hours < 0) {
          return hours.toFixed(2).toString();
      }
      if (hours < 10){
        return hours.toFixed(1).toString();
      }

      return hours.toString();
  }
  
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
              {getLastUsed(data)}{" "}
              <span className="last-used-tag"> ago </span>
            </div>
          </div>
          <div className="stat-container">
            <div className="stat-label">Total Hours Used</div>
            <div className="stat">{displayHours(getTotalHours(data))}</div>
          </div>
        </div>

        <div style={{marginTop : "2rem"}}> 
        <ParentSize>{({ width, height }) => <StackedBarGraph width={width} height={400} data={data}/>}</ParentSize>
        </div>
        
        <div className="apps-list">
          <div className="app-row">
            <div>Website</div>
            <div>Hours</div>
          </div>
          {getAggregatedHostUsage(data).sort((a : any, b : any) => b.totalDuration - a.totalDuration).map(({host, totalDuration} : {host: string, totalDuration: number}) => (
            <div className="app-row" key={host}>
              <div> {host} </div>{" "}
              <div>{displayHours(getTotalHoursFromMillis(totalDuration))}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;
