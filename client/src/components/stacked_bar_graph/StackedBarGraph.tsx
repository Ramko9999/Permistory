import React from "react";
import { BarStack } from "@visx/shape";
import { SeriesPoint } from "@visx/shape/lib/types";
import { Group } from "@visx/group";
import { Grid } from "@visx/grid";
import { AxisBottom } from "@visx/axis";
import { scaleBand, scaleLinear, scaleOrdinal } from "@visx/scale";
import { timeParse, timeFormat } from "d3-time-format";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { Session } from "../../interfaces/Session";
import ColorHash from "../../services/ColorHash";
import { getTotalHoursFromMillis } from "../../utils/Time";
import { Device } from "../home/Home";

type TooltipData = {
  bar: SeriesPoint<any>;
  key: string;
  index: number;
  height: number;
  width: number;
  x: number;
  y: number;
  color: string;
};

export type BarStackProps = {
  width: number;
  height: number;
  data: Session[];
  margin?: { top: number; right: number; bottom: number; left: number };
  events?: boolean;
  range: number;
  permission: { name: string; type: Device };
};

const purple1 = "#6c5efb";
const purple2 = "#c998ff";
export const purple3 = "#a44afe";
const strokeColor = "var(--primary)";
export const background = "var(--section-bg)";
const defaultMargin = { top: 40, right: 0, bottom: 0, left: 0 };
const tooltipStyles = {
  ...defaultStyles,
  minWidth: 60,
  backgroundColor: "rgba(0,0,0,0.9)",
  color: "white",
};

const parseDate = timeParse("%Y-%m-%d");
const format = timeFormat("%b %d");
const formatDate = (date: string) => format(parseDate(date) as Date);

const getDate = (usageDataForDay: any) => usageDataForDay.date;

let tooltipTimeout: number;

const getAggregatedDataByDay = (data: Session[], range: number) => {
  const getDateAggregationFormat = (date: Date) => {
    const padDateComponent = (dateComp: number) => {
      if (dateComp < 10) {
        return "0" + dateComp;
      }
      return dateComp;
    };
    return `${date.getFullYear()}-${padDateComponent(
      date.getMonth() + 1
    )}-${padDateComponent(date.getDate())}`;
  };

  const hosts = new Set<string>();
  data.forEach(({ host }) => hosts.add(host));
  data = data.sort((a, b) => a.startingTimestamp - b.startingTimestamp);

  const dateUsage: any = {};

  const populateHosts = (formattedDate: string, hosts: Set<String>) => {
    if (!(formattedDate in dateUsage)) {
      const hostDurations: any = {};
      hosts.forEach((host) => {
        hostDurations[host as string] = 0;
      });
      dateUsage[formattedDate] = hostDurations;
    }
  };

  let minDay = new Date();
  minDay.setDate(minDay.getDate() - range);
  let maxDay = new Date();
  for (const { startingTimestamp, endingTimestamp, host, duration } of data) {
    const startDate = new Date(startingTimestamp);

    const endDate = new Date(endingTimestamp);

    if (startDate.getDate() !== endDate.getDate()) {
      const formattedStart = getDateAggregationFormat(startDate);
      const formattedEnd = getDateAggregationFormat(endDate);
      const startOfNewDay = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate(),
        0,
        0,
        0,
        0
      );

      populateHosts(formattedStart, hosts);
      populateHosts(formattedEnd, hosts);

      dateUsage[formattedStart][host] +=
        startOfNewDay.getTime() - startDate.getTime();
      dateUsage[formattedEnd][host] +=
        endDate.getTime() - startOfNewDay.getTime();
    } else {
      const formattedDay = getDateAggregationFormat(startDate);

      populateHosts(formattedDay, hosts);
      dateUsage[formattedDay][host] += duration;
    }
  }

  const usageDataForDay = [];
  while ((minDay as Date).getTime() <= (maxDay as Date).getTime()) {
    const formatMinDay = getDateAggregationFormat(minDay as Date);
    populateHosts(formatMinDay, hosts);
    usageDataForDay.push({ date: formatMinDay, ...dateUsage[formatMinDay] });
    (minDay as Date).setDate((minDay as Date).getDate() + 1);
  }

  const hostList: string[] = [];
  hosts.forEach((host) => {
    hostList.push(host);
  });

  let maxDuration = 0;
  usageDataForDay.forEach((usage: any) => {
    Object.keys(usage).forEach((host: string) => {
      if (hosts.has(host)) {
        maxDuration = Math.max(usage[host], maxDuration);
      }
    });
  });

  return {
    graphData: usageDataForDay,
    colorScale: getColorScale(hostList),
    minutesScale: getMinutesScale(maxDuration),
    dateScale: getDateScale(usageDataForDay),
    hosts: hostList,
  };
};

