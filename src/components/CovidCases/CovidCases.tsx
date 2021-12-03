import React, { useEffect, useState } from 'react';
import Graph, { GraphData } from '../Graph/Graph';

interface CovidHistory {
  dates: string[];
  cases: number[];
}

function toGraphData(history: CovidHistory): GraphData {
  return {
    timestamps: history.dates,
    values: history.cases,
  }
}

export const CovidCases = () => {
  const [data, setData] = useState<CovidHistory | null>(null);

  useEffect(() => {
    fetch('https://covid-api.mmediagroup.fr/v1/history?status=confirmed&country=Spain')
      .then((res) => res.json())
      .then((response) => {
        const history: CovidHistory = {dates: [], cases: []};
        Object.keys(response['All'].dates).forEach((date) => {
          history.dates.push(date);
          history.cases.push(response['All'].dates[date]);
        })

        setData(history);
      });
  }, [])

  return (data && <Graph data={toGraphData(data)} width={1200} height={600}/>)
}