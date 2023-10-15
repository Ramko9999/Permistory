import React, { useState, useContext, useEffect } from "react";
import { createDateRangeFromNow } from "../../util";
import { Permission } from "../../../shared/interface";
import { AudioDashboard, VideoDashboard } from "../media";
import { usePeriod } from "../../hooks/use-period";
import { PermissionSelect } from "../filter/permission-select";
import { DatePeriodPicker } from "../filter/date-period-select";
import * as Icon from "react-feather";
import { applyTheme, Theme } from "../../util/theme";
import "./home.css";
import { SettingsContext } from "../../context/settings";

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

function Home() {
  const { from: initialFrom, to: initialTo } = createDateRangeFromNow(6);
  const { period, setFrom, setTo } = usePeriod({ initialTo, initialFrom });
  const [permission, setPermission] = useState<Permission>(Permission.AUDIO);
  const { settings, persistSettings } = useContext(SettingsContext);
  const { isDarkMode } = settings;
  const { from, to } = period;

  useEffect(() => {
    if (isDarkMode) {
      applyTheme(Theme.DARK);
    } else {
      applyTheme(Theme.LIGHT);
    }
  }, [isDarkMode]);

  return (
    <>
      <div className="container">
        <div className="menu-container">
          <div className="filters-container">
            <PermissionSelect
              permission={permission}
              onSelectPermission={setPermission}
            />
            <DatePeriodPicker
              from={from}
              to={to}
              onSelectFrom={setFrom}
              onSelectTo={setTo}
            />
          </div>
          <div className="nav-container">
            <a>
              {isDarkMode ? (
                <Icon.Sun
                  onClick={() =>
                    persistSettings({ ...settings, isDarkMode: false })
                  }
                  className="icon"
                />
              ) : (
                <Icon.Moon
                  onClick={() =>
                    persistSettings({ ...settings, isDarkMode: true })
                  }
                  className="icon"
                />
              )}
            </a>
            <a href="https://github.com/TanushN/permistory">
              <Icon.GitHub />
            </a>
          </div>
        </div>
        <Dashboard from={from} to={to} permission={permission} />
      </div>
    </>
  );
}

export default Home;
