import React, { useState, useEffect } from "react";
import { LinearGradient } from "@visx/gradient";
import { scaleOrdinal } from "@visx/scale";
import Pie, { PieArcDatum } from "@visx/shape/lib/shapes/Pie";
import { PieDatapoint } from "../../models";
import { Group } from "@visx/group";
import { Text } from "@visx/text";

interface PieChartProps {
  data: PieDatapoint[];
}

const GRADIENT_ID = "gradient";

const getValue = (pieData: PieDatapoint) => pieData.value;

export const PieChart = ({ data }: PieChartProps) => {
  const [sortedData, setSortedData] = useState(data);

  useEffect(() => {
    setSortedData(data.sort((a, b) => a.value - b.value));
  }, [data]);

  const height = window.innerHeight,
    width = window.innerWidth;

  const getColorPalette = scaleOrdinal({
    domain: sortedData.map((datapoint) => datapoint.category),
    range: sortedData.map(() => `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`),
  });
  const radius = Math.min(height, width) / 2;
  const getArcAngle = (arc: PieArcDatum<PieDatapoint>) =>
    ((arc.startAngle + arc.endAngle) / 2) * (180 / Math.PI) - 90;

  return (
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
              const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;
              const arcPath = pie.path(arc)!;
              const arcFill = getColorPalette(category);

              return (
                <g key={`arc-${category}-${index}`}>
                  <path d={arcPath} fill={arcFill} />
                  {hasSpaceForLabel && (
                    <Text
                      x={centroidX}
                      y={centroidY}
                      dy=".33em"
                      fill="#ffffff"
                      fontSize={16}
                      textAnchor="middle"
                      pointerEvents="none"
                      angle={getArcAngle(arc)}
                    >
                      {arc.data.category}
                    </Text>
                  )}
                </g>
              );
            });
          }}
        </Pie>
      </Group>
    </svg>
  );
};
