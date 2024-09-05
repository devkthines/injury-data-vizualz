'use client';
import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';

const D3BarChart = ({ data, selectedVisualization, selectedStore, sorting, onItemClick }) => {
  const ref = useRef();
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    const width = 1500; // Increased width to accommodate legend
    const height = 900; // Increased height to accommodate labels
    const margin = { top: 200, right: 300, bottom: 200, left: 300 }; // Increased right margin for legend and bottom margin for labels

    const xScale = d3.scaleBand().range([margin.left, width - margin.right]).padding(0.1);
    const yScale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

    svg.attr('width', width).attr('height', height);

    const colorScale = d3.scaleOrdinal(d3.schemePaired);

    const sortData = (data) => {
      switch (sorting) {
        case 'alphabetical-asc':
          return data.sort((a, b) => d3.ascending(a.group, b.group));
        case 'alphabetical-desc':
          return data.sort((a, b) => d3.descending(a.group, b.group));
        case 'count-asc':
          return data.sort((a, b) => a.count - b.count);
        case 'count-desc':
          return data.sort((a, b) => b.count - a.count);
        default:
          return data;
      }
    };

    const renderTopInjuriesChart = (groupBy, title) => {
      const filteredData = (selectedVisualization === 'injuriesByLocation' && selectedStore.length > 0 && !selectedStore.includes('all'))
      ? data.filter(d => selectedStore.includes(d["Organization Coding Level 1"]))
      : data;

      const uniqueGroups = [...new Set(filteredData.map(d => d[groupBy]))];
      
      let topInjuries = uniqueGroups.map(group => {
        const groupData = filteredData.filter(d => d[groupBy] === group);
        const injuryCounts = d3.rollups(groupData, v => v.length, d => d["Nature Of Injury"]);
        const topInjury = injuryCounts.reduce((a, b) => a[1] > b[1] ? a : b);
        return { group, injury: topInjury[0], count: topInjury[1] };
      });

      topInjuries = sortData(topInjuries);

      xScale.domain(topInjuries.map(d => d.group));
      yScale.domain([0, d3.max(topInjuries, d => d.count)]);

      const bars = svg.append('g')
        .selectAll('rect')
        .data(topInjuries)
        .enter()
        .append('rect')
        .attr('x', d => xScale(d.group))
        .attr('y', height - margin.bottom)
        .attr('width', xScale.bandwidth())
        .attr('height', 0)
        .attr('fill', d => colorScale(d.injury))
        .on('mouseover', function(event, d) {
          d3.select(this).attr('opacity', 0.8);
          tooltip.transition().duration(200).style('opacity', 0.9);
          tooltip.html(`${d.group}<br/>Injury: ${d.injury}<br/>Count: ${d.count}`)
            .style('left', `${event.pageX}px`)
            .style('top', `${event.pageY - 28}px`);
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 1);
          tooltip.transition().duration(500).style('opacity', 0);
        })
        .on('click', function(event, d) {
          setSelectedItem(d);
          onItemClick(d);
        });

      bars.transition()
        .duration(1000)
        .attr('y', d => yScale(d.count))
        .attr('height', d => height - margin.bottom - yScale(d.count));

            // X-axis
            svg.append('g')
            .attr('transform', `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .attr('dy', '0.5em')
            .attr('dx', '-0.5em');
    
          // Y-axis
          svg.append('g')
            .attr('transform', `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale));
    
          // Title
          svg.append('text')
            .attr('x', width / 2)
            .attr('y', margin.top / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '18px')
            .style('font-weight', 'bold')
            .text(title);
    
          // Legend
          const legend = svg.append('g')
            .attr('transform', `translate(${width - margin.right + 10}, ${margin.top})`);
    
          const uniqueInjuries = Array.from(new Set(topInjuries.map(d => d.injury)));
          uniqueInjuries.forEach((injury, i) => {
            const legendItem = legend.append('g')
              .attr('transform', `translate(0, ${i * 20})`);
    
            legendItem.append('rect')
              .attr('width', 15)
              .attr('height', 15)
              .attr('fill', colorScale(injury));
    
            legendItem.append('text')
              .attr('x', 20)
              .attr('y', 12)
              .text(injury)
              .style('font-size', '12px');
          });
    
          // Tooltip
          const tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('background-color', 'white')
            .style('border', 'solid')
            .style('border-width', '1px')
            .style('border-radius', '5px')
            .style('padding', '10px')
            .style('pointer-events', 'none'); // Prevent tooltip from interfering with mouse events
  // Update bar mouseover, mouseout, and click events
  bars.on('mouseover', function(event, d) {
    d3.select(this).attr('opacity', 0.8);
    tooltip.transition().duration(200).style('opacity', 0.9);
    tooltip.html(`${d.group}<br/>Injury: ${d.injury}<br/>Count: ${d.count}`)
      .style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY - 28}px`);
  })
  .on('mouseout', function() {
    d3.select(this).attr('opacity', 1);
    tooltip.transition().duration(500).style('opacity', 0);
  })
  .on('mousemove', function(event) {
    tooltip.style('left', `${event.pageX + 10}px`)
      .style('top', `${event.pageY - 28}px`);
  })
  .on('click', function(event, d) {
    setSelectedItem(d);
    onItemClick(d);
  });
};

    const renderHeatmap = () => {
      const correlationData = d3.rollups(
        data,
        v => v.length,
        d => d["Nature Of Injury"],
        d => d["Part of Body"]
      );

      const injuries = Array.from(new Set(correlationData.map(d => d[0])));
      const bodyParts = Array.from(new Set(correlationData.flatMap(d => d[1].map(v => v[0]))));

      const gridData = injuries.flatMap(injury => 
        bodyParts.map(bodyPart => {
          const count = correlationData
            .find(d => d[0] === injury)?.[1]
            .find(v => v[0] === bodyPart)?.[1] || 0;
          return { injury, bodyPart, count };
        })
      );

      const xScale = d3.scaleBand()
        .range([margin.left, width - margin.right])
        .domain(injuries)
        .padding(0.05);

      const yScale = d3.scaleBand()
        .range([height - margin.bottom, margin.top])
        .domain(bodyParts)
        .padding(0.05);

      const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
        .domain([0, d3.max(gridData, d => d.count)]);

      const cells = svg.selectAll()
        .data(gridData)
        .enter().append("g");

      cells.append("rect")
        .attr("x", d => xScale(d.injury))
        .attr("y", d => yScale(d.bodyPart))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.count))
        .append("title")
        .text(d => `Injury: ${d.injury}\nBody Part: ${d.bodyPart}\nCount: ${d.count}`);

      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

      svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .text('Nature of Injury to Body Part Correlation');
    };

    if (selectedVisualization === 'overallInjuries') {
      renderTopInjuriesChart("Nature Of Injury", "Overall Injuries");
    } else if (selectedVisualization === 'injuriesByLocation') {
      renderTopInjuriesChart("Organization Coding Level 1", "Top Injury by Location");
    } else if (selectedVisualization === 'injuriesByBodyPart') {
      renderTopInjuriesChart("Part of Body", "Top Injury by Body Part");
    } else if (selectedVisualization === 'natureToBodyPart') {
      renderHeatmap();
    }

  }, [data, selectedVisualization, selectedStore, sorting, onItemClick]);
  return (
    <div>
    <svg ref={ref} width="1000" height="600"></svg>
    <button onClick={() => {
      const svgNode = ref.current;
      const svgData = new XMLSerializer().serializeToString(svgNode);
      const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = "chart.svg";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }}>
      Download Chart
    </button>
    <button onClick={() => {
      const svgNode = ref.current;
      const svgData = new XMLSerializer().serializeToString(svgNode);
      const svgBlob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
      const svgUrl = URL.createObjectURL(svgBlob);
      const printWindow = window.open(svgUrl);
      printWindow.onload = function() {
        printWindow.print();
      };
    }}>
      Print Chart
    </button>
  </div>
  );
};

export default D3BarChart;