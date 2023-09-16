import { MediaSession } from "../../../shared/interface";
import {
  truncTimeWithTz,
  areDatesEqual,
  getHashedColor,
  formatDateForDashboard,
  generateDateRange,
  getTimePeriodDisplay,
} from "../../util";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

function getAllHosts(mediaSessions: MediaSession[]) {
  return Array.from(new Set(mediaSessions.map(({ host }) => host)));
}

function getChartData(from: Date, to: Date, mediaSessions: MediaSession[]) {
  let data = [];
  const days = generateDateRange(truncTimeWithTz(from), truncTimeWithTz(to));
  for (const currentDate of days) {
    let point: any = {};
    // capture the mediaSessions which start on current day
    const sessions = mediaSessions.filter(({ start }) =>
      areDatesEqual(truncTimeWithTz(new Date(start)), currentDate)
    );

    sessions
      .map(({ host, end, start }) => {
        return { host, duration: Math.floor(end - start) };
      })
      .forEach(({ host, duration }) => {
        if (!(host in point)) {
          point[host] = 0;
        }
        point[host] += duration;
      });
    data.push({ ...point, day: formatDateForDashboard(currentDate) });
  }
  return data;
}

function formatTooltipContent(value: string) {
  return getTimePeriodDisplay(parseInt(value));
}

function formatTicks(value: any, index: number) {
  // mins
  return Math.floor(parseInt(value) / (1000 * 60)).toString();
}


interface MediaUsageChartProps {
  from: number;
  to: number;
  mediaSessions: MediaSession[];
}


export function MediaUsageChart({
  from,
  to,
  mediaSessions,
}: MediaUsageChartProps) {
  const chartData = getChartData(new Date(from), new Date(to), mediaSessions);
  return (
    <div className="media-chart">
      {mediaSessions.length === 0 ? (
        <div className="media-chart-overlay">
          No recorded usage data for this time period
        </div>
      ) : null}
      <ResponsiveContainer height={300} width="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis
            label={{
              value: "Usage (mins)",
              angle: -90,
              position: "insideLeft",
            }}
            tickFormatter={formatTicks}
          />
          <Tooltip formatter={formatTooltipContent} />
          <Legend />
          {getAllHosts(mediaSessions).map((host) => (
            <Bar dataKey={host} stackId="stack" fill={getHashedColor(host)} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
