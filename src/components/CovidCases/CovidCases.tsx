import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { BrushChart } from '../Visualizations/BrushChart';
import { Graph, GraphDatapoint } from '../Visualizations/Graph';

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
  const [rawData, setRawData] = useState<GraphDatapoint[]>([]);
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

        setRawData(toGraphData(history));
      });
  }, [])

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
      </ToggleButtonGroup>
      {rawData && selectedVisualization === 'zoom' && <BrushChart rawData={rawData}/>}
      {rawData && selectedVisualization === 'animated' && <Graph data={rawData} width={1200} height={600}/>}
    </div>);
}