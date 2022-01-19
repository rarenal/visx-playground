import React from "react";

import { LinearGradient } from "@visx/gradient";
import { scaleOrdinal } from "@visx/scale";
import Pie from "@visx/shape/lib/shapes/Pie";
import { PieDatapoint } from "../../models";
import { Group } from "@visx/group";
import { Text } from "@visx/text";

interface PieChartProps {
  data: PieDatapoint[];
}

const GRADIENT_ID = "gradient";

const getValue = (pieData: PieDatapoint) => pieData.value;

export const PieChart = ({ data }: PieChartProps) => {
  const height = window.innerHeight,
    width = window.innerWidth;

  const getColorPalette = scaleOrdinal({
    domain: data.map((datapoint) => datapoint.category),
    range: [
      "rgba(93,30,91,1)",
      "rgba(93,30,91,0.8)",
      "rgba(93,30,91,0.6)",
      "rgba(93,30,91,0.4)",
    ],
  });
  const radius = Math.min(height, width) / 2;

  return (
    <svg width={width} height={height}>
      <LinearGradient id={GRADIENT_ID} from={"#2d6ee0"} to={"#de780a"} />
      <rect fill={`url(#${GRADIENT_ID})`} width={width} height={height} />
      <Group top={height / 2} left={width / 2}>
        <Pie
          data={data}
          pieValue={getValue}
          outerRadius={radius}
          pieSortValues={(a, b) => -1}
        >
          {(pie) => {
            return pie.arcs.map((arc, index) => {
              const { category } = arc.data;
              const [centroidX, centroidY] = pie.path.centroid(arc);
              const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;
              const arcPath = pie.path(arc)!;
              const arcFill = getColorPalette(category);
              console.log(arc);

              return (
                <g key={`arc-${category}-${index}`}>
                  <path d={arcPath} fill={arcFill} />
                  {hasSpaceForLabel && (
                    <Text
                      x={centroidX}
                      y={centroidY}
                      dy=".33em"
                      fill="#ffffff"
                      fontSize={22}
                      textAnchor="middle"
                      pointerEvents="none"
                      angle={
                        ((arc.startAngle + arc.endAngle) / 2) *
                          (180 / Math.PI) -
                        90
                      }
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
