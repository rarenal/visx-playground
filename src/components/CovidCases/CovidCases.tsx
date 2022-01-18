import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { GraphDatapoint, PieDatapoint } from '../../models';
import { BrushChart } from '../Visualizations/BrushChart';
import { AnimatedGraph } from '../Visualizations/AnimatedGraph';
import { MarkersChart } from '../Visualizations/MarkersChart';
import { PieChart } from '../Visualizations/PieChart';

interface CovidHistory {
  dates: string[];
  cases: number[];
}

const toGraphData = (history: CovidHistory): GraphDatapoint[] => {
  return history.dates.map((date, index) => ({
    timestamp: new Date(date),
    value: history.cases[index],
  }));
}

export const CovidCases = () => {
  const [graphData, setGraphData] = useState<GraphDatapoint[]>([]);
  const [pieData, setPieData] = useState<PieDatapoint[]>([]);
  const [selectedVisualization, setSelectedVisualization] = useState<string>('zoom');

  useEffect(() => {
    fetch('https://covid-api.mmediagroup.fr/v1/history?status=confirmed&country=Spain')
      .then((res) => res.json())
      .then((response) => {
        const history: CovidHistory = {dates: [], cases: []};
        Object.keys(response['All'].dates).forEach((date) => {
          history.dates.push(date);
          history.cases.push(response['All'].dates[date]);
        })

        setGraphData(toGraphData(history));
      });

    fetch('https://covid-api.mmediagroup.fr/v1/cases?continent=Europe')
      .then((res) => res.json())
      .then((response) => {
        const pieData: PieDatapoint[] = Object.entries(response).map(([key, value]: [string, any]) => {
          const cases = value['All'];

          return {
            category: key,
            value: cases.confirmed / cases.population * 100,
          }
        });
        setPieData(pieData);
      });
  }, []);

  const handleChange = (_, newVisualization) => {
    setSelectedVisualization(newVisualization);
  };

  return (
    <div style={{display: 'grid', gap: '10px'}}>
      <ToggleButtonGroup
        color="secondary"
        value={selectedVisualization}
        style={{justifyContent: 'center'}}
        exclusive
        onChange={handleChange}
      >
        <ToggleButton value="zoom">Zooming + Tooltip</ToggleButton>
        <ToggleButton value="animated">Animated grid & axes</ToggleButton>
        <ToggleButton value="marker">Markers</ToggleButton>
        <ToggleButton value="pie">Pie Chart</ToggleButton>
      </ToggleButtonGroup>
      {graphData && selectedVisualization === 'zoom' && <BrushChart rawData={graphData}/>}
      {graphData && selectedVisualization === 'animated' && <AnimatedGraph data={graphData} width={1200} height={600}/>}
      {graphData && selectedVisualization === 'marker' && <MarkersChart data={graphData}/>}
      {graphData && selectedVisualization === 'pie' && <PieChart data={pieData}/>}
    </div>);
}