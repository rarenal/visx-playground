import { AxisScale, Orientation, SharedAxisProps } from '@visx/axis';
import { curveMonotoneX } from '@visx/curve';
import { LinearGradient } from '@visx/gradient';
import { AnimatedAxis, AnimatedGridColumns, AnimatedGridRows } from '@visx/react-spring';
import { coerceNumber, ScaleInput, scaleLinear, scaleTime, scaleUtc } from '@visx/scale';
import AreaClosed from '@visx/shape/lib/shapes/AreaClosed';
import { timeFormat } from 'd3-time-format';
import React, { useMemo } from 'react';
import { extent } from "d3-array";
import { GraphDatapoint } from '../../models';

const backgroundColor = "#da7cff";
const axisColor = "#fff";
const tickLabelColor = "#fff";
const labelColor = "#fff";
const gridColor = "#fff";
const margin = {
  top: 40,
  right: 150,
  bottom: 20,
  left: 50
};

const tickLabelProps = () =>
  ({
    fill: tickLabelColor,
    fontSize: 12,
    fontFamily: "sans-serif",
    textAnchor: "middle"
  } as const);

const getMinMax = (vals: (number | { valueOf(): number })[]) => {
  const numericVals = vals.map(coerceNumber);
  return [Math.min(...numericVals), Math.max(...numericVals)];
};

interface AxisProps {
  width: number;
  height: number;
  data: GraphDatapoint[];
}

export function AnimatedGraph({ width: outerWidth = 800, height: outerHeight = 800, data}: AxisProps) {
  // in svg, margin is subtracted from total width/height
  const width = outerWidth - margin.left - margin.right;
  const height = outerHeight - margin.top - margin.bottom;

  // define some types
  interface AxisDemoProps<Scale extends AxisScale>
    extends SharedAxisProps<Scale> {
    values: ScaleInput<Scale>[];
  }

  const timeValues = data.map((datapoint) => datapoint.timestamp);

  const axes: AxisDemoProps<AxisScale<number>>[] = useMemo(() => {
    return [
      {
        scale: scaleUtc({
          domain: getMinMax(timeValues),
          range: [0, width]
        }),
        tickFormat: timeFormat('%b %y'),
        values: timeValues,
        label: "time"
      }
    ];
  }, [width, timeValues]);

  const scalePadding = 40;
  const scaleHeight = height / axes.length - scalePadding;

  const [minX, maxX] = extent(timeValues);
  const [, maxY] = extent(data.map((item) => item.value));

  const xScale = scaleTime({
    domain: [minX, maxX],
    range: [0, width]
  });

  const yScale = scaleLinear({
    domain: [0, maxY],
    range: [scaleHeight, 0]
  });

  return (
    <div>
      <svg width={outerWidth} height={outerHeight}>
        <LinearGradient
          id="visx-axis-gradient"
          from={backgroundColor}
          to={backgroundColor}
          toOpacity={0.5}
        />
        <rect
          x={0}
          y={0}
          width={outerWidth}
          height={outerHeight}
          fill={"url(#visx-axis-gradient)"}
          rx={14}
        />
        <g transform={`translate(${margin.left},${margin.top})`}>
          {axes.map(({ scale, values, label, tickFormat }, i) => (
            <g
              key={`scale-${i}`}
              transform={`translate(0, ${i * (scaleHeight + scalePadding)})`}
            >
              <AnimatedGridRows
                key={`gridrows-center`}
                scale={yScale}
                stroke={gridColor}
                width={width}
                numTicks={6}
                animationTrajectory="center"
                lineStyle={{opacity: 0.4}}
              />
              <AnimatedGridColumns
                key={`gridcolumns-center`}
                scale={scale}
                stroke={gridColor}
                height={scaleHeight}
                numTicks={20}
                animationTrajectory="center"
                lineStyle={{opacity: 0.4}}
              />
              <AreaClosed
                data={data}
                x={(d) => xScale(d.timestamp)}
                y={(d) => yScale(d.value)}
                yScale={yScale}
                curve={curveMonotoneX}
                fill={gridColor}
                fillOpacity={0.6}
              />
              <AnimatedAxis
                // force remount when this changes to see the animation difference
                key={`axis-center`}
                orientation={Orientation.bottom}
                top={scaleHeight}
                scale={scale}
                tickFormat={tickFormat}
                stroke={axisColor}
                tickStroke={axisColor}
                tickLabelProps={tickLabelProps}
                tickValues={
                  label === "log" || label === "time" ? undefined : values
                }
                numTicks={label === "time" ? 6 : undefined}
                label={label}
                labelProps={{
                  x: width + 30,
                  y: -10,
                  fill: labelColor,
                  fontSize: 18,
                  strokeWidth: 0,
                  stroke: "#fff",
                  paintOrder: "stroke",
                  fontFamily: "sans-serif",
                  textAnchor: "start"
                }}
                animationTrajectory="center"
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
