import { Brush } from '@visx/brush';
import BaseBrush from '@visx/brush/lib/BaseBrush';
import { Bounds } from '@visx/brush/lib/types';
import { LinearGradient } from '@visx/gradient';
import { PatternLines } from '@visx/pattern';
import { scaleLinear, scaleTime } from '@visx/scale';
import { extent } from 'd3-array';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AreaChart } from './AreaChart';
import { GraphDatapoint } from './Graph';

const brushMargin = { top: 10, bottom: 15, left: 50, right: 20 };
const chartSeparation = 30;
const PATTERN_ID = 'brush_pattern';
const GRADIENT_ID = 'brush_gradient';
export const accentColor = '#f6acc8';
export const background = '#584153';
export const background2 = '#af8baf';
const selectedBrushStyle = {
  fill: `url(#${PATTERN_ID})`,
  stroke: 'white',
};

// accessors
const getDate = (d: GraphDatapoint) => d.timestamp;
const getValue = (d: GraphDatapoint) => d.value;

export const BrushChart = ({rawData}: {rawData: GraphDatapoint[]}) => {
  const [filteredData, setFilteredData] = useState<GraphDatapoint[]>(rawData);
  const brushRef = useRef<BaseBrush | null>(null);

  useEffect(() => {
    setFilteredData(rawData);
  }, [rawData]);

  const outerWidth = 1300, outerHeight = 600, margin = {
    top: 20,
    left: 65,
    bottom: 20,
    right: 20,
  }
  const height = outerHeight - margin.top - margin.bottom;
  const chartBottomMargin = chartSeparation + 10;
  const chartHeight = 0.8 * height - chartBottomMargin;
  const brushChartHeight = height - chartHeight - chartSeparation;

  const width = outerWidth - margin.left - margin.right
  const brushWidth = outerWidth - brushMargin.left - brushMargin.right;
  const brushHeight = brushChartHeight - brushMargin.top - brushMargin.bottom;

  const [xMin, xMax] = extent((filteredData ?? []).map((datapoint) => datapoint.timestamp));
  const [brushXMin, brushXMax] = extent(rawData.map((datapoint) => datapoint.timestamp));
  const [, yMax] = extent((filteredData ?? []).map((datapoint) => datapoint.value));
  const [, brushYMax] = extent(rawData.map((datapoint) => datapoint.value));

  const xScale = useMemo(() => scaleTime<number>({
    domain: [xMin, xMax],
    range: [0, width],
  }), [xMin, xMax, width]);

  const yScale = useMemo(() => scaleLinear<number>({
    domain: [0, yMax],
    range: [chartHeight, 0],
    nice: true,
  }), [yMax, chartHeight]);

  const brushXScale = useMemo(() => scaleTime<number>({
    domain: [brushXMin, brushXMax],
    range: [0, brushWidth],
  }), [brushXMin, brushXMax, brushWidth]);

  const brushYScale = useMemo(() => scaleLinear<number>({
    domain: [0, brushYMax],
    range: [brushHeight, 0],
    nice: true,
  }), [brushYMax, brushHeight]);

  const onBrushChange = (domain: Bounds | null) => {
    if (!domain) return;
    const {x0, x1, y0, y1} = domain;
    const newFilteredData = rawData.filter((point) => {
      const x = getDate(point).getTime();
      const y = getValue(point);

      return x > x0 && x < x1 && y > y0 && y < y1;
    });
    setFilteredData(newFilteredData);
  }

  return (
    <div>
      <svg width={outerWidth} height={outerHeight}>
        <LinearGradient id={GRADIENT_ID} from={background} to={background2} rotate={45} />
        <rect x={0} y={0} width={outerWidth} height={outerHeight} fill={`url(#${GRADIENT_ID})`} rx={14} />
        <AreaChart
          data={filteredData ?? []}
          gradientColor={background2}
          xScale={xScale}
          yScale={yScale}
          width={outerWidth}
          yMax={chartHeight}
          margin={{...margin, bottom: chartBottomMargin}}
        />
        <AreaChart
          hideBottomAxis
          hideLeftAxis
          top={chartHeight + chartBottomMargin + margin.top}
          data={rawData}
          gradientColor={background2}
          xScale={brushXScale}
          yScale={brushYScale}
          width={width}
          yMax={brushHeight}
          margin={brushMargin}>
          <PatternLines
            id={PATTERN_ID}
            height={8}
            width={8}
            stroke={accentColor}
            strokeWidth={1}
            orientation={['diagonal']}
          />
          <Brush
            xScale={brushXScale}
            yScale={brushYScale}
            width={brushWidth}
            height={brushHeight}
            handleSize={8}
            innerRef={brushRef}
            resizeTriggerAreas={['left', 'right']}
            brushDirection={'horizontal'}
            onChange={onBrushChange}
            onClick={() => setFilteredData(rawData)}
            selectedBoxStyle={selectedBrushStyle}
            useWindowMoveEvents
          />
        </AreaChart>
      </svg>
    </div>
  );
};