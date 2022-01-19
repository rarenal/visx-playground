import React, { useState, useEffect, useMemo } from "react";
import { LinearGradient } from "@visx/gradient";
import { scaleOrdinal } from "@visx/scale";
import Pie, { PieArcDatum } from "@visx/shape/lib/shapes/Pie";
import { PieDatapoint } from "../../models";
import { Group } from "@visx/group";
import { Text } from "@visx/text";
import { defaultStyles, TooltipWithBounds, useTooltip } from '@visx/tooltip';
import { formatCount, formatDate } from "../../utils/formatters";

interface PieChartProps {
  data: PieDatapoint[];
}

const GRADIENT_ID = "gradient";
const tooltipStyles = {
  ...defaultStyles,
  minWidth: 60,
  backgroundColor: 'rgba(0,0,0,0.9)',
  color: 'white',
};

const getValue = (pieData: PieDatapoint) => pieData.value;

export const PieChart = ({ data }: PieChartProps) => {
  const [sortedData, setSortedData] = useState(data);

  const {
      tooltipData,
      tooltipLeft = 0,
      tooltipTop = 0,
      tooltipOpen,
      showTooltip,
  } = useTooltip<{x: Date; y: number}>();

  const handleTooltip = (e, value) => {
    const x = e.clientX
    const y = e.clientY

    showTooltip({
      tooltipData: {
        x: new Date(),
        y: value,
      },
      tooltipLeft: x,
      tooltipTop: y,
    });
  };

  useEffect(() => {
    setSortedData(data.sort((a, b) => a.value - b.value));
  }, [data]);

  const height = window.innerHeight,
    width = window.innerWidth;

  const getColorPalette = useMemo(() =>
    scaleOrdinal({
      domain: sortedData.map((datapoint) => datapoint.category),
      range: sortedData.map(() => `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`),
    }),
    [sortedData]);
  const radius = Math.min(height, width) / 2;
  const getArcAngle = (arc: PieArcDatum<PieDatapoint>) =>
    ((arc.startAngle + arc.endAngle) / 2) * (180 / Math.PI);

  return (
    <>
      <svg width={width} height={height}>
        <LinearGradient id={GRADIENT_ID} from={"#2d6ee0"} to={"#de780a"} />
        <rect fill={`url(#${GRADIENT_ID})`} width={width} height={height} />
        <Group top={height / 2} left={width / 2}>
          <Pie
            data={sortedData}
            pieValue={getValue}
            outerRadius={radius}
            innerRadius={radius * 0.39}
            cornerRadius={3}
            padAngle={0.01}
          >
            {(pie) => {
              return pie.arcs.map((arc, index) => {
                const { category } = arc.data;
                const [centroidX, centroidY] = pie.path.centroid(arc);
                const arcPath = pie.path(arc)!;
                const arcFill = getColorPalette(category);

                return (
                  <g key={`arc-${category}-${index}`} onMouseMove={(e) => handleTooltip(e, arc.value)}>
                    <path d={arcPath} fill={arcFill} />
                    {getArcAngle(arc) > 180
                        ? (
                            <Text
                                x={centroidX}
                                y={centroidY}
                                dy=".33em"
                                fill="#ffffff"
                                fontSize={14}
                                textAnchor="middle"
                                pointerEvents="none"
                                angle={getArcAngle(arc)+90}
                            >
                                {arc.data.category}
                            </Text>
                        )
                        : (
                            <Text
                                x={centroidX}
                                y={centroidY}
                                dy=".33em"
                                fill="#ffffff"
                                fontSize={16}
                                textAnchor="middle"
                                pointerEvents="none"
                                angle={getArcAngle(arc)-90}
                            >
                                {arc.data.category}
                            </Text>
                        )
                    }
                  </g>
                );
              });
            }}
          </Pie>
        </Group>
      </svg>
      {tooltipData && tooltipOpen ? (
        <TooltipWithBounds key={Math.random()}
                           top={tooltipTop}
                           left={tooltipLeft}
                           style={tooltipStyles}
        >
          <p>{`Cases (%): ${formatCount(tooltipData.y)}`}</p>
        </TooltipWithBounds>
      ) : null}
    </>
  );
};

