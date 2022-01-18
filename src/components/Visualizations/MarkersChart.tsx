import { Annotation, Label, LineSubject } from '@visx/annotation';
import { LinearGradient } from '@visx/gradient';
import { Line } from '@visx/shape';
import { defaultStyles, TooltipWithBounds, useTooltip } from '@visx/tooltip';
import React from 'react';
import { useChart, useChartInteraction } from '../../hooks/custom-hooks';
import { GraphDatapoint } from '../../models';
import { formatCount, formatDate, toOrdinal } from '../../utils/formatters';
import { AreaChart } from './AreaChart';

interface MarkersChartProps {
  data: GraphDatapoint[];
}

const background = '#051d42';
const background2 = '#4b8ac9';
const GRADIENT_ID = 'brush_gradient';
const tooltipStyles = {
  ...defaultStyles,
  minWidth: 60,
  backgroundColor: 'rgba(0,0,0,0.9)',
  color: 'white',
};

export const MarkersChart = ({data}: MarkersChartProps) => {
  const outerWidth = 1300, outerHeight = 600, margin = {top: 40, left: 65, bottom: 40, right: 20};
  const [xScale, yScale, height, width] = useChart(outerWidth, outerHeight, margin, data);
  const {
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
    tooltipOpen,
    showTooltip,
    hideTooltip
  } = useTooltip<{x: Date; y: number}>();
  const [handleMouseMove, handleMouseLeave] = useChartInteraction(
    width,
    margin,
    hideTooltip,
    showTooltip,
    xScale,
    yScale,
    data,
  );
  const markers = [
    new Date('3/10/2020'),
    new Date('9/15/2020'),
    new Date('1/10/2021'),
    new Date('3/20/2021'),
    new Date('7/20/2021'),
    new Date('12/1/2021'),
  ]

  return (
    <div style={{position: 'relative'}}>
      <svg width={outerWidth} height={outerHeight}>
        <LinearGradient id={GRADIENT_ID} from={background} to={background2} rotate={45} />
        <rect x={0} y={0} width={outerWidth} height={outerHeight} fill={`url(#${GRADIENT_ID})`} rx={14} onMouseMove={handleMouseMove} />
        <AreaChart
          data={data}
          gradientColor={background2}
          xScale={xScale}
          yScale={yScale}
          width={width}
          yMax={height}
          margin={margin}
        />
        {tooltipData && (
          <g>
            <Line
              from={{ x: tooltipLeft, y: margin.top }}
              to={{ x: tooltipLeft, y: height + margin.top }}
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
        <g>
          {markers.map((mark, index) =>
            (
              <g key={`group-${index}`}>
                <Annotation
                  key={`annotation-${index}`}
                  x={((xScale(mark) ?? 0) + margin.left)}
                  y={margin.top}
                  dx={0}
                  dy={1}>
                  <LineSubject
                    key={`line-${index}`}
                    orientation={'vertical'}
                    stroke={'#9d5ce2'}
                    min={margin.top}
                    max={height + margin.top}
                    strokeDasharray={8}
                  />
                  <Label title={`${toOrdinal(index + 1)} wave`}
                         key={`label-${index}`}
                         backgroundFill={'#9d5ce2'}
                         width={74}
                         titleFontSize={12}/>
                </Annotation>
              </g>
            ))}
        </g>
        <rect x={margin.left} y={margin.top} width={width} height={height} fill={'transparent'}
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