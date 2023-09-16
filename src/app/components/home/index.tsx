import React, { useState } from "react";
import { truncTimeWithTz } from "../../util";
import { Permission } from "../../../shared/interface";
import { AudioDashboard, VideoDashboard } from "../media";
import { usePeriod } from "../../hooks/use-period";
import "./home.css";
import { PermissionSelect } from "../filter/permission-select";
import { DatePeriodSelect } from "../filter/date-period-select";

interface DashboardProps {
  from: number;
  to: number;
  permission: Permission;
}

function Dashboard({ from, to, permission }: DashboardProps) {
  switch (permission) {
    case Permission.AUDIO:
      return <AudioDashboard from={from} to={to} />;
    default:
      return <VideoDashboard from={from} to={to} />;
  }
}

function createDateRangeFromNow(daysInThePast: number) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - daysInThePast);
  const toDate = new Date();
  // have to do this, or run into a weird infinite render problem where `to` keeps changing
  toDate.setSeconds(0, 0);
  return { from: truncTimeWithTz(fromDate).valueOf(), to: toDate.valueOf() };
}

function Home() {
  const {from: initialFrom, to: initialTo} = createDateRangeFromNow(7);
  const { period, setFrom, setTo } = usePeriod({initialTo, initialFrom});
  const [permission, setPermission] = useState<Permission>(Permission.AUDIO);
  const { from, to } = period;

  return (
    <>
      <div className="container">
        <div className="menu-container">
          <h2>Analytics</h2>
          <div className="select-containers">
            <PermissionSelect permission={permission} onSelectPermission={setPermission}/>
            <DatePeriodSelect from={from} to={to} onSelectFrom={setFrom} onSelectTo={setTo}/>
          </div>
        </div>
        <Dashboard from={from} to={to} permission={permission} />
      </div>
    </>
  );
}

export default Home;
