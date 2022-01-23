import React from 'react';
import { BarStack } from '@visx/shape';
import { SeriesPoint } from '@visx/shape/lib/types';
import { Group } from '@visx/group';
import { Grid } from '@visx/grid';
import { AxisBottom } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { timeParse, timeFormat } from 'd3-time-format';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';
import { LegendOrdinal } from '@visx/legend';
import { localPoint } from '@visx/event';

interface dataPoint {
  date: string;
}

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
  margin?: { top: number; right: number; bottom: number; left: number };
  events?: boolean;
};

const purple1 = '#6c5efb';
const purple2 = '#c998ff';
export const purple3 = '#a44afe';
export const background = 'var(--section-bg)';
const defaultMargin = { top: 40, right: 0, bottom: 0, left: 0 };
const tooltipStyles = {
  ...defaultStyles,
  minWidth: 60,
  backgroundColor: 'rgba(0,0,0,0.9)',
  color: 'white',
};

let data: any = [
  {
    Google : "30",
    Amazon : "10",
    Facebook : "5",
    date : "2022-01-01"
  },
  {
    Google : "30",
    Amazon : "12",
    Facebook : "2",
    date : "2022-02-01"
  },
  {
    Google : "10",
    Amazon : "10",
    Facebook : "5",
    date : "2022-02-02"
  },
  {
    Google : "20",
    Amazon : "10",
    Facebook : "5",
    date : "2022-03-02"
  },
  {
    Google : "30",
    Amazon : "10",
    Facebook : "5",
    date : "2022-04-02"
  },
  {
    Google : "15",
    Amazon : "10",
    Facebook : "5",
    date : "2022-05-02"
  },
  {
    Google : "30",
    Amazon : "10",
    Facebook : "5",
    date : "2022-06-02"
  },
  {
    Google : "10",
    Amazon : "10",
    Facebook : "15",
    date : "2022-07-02"
  },
  {
    Google : "30",
    Amazon : "10",
    Facebook : "5",
    date : "2022-08-02"
  }
];

let keys: any = ["Google", "Amazon", "Facebook"];

let maxRange = 0;

for(let d of data){
  let temp = 0;
  for(let k of keys){
    temp += parseInt(d[k]);
  }

  if(temp > maxRange){
    maxRange = temp;
  }
}


const parseDate = timeParse('%Y-%m-%d');
const format = timeFormat('%b %d');
const formatDate = (date: string) => format(parseDate(date) as Date);

// accessors
const getDate = (d: dataPoint) => d.date;

// scales
const dateScale = scaleBand<string>({
  domain: data.map(getDate),
  padding: 0.2,
});

const minutesScale = scaleLinear<number>({
  domain: [0, maxRange],
  nice: true,
});

const colorScale = scaleOrdinal<any, string>({
  domain: keys,
  range: [purple1, purple2, purple3],
});

let tooltipTimeout: number;

export default function StackedBarGraph({
  width,
  height,
  events = false,
  margin = defaultMargin,
}: BarStackProps) {
  const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } =
    useTooltip<TooltipData>();

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

  dateScale.rangeRound([0, xMax]);
  minutesScale.range([yMax, 0]);


  return width < 10 ? null : (
    <div style={{ position: 'relative' }}>
      <svg ref={containerRef} width={width} height={height}>
        <rect x={0} y={0} width={width} height={height} fill={background} rx={14} />
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
            data={data}
            keys={keys}
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
                )),
              )
            }
          </BarStack>
        </Group>
        <AxisBottom
          top={yMax + margin.top}
          scale={dateScale}
          tickFormat={formatDate}
          stroke={purple3}
          tickStroke={purple3}
          tickLabelProps={() => ({
            fill: purple3,
            fontSize: 11,
            textAnchor: 'middle',
          })}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: margin.top / 2 - 10,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          fontSize: '14px',
        }}
      >
      </div>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal top={tooltipTop} left={tooltipLeft} style={tooltipStyles}>
          <div style={{ color: colorScale(tooltipData.key) }}>
            <strong>{tooltipData.key}</strong>
          </div>
          <div>{tooltipData.bar.data[tooltipData.key]}mins</div>
          <div>
            <small>{formatDate(getDate(tooltipData.bar.data))}</small>
          </div>
        </TooltipInPortal>
      )}
    </div>
  );
}
