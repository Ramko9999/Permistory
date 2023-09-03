import { MediaSession } from "../../../shared/interface";
import {
  truncTimeWithTz,
  getMonthDisplay,
  areDatesEqual,
  getHashedColor,
} from "../../util";
import {
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
  title: string;
}

function formatDateForChart(date: Date) {
  const current = new Date();
  if (current.getFullYear() === date.getFullYear()) {
    return `${getMonthDisplay(date)} ${date.getDate()}`;
  }
  return `${getMonthDisplay(date)} ${date.getDate()}, ${date.getFullYear()}`;
}

function getAllHosts(mediaSessions: MediaSession[]) {
  return Array.from(new Set(mediaSessions.map(({ host }) => host)));
}

function getChartData(from: Date, to: Date, mediaSessions: MediaSession[]) {
  let data = [];
  const allHosts = getAllHosts(mediaSessions);
  for (
    let currentDate = truncTimeWithTz(from);
    currentDate <= truncTimeWithTz(to);
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
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
    data.push({ ...point, day: formatDateForChart(currentDate) });
  }
  return data;
}

export function MediaUsageChart({
  from,
  to,
  mediaSessions,
  title,
}: MediaUsageChartProps) {
  const chartData = getChartData(new Date(from), new Date(to), mediaSessions);
  return (
    <BarChart
      width={800}
      height={600}
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
      <YAxis />
      <Tooltip />
      <Legend />
      {getAllHosts(mediaSessions).map((host) => (
        <Bar dataKey={host} stackId="stack" fill={getHashedColor(host)} />
      ))}
    </BarChart>
  );
}
