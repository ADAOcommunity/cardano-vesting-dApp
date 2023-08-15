import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';


export interface BeneficiaryCut {
    address: string;  // Identifier for the beneficiary
    amount: number;   // Amount of tokens held by the beneficiary
}

interface PieChartProps {
    data: BeneficiaryCut[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);

        // Set dimensions
        const width = 500;  // Increased width to accommodate the legend
        const height = 400;
        const radius = Math.min(width, height) / 2 - 50;  // Adjusting for the legend

        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.address))
            .range(d3.schemeCategory10);

        const pie = d3.pie<BeneficiaryCut>().value(d => d.amount);
        const arc = d3.arc<d3.PieArcDatum<BeneficiaryCut>>()
            .innerRadius(0)
            .outerRadius(radius);

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2 - 50}, ${height / 2})`);  // Adjusting for the legend

        const arcs = g.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", (d: d3.PieArcDatum<BeneficiaryCut>) => arc(d) as string)
            .attr("fill", (d: d3.PieArcDatum<BeneficiaryCut>) => color(d.data.address) as string);

        // Create legend
        const legend = svg.selectAll(".legend")
            .data(color.domain())
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(0,${i * 20})`);

        legend.append("rect")
            .attr("x", width - 80)
            .attr("y", 20)
            .attr("width", 10)
            .attr("height", 10)
            // @ts-ignore
            .style("fill", color);

        legend.append("text")
            .attr("x", width - 65)
            .attr("y", 25)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(d => d);

    }, [data]);

    return <svg ref={svgRef} width="500" height="400"></svg>;  // Adjusted width
};

export default PieChart;