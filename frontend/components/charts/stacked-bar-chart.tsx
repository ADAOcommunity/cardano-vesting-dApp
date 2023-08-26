import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { tokenNameFromHex } from '@/utils/utils';

export type VestedAmount = {
    tokenName: string;
    amount: number;
};

export type Beneficiary = {
    beneficiaryName: string; // This can be an address or a name
    vestedAmounts: VestedAmount[];
};

export type OrganizationVesting = {
    orgName: string;
    beneficiaries: Beneficiary[];
};

interface Props {
    data: OrganizationVesting;
}

const OrganizationVestingChart: React.FC<Props> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    const uniqueTokens = Array.from(
        new Set(
            data.beneficiaries.flatMap(b =>
                b.vestedAmounts.map(v => v.tokenName)
            )
        )
    );

    const tokenTotals = uniqueTokens.map(tokenName => {
        const total = data.beneficiaries.reduce((sum, b) => {
            const vested = b.vestedAmounts.find(v => v.tokenName === tokenName);
            return sum + (vested ? vested.amount : 0);
        }, 0);
        return { tokenName, total };
    });

    useEffect(() => {
        if (svgRef.current) {
            const svg = d3.select(svgRef.current);
            svg
                .attr("class", "text-primary")  // Add this line

            // Dimensions
            const width = 800;
            const height = 400;
            const margin = { top: 20, right: 20, bottom: 30, left: 40 };

            const tokens = data.beneficiaries.flatMap(b => b.vestedAmounts.map(v => v.tokenName));
            const uniqueTokens = Array.from(new Set(tokens));

            const stack = d3.stack<Beneficiary, string>()
                .keys(uniqueTokens)
                .value((d, key) => {
                    const tokenVest = d.vestedAmounts.find(v => v.tokenName === key);
                    return tokenVest ? tokenVest.amount : 0;
                });

            const series = stack(data.beneficiaries);

            // Scales
            const xScale = d3.scaleBand()
                .domain(data.beneficiaries.map(b => b.beneficiaryName))
                .range([margin.left, width - margin.right])
                .padding(0.1);

            const yScale = d3.scaleLinear()
                .domain([0, d3.max(series, s => d3.max(s, d => d[1])) as number])
                .range([height - margin.bottom, margin.top]);

            const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(uniqueTokens);

            // Axes
            svg.append("g")
                .attr("transform", `translate(0,${height - margin.bottom})`)
                .call(d3.axisBottom(xScale));

            svg.append("g")
                .attr("transform", `translate(${margin.left},0)`)
                .call(d3.axisLeft(yScale));

            // Draw the bars
            svg.append("g")
                .selectAll("g")
                .data(series)
                .join("g")
                .attr("fill", d => colorScale(d.key))
                .selectAll("rect")
                .data(d => d)
                .join("rect")
                .attr("x", (d, i) => xScale(data.beneficiaries[i].beneficiaryName) as number)
                .attr("y", d => yScale(d[1]))
                .attr("height", d => yScale(d[0]) - yScale(d[1]))
                .attr("width", xScale.bandwidth());

            // Display totals in the top-right corner
            const legend = svg.append("g")
                .attr("font-family", "sans-serif")
                .attr("font-size", 13)
                .attr("text-anchor", "start")
                .selectAll("g")
                .data(tokenTotals)
                .enter().append("g")
                .attr("transform", (d, i) => `translate(${width - 150},${i * 20})`);

            legend.append("rect")
                .attr("x", 0)
                .attr("width", 15)
                .attr("height", 15)
                .attr("fill", d => colorScale(d.tokenName));

            legend.append("text")
                .attr("class", " fill-primary")  // Add this line
                // .style("fill", "white")
                .attr("x", 20)
                .attr("y", 10)
                .text(d => `${tokenNameFromHex(d.tokenName.slice(56))}: ${d.total}`);
        }

    }, [data]);

    return <svg ref={svgRef} width="800" height="400"></svg>;
};

export default OrganizationVestingChart;