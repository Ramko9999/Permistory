import React, { useEffect, useState } from "react";
import "./Home.css";
import StackedBarGraph from "../stacked_bar_graph";
import ParentSize from "@visx/responsive/lib/components/ParentSize";

import mockData from "../../utils/mock";
import {
  getLastUsed,
  getTotalTime,
  getTotalHoursFromMillis,
  getMessageFromMillis,
} from "../../utils/Time";
import { MediaSession } from "../../../shared/interface";
import { truncTime, removeDays } from "../../../shared/util";
import { getAudioUsage } from "../../services/MediaUsage";

export enum Device {
  CAMERA = "VIDEO",
  MICROPHONE = "AUDIO",
  LOCATION = "LOCATION",
}

type AggregatedMediaUsage = {
  host: string,
  usage: number
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

  const [data, setData] = useState<MediaSession[]>([]);

  useEffect(() => {
    // todo: fix this so that the user's date with their timezone is passed in instead of UTC dates
    const from = new Date(removeDays(truncTime(Date.now()), ranges[rangeIdx].range))
    getAudioUsage(from, new Date()).then((sessions) => {
      console.log("Queried MediaSessions: ", sessions);
      setData(sessions);
    })
  }, [permissionIdx, rangeIdx]);

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

  const getAggregatedHostUsage = (): AggregatedMediaUsage[] => {
    let usageByHost: {[index: string]: number} = {}
    for (const {host, start, end} of data) {
      if(!(host in usageByHost)){
        usageByHost[host] = 0;
      }
      usageByHost[host] += (end - start);
    }

    return Object.keys(usageByHost).map((host) => { return {host, usage: usageByHost[host]}});
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
        {permissionIdx != 2 ? (
          <div style={{ marginTop: "2rem" }}>
            <ParentSize>
              {({ width, height }) => (
                <StackedBarGraph
                  width={width}
                  height={400}
                  data={data}
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
            {getAggregatedHostUsage()
              .sort((a: any, b: any) => b.totalDuration - a.totalDuration)
              .map(
                ({host, usage}) => (
                  <div className="app-row" key={host}>
                    <div className="app-name">
                      <img
                        src={`https://${host}/favicon.ico`}
                        className="favicon"
                      />
                      <div> {host} </div>{" "}
                    </div>

                    <div>{getMessageFromMillis(usage)}</div>
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
