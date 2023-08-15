///gantt chart -timeline of unlock

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export interface TokenUnlock {
  date: Date;
  amount: number;
  tokenName: string;
}

interface TokenUnlockChartProps {
  data: TokenUnlock[];
}

interface CumulativeDataEntry {
  date: Date;
  cumulativeAmount: number;
  amounts: number[];
  tokens: string[];
}

const TokenUnlockChart: React.FC<TokenUnlockChartProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Compute cumulative amounts for each date
  const cumulativeData = data.reduce((acc, curr) => {
    const lastEntry = acc.find(d => d.date.getTime() === curr.date.getTime());
    if (lastEntry) {
      lastEntry.cumulativeAmount += curr.amount;
      lastEntry.amounts.push(curr.amount);
      lastEntry.tokens.push(curr.tokenName);
    } else {
      acc.push({
        date: curr.date,
        cumulativeAmount: curr.amount,
        amounts: [curr.amount],
        tokens: [curr.tokenName],
      });
    }
    return acc;
  }, [] as CumulativeDataEntry[]);

  useEffect(() => {
    if (svgRef.current) {
      const svg = d3.select(svgRef.current);

      // Set dimensions
      const width = 800;
      const height = 400;
      const margin = { top: 20, right: 20, bottom: 30, left: 40 };

      // Scales
      const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.date) as [Date, Date])
        .nice()
        .range([margin.left, width - margin.right]);

      const yScale = d3.scaleLinear()
        .domain([0, d3.max(cumulativeData, d => d.cumulativeAmount) as number])
        .nice()
        .range([height - margin.bottom, margin.top]);

      const colorScale = d3.scaleOrdinal<string, string>()
        .domain(data.map(d => d.tokenName))
        .range(d3.schemeCategory10);  // This is an array of 10 categorical colors

      // Axes
      const xAxis = d3.axisBottom(xScale);
      const yAxis = d3.axisLeft(yScale);

      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis);

      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis);

      cumulativeData.forEach(dataEntry => {
        let yOffset = 0;

        dataEntry.amounts.forEach((amount, idx) => {
          const yPosition = yScale(dataEntry.cumulativeAmount - yOffset);
          const barHeight = yScale(0) - yScale(amount);

          svg.append("rect")
            .attr("x", xScale(dataEntry.date))
            .attr("y", yPosition)
            .attr("width", 10) // width of the bar, adjust as needed
            .attr("height", barHeight)
            .attr("fill", colorScale(dataEntry.tokens[idx]));

          yOffset += amount;
        });
      });


      // Append a group for the legend
      const legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(colorScale.domain().slice().reverse())
        .enter().append("g")
        .attr("transform", (d, i) => `translate(-20,${i * 20})`);

      // Draw colored rectangles for each token
      legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", colorScale);

      // Draw token names next to the rectangles
      legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(d => d);
    }
  }, [data]);

  return (
    <svg ref={svgRef} width="800" height="400"></svg>
  );
};

export default TokenUnlockChart;