import React from 'react';
import { PieDatapoint } from '../../models';

interface PieChartProps {
  data: PieDatapoint[];
}

export const PieChart = ({data}: PieChartProps) => {
  console.log(data);
  return (
    <div></div>
  );
};