const getColorScale = (hosts: string[]) => {
  return scaleOrdinal<any, string>({
    domain: hosts,
    range: hosts.map(ColorHash.getRGBColor),
  });
};

const getMinutesScale = (maxRange: number) => {
  return scaleLinear<number>({
    domain: [0, maxRange],
    nice: true,
  });
};

const getDateScale = (usageDataForDay: any) => {
  return scaleBand<string>({
    domain: usageDataForDay.map((dayData: any) => dayData.date),
    padding: 0.2,
  });
};

export default function StackedBarGraph({
  width,
  height,
  data,
  events = false,
  margin = defaultMargin,
  permission,
  range,
}: BarStackProps) {
  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip<TooltipData>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    // TooltipInPortal is rendered in a separate child of <body /> and positioned
    // with page coordinates which should be updated on scroll. consider using
    // Tooltip or TooltipWithBounds if you don't need to render inside a Portal
    scroll: true,
  });

  if (width < 10) return null;
  // bounds
  const xMax = width;
  const yMax = height - margin.top - 100;

  const { graphData, dateScale, minutesScale, colorScale, hosts } =
    getAggregatedDataByDay(data, range);
  dateScale.rangeRound([0, xMax]);
  minutesScale.range([yMax, 0]);

  console.log("Render");
  return width < 10 ? null : (
    <div
      style={{
        position: "relative",
        backgroundColor: background,
        borderRadius: "3px",
        boxShadow:
          "0 0 #0000, 0 0 #0000, 0 1px 3px 0 rgba(0,0,0,0.1),0 1px 2px 0 rgba(0,0,0,0.06)",
      }}
    >
      <h2
        className="chart-title"
        style={{ paddingTop: "1rem", paddingLeft: "1rem" }}
      >
        {`Daily ${permission.name} Usage`}
      </h2>
      <svg ref={containerRef} width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill={background} />
        <Grid
          top={margin.top}
          left={margin.left}
          xScale={dateScale}
          yScale={minutesScale}
          width={xMax}
          height={yMax}
          stroke="black"
          strokeOpacity={0.1}
          xOffset={dateScale.bandwidth() / 2}
        />
        <Group top={margin.top}>
          <BarStack
            data={graphData}
            keys={hosts}
            x={getDate}
            xScale={dateScale}
            yScale={minutesScale}
            color={colorScale}
          >
            {(barStacks) =>
              barStacks.map((barStack) =>
                barStack.bars.map((bar) => (
                  <rect
                    key={`bar-stack-${barStack.index}-${bar.index}`}
                    x={bar.x}
                    y={bar.y}
                    height={bar.height}
                    width={bar.width}
                    fill={bar.color}
                    onMouseLeave={() => {
                      tooltipTimeout = window.setTimeout(() => {
                        hideTooltip();
                      }, 300);
                    }}
                    onMouseMove={(event) => {
                      if (tooltipTimeout) clearTimeout(tooltipTimeout);
                      // TooltipInPortal expects coordinates to be relative to containerRef
                      // localPoint returns coordinates relative to the nearest SVG, which
                      // is what containerRef is set to in this example.
                      const eventSvgCoords = localPoint(event);
                      const left = bar.x + bar.width / 2;
                      showTooltip({
                        tooltipData: bar,
                        tooltipTop: eventSvgCoords?.y,
                        tooltipLeft: left,
                      });
                    }}
                  />
                ))
              )
            }
          </BarStack>
        </Group>
        <AxisBottom
          top={yMax + margin.top}
          scale={dateScale}
          tickFormat={formatDate}
          stroke={strokeColor}
          tickStroke={strokeColor}
          tickLabelProps={() => ({
            fill: strokeColor,
            fontSize: 11,
            textAnchor: "middle",
          })}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: margin.top / 2 - 10,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          fontSize: "14px",
        }}
      ></div>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={tooltipStyles}
        >
          <div style={{ color: colorScale(tooltipData.key) }}>
            <strong>{tooltipData.key}</strong>
          </div>
          <div>
            {Math.floor(tooltipData.bar.data[tooltipData.key] / (1000 * 60))}{" "}
            mins
          </div>
          <div>
            <small>{formatDate(getDate(tooltipData.bar.data))}</small>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}
