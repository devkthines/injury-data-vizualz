import * as d3 from 'd3';
import { useState, useEffect, useRef } from 'react';

const D3BarChart = ({ data }) => {
  const [selectedPartOfBody, setSelectedPartOfBody] = useState(null);
  const [detailedPartOfBodyData, setDetailedPartOfBodyData] = useState([]);
  const [detailedFilters, setDetailedFilters] = useState([]);
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clear previous content

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 120, bottom: 40, left: 40 };

    const x = d3.scaleBand().range([margin.left, width - margin.right]).padding(0.1);
    const y = d3.scaleLinear().range([height - margin.bottom, margin.top]);

    // Filter the data to only include 'Part of Body'
    const partOfBodyData = data.filter(item => item.category === 'Part of Body');

    x.domain(partOfBodyData.map(d => d.label));
    y.domain([0, d3.max(partOfBodyData, d => d.value)]);

    const svg_g = svg.append("g");

    svg_g.selectAll(".bar")
      .data(partOfBodyData)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.label))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => y(0) - y(d.value))
      .attr("fill", "green")
      .on("mouseover", function(event, d) {
        // Show tooltip with full label
        tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip.html(d.label)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function(event, d) {
        // Hide tooltip
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      })
      .on("click", function(event, d) {
        setSelectedPartOfBody(d.label);
        updateDetailedPartOfBodyData(data, d.label);
      });

    // Create legend
    const legend = svg_g.append("g")
      .attr("transform", `translate(${width - margin.right},${margin.top})`);

    legend.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 100)
      .attr("height", 50)
      .attr("fill", "white")
      .attr("stroke", "black");

    legend.append("text")
      .attr("x", 10)
      .attr("y", 20)
      .text("Part of Body");

    svg_g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "10px");

    svg_g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Create tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "d3-tooltip")
      .style("opacity", 0);

    if (selectedPartOfBody) {
      updateDetailedPartOfBodyData(data, selectedPartOfBody);
    }
  }, [data, selectedPartOfBody]);

  const updateDetailedPartOfBodyData = (data, selectedPartOfBody) => {
    const filteredData = data.filter(item => item['Part of Body'] === selectedPartOfBody);

    const locationData = filteredData.reduce((acc, item) => {
      const location = item['Body Part Location'];
      if (!acc[location]) {
        acc[location] = { location: location };
      }
      const store = item['Organization Coding Level 1'];
      acc[location][store] = (acc[location][store] || 0) + 1;
      return acc;
    }, {});

    const detailedData = Object.values(locationData);
    setDetailedPartOfBodyData(detailedData);
    setDetailedFilters([...new Set(filteredData.map(item => item['Organization Coding Level 1']))]);
  };

  return (
    <div>
      <div>
        <h2>Part of Body</h2>
        <svg ref={ref} width="800" height="400"></svg>
      </div>
      {selectedPartOfBody && (
        <div>
          <h2>Detailed View - {selectedPartOfBody}</h2>
          <DetailedBarChart data={detailedPartOfBodyData} filters={detailedFilters} />
        </div>
      )}
    </div>
  );
};

const DetailedBarChart = ({ data, filters }) => {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // Clear previous content

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 120, bottom: 60, left: 60 };

    const x0 = d3.scaleBand()
      .domain(data.map(d => d.location))
      .rangeRound([margin.left, width - margin.right])
      .paddingInner(0.1);

    const x1 = d3.scaleBand()
      .domain(filters)
      .rangeRound([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(filters, f => d[f] || 0))])
      .nice()
      .rangeRound([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
      .domain(filters)
      .range(['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab']);

    const svg_g = svg.append("g");

    data.forEach(locationData => {
      svg_g.append("g")
        .selectAll("rect")
        .data(filters)
        .join("rect")
          .attr("x", f => x0(locationData.location) + x1(f))
          .attr("y", f => y(locationData[f] || 0))
          .attr("width", x1.bandwidth())
          .attr("height", f => y(0) - y(locationData[f] || 0))
          .attr("fill", f => color(f))
        .on("mouseover", function(event, f) {
          tooltip.transition()
            .duration(200)
            .style("opacity", 0.9);
          tooltip.html(`${locationData.location} - ${f}: ${locationData[f] || 0}`)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function() {
          tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });
    });

    svg_g.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em");

    svg_g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(null, "s"))
      .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Count");

    const legend = svg_g.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .attr("text-anchor", "end")
      .selectAll("g")
      .data(filters.slice().reverse())
      .join("g")
        .attr("transform", (d, i) => `translate(0,${i * 20})`);

    legend.append("rect")
      .attr("x", width - 19)
      .attr("width", 19)
      .attr("height", 19)
      .attr("fill", color);

    legend.append("text")
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(d => d);

    const tooltip = d3.select("body").append("div")
      .attr("class", "d3-tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px");

  }, [data, filters]);

  return (
    <svg ref={ref} width="800" height="400"></svg>
  );
};

export default D3BarChart;