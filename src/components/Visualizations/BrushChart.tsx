import { Brush } from '@visx/brush';
import BaseBrush from '@visx/brush/lib/BaseBrush';
import { Bounds } from '@visx/brush/lib/types';
import { LinearGradient } from '@visx/gradient';
import { PatternLines } from '@visx/pattern';
import { scaleLinear, scaleTime } from '@visx/scale';
import { Line } from '@visx/shape';
import { defaultStyles, TooltipWithBounds, useTooltip } from '@visx/tooltip';
import { extent } from 'd3-array';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useChartInteraction } from '../../hooks/custom-hooks';
import { GraphDatapoint } from '../../models';
import { getDate, getValue } from '../../utils/accessors';
import { formatCount, formatDate } from '../../utils/formatters';
import { AreaChart } from './AreaChart';

// styling
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
const tooltipStyles = {
  ...defaultStyles,
  minWidth: 60,
  backgroundColor: 'rgba(0,0,0,0.9)',
  color: 'white',
};

export const BrushChart = ({rawData}: {rawData: GraphDatapoint[]}) => {
  // hooks
  const [filteredData, setFilteredData] = useState<GraphDatapoint[]>(rawData);
  const brushRef = useRef<BaseBrush | null>(null);
  const {
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
    tooltipOpen,
    showTooltip,
    hideTooltip
  } = useTooltip<{x: Date; y: number}>();

  useEffect(() => {
    // data needs to be ascending in order to have the bisector working
    const sortedData = rawData.sort((a, b) => +a.timestamp - +b.timestamp);
    setFilteredData(sortedData);
  }, [rawData]);

  // bounds
  const outerWidth = 1300, outerHeight = 600, margin = {
    top: 20,
    left: 65,
    bottom: 20,
    right: 20,
  };

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

  // scales definition
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

  // event handlers
  const onBrushChange = useCallback((domain: Bounds | null) => {
    if (!domain) return;
    const {x0, x1, y0, y1} = domain;
    const newFilteredData = rawData.filter((point) => {
      const x = getDate(point).getTime();
      const y = getValue(point);

      return x > x0 && x < x1 && y > y0 && y < y1;
    });
    setFilteredData(newFilteredData);
  }, [rawData]);

  const [handleMouseMove, handleMouseLeave] = useChartInteraction(
    width,
    margin,
    hideTooltip,
    showTooltip,
    xScale,
    yScale,
    filteredData,
  );

  return (
    <div style={{position: 'relative'}}>
      <svg width={outerWidth} height={outerHeight}>
        <LinearGradient id={GRADIENT_ID} from={background} to={background2} rotate={45} />
        <rect x={0} y={0} width={outerWidth} height={outerHeight} fill={`url(#${GRADIENT_ID})`} rx={14} onMouseMove={handleMouseMove} />
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
        {tooltipData && (
          <g>
            <Line
              from={{ x: tooltipLeft, y: margin.top }}
              to={{ x: tooltipLeft, y: chartHeight + 20 }}
              stroke={'#EDF2F7'}
              strokeWidth={2}
              pointerEvents="none"
              strokeDasharray="4,2"
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop + margin.top + 1}
              r={4}
              fill="black"
              fillOpacity={0.1}
              stroke="black"
              strokeOpacity={0.1}
              strokeWidth={2}
              pointerEvents="none"
            />
            <circle
              cx={tooltipLeft}
              cy={tooltipTop + margin.top}
              r={4}
              fill="rebeccapurple"
              stroke="white"
              strokeWidth={2}
              pointerEvents="none"
            />
          </g>
        )}
        <rect x={margin.left} y={margin.top} width={width} height={chartHeight} fill={'transparent'}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
        />
      </svg>
      {tooltipData && tooltipOpen ? (
        <TooltipWithBounds key={Math.random()}
                           top={tooltipTop}
                           left={tooltipLeft + 100}
                           style={tooltipStyles}
        >
          <p>{`Date: ${formatDate(tooltipData.x)}`}</p>
          <p>{`Cases: ${formatCount(tooltipData.y)}`}</p>
        </TooltipWithBounds>
      ) : null}
    </div>
  );
};