import React, { useEffect, useState } from "react";
import { Session } from "../../interfaces/Session";
import "./Home.css";
import StackedBarGraph from "../stacked_bar_graph";
import PieChart from "../pie_chart";
import ParentSize from "@visx/responsive/lib/components/ParentSize";

import mockData from "../../utils/mock";
import {
  getLastUsed,
  getTotalTime,
  getTotalHoursFromMillis,
  getMessageFromMillis,
} from "../../utils/Time";
import UsageService from "../../services/Usage";

export enum Device {
  CAMERA = "VIDEO",
  MICROPHONE = "AUDIO",
  LOCATION = "LOCATION",
}

let location_data = [
  { host: "google.com", count: 10 },
  { host: "amazon.com", count: 30 },
  { host: "facebook.com", count: 10 },
  { host: "twitch.com", count: 5 },
  { host: "ebay.com", count: 15 },
];

const permissions = [
  { name: "Camera", type: Device.CAMERA },
  { name: "Microphone", type: Device.MICROPHONE },
  { name: "Location", type: Device.LOCATION },
];

const ranges = [
  { name: "Last Week", range: 7 },
  { name: "Last Month", range: 30 },
];

function Home() {
  const [permissionIdx, setPermissionIdx] = useState<number>(0);
  const [rangeIdx, setRangeIdx] = useState<number>(0);

  const [data, setData] = useState<Session[]>(mockData);

  //const [data, setData] = useState<Session[]>([]);

  useEffect(() => {
    UsageService.getUsageData(permissions[permissionIdx].type).then(
      (newData) => {
        setData((prevData) => [...prevData, ...newData]);
      }
    );
  }, [permissionIdx]);

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
    return <div> We haven't tracked your data yet </div>;
  }

  const getAggregatedHostUsage = (data: Session[], deviceType: Device) => {
    const aggregatedMap = new Map();
    for (const session of data) {
      if (session.device === deviceType) {
        if (!aggregatedMap.has(session.host)) {
          aggregatedMap.set(session.host, 0);
        }
        aggregatedMap.set(
          session.host,
          session.duration + aggregatedMap.get(session.host)
        );
      }
    }

    let aggregatedDataByHost: any = [];
    aggregatedMap.forEach((totalDuration, host) => {
      aggregatedDataByHost.push({ host, totalDuration });
    });

    return aggregatedDataByHost;
  };

  const displayHours = (hours: number) => {
    if (hours < 0) {
      return hours.toFixed(2).toString();
    }
    if (hours < 10) {
      return hours.toFixed(1).toString();
    }

    return hours.toString();
  };

  const filterData = () => {
    const filteredData = [];
    for (const session of data) {
      if (session.device === permissions[permissionIdx].type) {
        filteredData.push(session);
      }
    }
    return filteredData;
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
            <button onClick={onRangeSwitchHandler}>
              {ranges[rangeIdx].name}
            </button>
          </div>
        </div>
        <div className="stats">
          <div className="stat-container">
            <div className="stat-label">Last Used</div>
            <div className="stat">
              {permissionIdx == 2
                ? "4 hrs ago"
                : getLastUsed(data, permissions[permissionIdx].type)}
            </div>
          </div>
          <div className="stat-container">
            <div className="stat-label">
              {permissionIdx == 2 ? "Total Location Intents" : "Total Hours Used"}
            </div>
            <div className="stat">
              {permissionIdx == 2
                ? "70"
                : getTotalTime(data, permissions[permissionIdx].type)}
            </div>
          </div>
        </div>

        {permissionIdx == 2 ? (
          <div className="location-container">
            <h2 className="chart-title">Location Hits</h2>
            <div className="location-chart-parent">
              <PieChart locationData={location_data} />
            </div>
          </div>
        ) : null}

        {permissionIdx != 2 ? (
          <div style={{ marginTop: "2rem" }}>
            <ParentSize>
              {({ width, height }) => (
                <StackedBarGraph
                  width={width}
                  height={400}
                  data={filterData()}
                  range={ranges[rangeIdx].range}
                  permission={permissions[permissionIdx]}
                />
              )}
            </ParentSize>
          </div>
        ) : null}
        {permissionIdx !== 2 && (
          <div className="apps-list">
          <h2 className="chart-title">
            {`Total ${permissions[permissionIdx].name} Usage`}
            </h2>            
            <div className="app-row">
              <div>Website</div>
              <div>Time</div>
            </div>
            {getAggregatedHostUsage(data, permissions[permissionIdx].type)
              .sort((a: any, b: any) => b.totalDuration - a.totalDuration)
              .map(
                ({
                  host,
                  totalDuration,
                }: {
                  host: string;
                  totalDuration: number;
                }) => (
                  <div className="app-row" key={host}>
                    <div className="app-name">
                      <img
                        src={`https://${host}/favicon.ico`}
                        className="favicon"
                      />
                      <div> {host} </div>{" "}
                    </div>

                    <div>{getMessageFromMillis(totalDuration)}</div>
                  </div>
                )
              )}
          </div>
        )}
      </div>
    </>
  );
}

export default Home;
