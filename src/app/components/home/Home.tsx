import React, { useState } from "react";
import "./Home.css";
import { MediaUsageChart } from "../media/usage-chart";
import {
  getLastUsed,
  getTotalTime,
  getMessageFromMillis,
  truncTimeWithTz,
} from "../../util";
import { Permission } from "../../../shared/interface";
import { useMediaSessions } from "../../hooks/use-media-session";

type AggregatedMediaUsage = {
  host: string;
  usage: number;
};

function createDateRangeFromNow(daysInThePast: number) {
  const from = new Date();
  from.setDate(from.getDate() - daysInThePast);
  const to = new Date();
  // have to do this, or run into a weird infinite render problem where `to` keeps changing
  to.setSeconds(0, 0);
  return { from: truncTimeWithTz(from), to: to};
}

const ranges = [
  { name: "Last Week", range: 7 },
  { name: "Last Month", range: 30 },
];

function Home() {
  const [rangeIdx, setRangeIdx] = useState<number>(0);
  const { from, to } = createDateRangeFromNow(ranges[rangeIdx].range);

  const { status, mediaSessions } = useMediaSessions({
    from: from.valueOf(),
    to: to.valueOf(),
    mediaPermission: Permission.AUDIO,
  });

  const onRangeSwitchHandler = () => {
    if (rangeIdx === ranges.length - 1) {
      setRangeIdx(0);
    } else {
      setRangeIdx(rangeIdx + 1);
    }
  };

  if (mediaSessions.length === 0) {
    return <div> No data is available for this time period </div>;
  }

  const getAggregatedHostUsage = (): AggregatedMediaUsage[] => {
    let usageByHost: { [index: string]: number } = {};
    for (const { host, start, end } of mediaSessions) {
      if (!(host in usageByHost)) {
        usageByHost[host] = 0;
      }
      usageByHost[host] += end - start;
    }

    return Object.keys(usageByHost).map((host) => {
      return { host, usage: usageByHost[host] };
    });
  };
  
  return (
    <>
      <div className="container">
        <div className="menu-container">
          <h2>Analytics</h2>
          <div className="select-containers">
            <button>Microphone</button>
            <button onClick={onRangeSwitchHandler}>
              {ranges[rangeIdx].name}
            </button>
          </div>
        </div>
        <div className="stats">
          <div className="stat-container">
            <div className="stat-label">Last Used</div>
            <div className="stat">{getLastUsed(mediaSessions)}</div>
          </div>
          <div className="stat-container">
            <div className="stat-label">Total Hours Used</div>
            <div className="stat">{getTotalTime(mediaSessions)}</div>
          </div>
        </div>
        <div style={{ marginTop: "2rem" }}>
          <MediaUsageChart
            from={from.valueOf()}
            to={to.valueOf()}
            mediaSessions={mediaSessions}
            title="Total Usage"
          />
        </div>
        <div className="apps-list">
          <h2 className="chart-title">{`Total Microphone Usage`}</h2>
          <div className="app-row">
            <div>Website</div>
            <div>Time</div>
          </div>
          {getAggregatedHostUsage()
            .sort((a: any, b: any) => b.totalDuration - a.totalDuration)
            .map(({ host, usage }) => (
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
            ))}
        </div>
      </div>
    </>
  );
}

export default Home;
