import React, { useState } from "react";
import "./home.css";
import { MediaUsageChart } from "../media/usage-chart";
import { truncTimeWithTz } from "../../util";
import { Permission } from "../../../shared/interface";
import { useMediaSessions } from "../../hooks/use-media-session";
import { MediaUsageTable } from "../media/usage-table";


function createDateRangeFromNow(daysInThePast: number) {
  const from = new Date();
  from.setDate(from.getDate() - daysInThePast);
  const to = new Date();
  // have to do this, or run into a weird infinite render problem where `to` keeps changing
  to.setSeconds(0, 0);
  return { from: truncTimeWithTz(from), to: to };
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
        <div className="stat-container chart-container">
          <div className="stat-label">Daily Microphone Usage</div>
          <MediaUsageChart
            from={from.valueOf()}
            to={to.valueOf()}
            mediaSessions={mediaSessions}
          />
          <MediaUsageTable
            from={from.valueOf()}
            to={to.valueOf()}
            mediaSessions={mediaSessions}
          />
        </div>
      </div>
    </>
  );
}

export default Home;