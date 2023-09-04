import { MediaSession } from "../../../shared/interface";
import {
  truncTimeWithTz,
  areDatesEqual,
  getHashedColor,
  formatDateForDashboard,
  generateDateRange,
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

interface MediaUsageChartProps {
  from: number;
  to: number;
  mediaSessions: MediaSession[];
}

function getAllHosts(mediaSessions: MediaSession[]) {
  return Array.from(new Set(mediaSessions.map(({ host }) => host)));
}

function getChartData(from: Date, to: Date, mediaSessions: MediaSession[]) {
  let data = [];
  const allHosts = getAllHosts(mediaSessions);
  const days = generateDateRange(truncTimeWithTz(from), truncTimeWithTz(to));
  for (const currentDate of days) {
    let point: any = {};
    // capture the mediaSessions which start on current day
    const sessions = mediaSessions.filter(({ start }) =>
      areDatesEqual(truncTimeWithTz(new Date(start)), currentDate)
    );
    allHosts.forEach((host) => (point[host] = 0));
    // aggregate the total usage per host per day in minutes
    sessions
      .map(({ host, end, start }) => {
        return { host, duration: Math.floor((end - start) / (1000 * 60)) }; // mins
      })
      .forEach(({ host, duration }) => (point[host] += duration));
    data.push({ ...point, day: formatDateForDashboard(currentDate) });
  }
  return data;
}

export function MediaUsageChart({
  from,
  to,
  mediaSessions,
}: MediaUsageChartProps) {
  const chartData = getChartData(new Date(from), new Date(to), mediaSessions);
  return (
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
          label={{ value: "Usage (mins)", angle: -90, position: "insideLeft" }}
        />
        <Tooltip />
        <Legend />
        {getAllHosts(mediaSessions).map((host) => (
          <Bar dataKey={host} stackId="stack" fill={getHashedColor(host)} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
