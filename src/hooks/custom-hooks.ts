import { AxisScale } from '@visx/axis';
import { localPoint } from '@visx/event';
import { scaleLinear, scaleTime } from '@visx/scale';
import { extent } from 'd3-array';
import { useCallback, useMemo } from 'react';
import { GraphDatapoint, Margin } from '../models';
import { bisectDate, getDate, getValue } from '../utils/accessors';

export const useChart = (
  outerWidth: number,
  outerHeight: number,
  margin: Margin,
  data: GraphDatapoint[]
): [AxisScale<number>, AxisScale<number>, number, number] => {
  const height = outerHeight - margin.top - margin.bottom;
  const width = outerWidth - margin.left - margin.right;

  const [xMin, xMax] = extent((data).map(getDate));
  const [, yMax] = extent((data).map(getValue));

  const xScale = useMemo(() => scaleTime<number>({
    domain: [xMin, xMax],
    range: [0, width],
  }), [xMin, xMax, width]);

  const yScale = useMemo(() => scaleLinear<number>({
    domain: [0, yMax],
    range: [height, 0],
    nice: true,
  }), [yMax, height]);

  return [xScale, yScale, height, width];
}

export const useChartInteraction = (
  width: number,
  margin: Margin,
  hideTooltip: () => void,
  showTooltip: (obj: any) => void,
  xScale: AxisScale<number>,
  yScale: AxisScale<number>,
  data: GraphDatapoint[],
) => {
  const handleMouseMove = useCallback((event) => {
    const { x } = localPoint(event) || { x: 0 };
    if (x < margin.left || x > width + margin.left) {
      hideTooltip();
      return;
    }

    const x0: Date = (xScale as any).invert(x - margin.left);
    const index = bisectDate(data, x0);

    const prevValue = data[index - 1];
    const nextValue = data[index];

    let value = prevValue;

    if (!prevValue && !nextValue) {
      hideTooltip();
      return;
    } else if (!prevValue) {
      value = nextValue
    } else if (!nextValue) {
      value = prevValue
    } else {
      value = x0.getTime() - +getDate(prevValue) > x0.getTime() - +getDate(nextValue) ? nextValue : prevValue;
    }

    showTooltip({
      tooltipData: {
        x: x0,
        y: getValue(value),
      },
      tooltipLeft: x,
      tooltipTop: yScale(getValue(value)),
    });
  }, [data, hideTooltip, margin.left, showTooltip, width, xScale, yScale]);

  const handleMouseLeave = useCallback(() => {
    hideTooltip();
  },[hideTooltip]);

  return [handleMouseMove, handleMouseLeave];
}