'use client'
import { useState, useEffect } from 'react';
import { parseExcel } from '../../utils/parseExcel';
import D3BarChart from '../components/D3BarChart';

export default function Display() {
  const [data, setData] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [yearOptions, setYearOptions] = useState([]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (data.length > 0) {
      // Extract unique years from the data
      const uniqueYears = Array.from(new Set(data.map(item => new Date(item['Date Of Loss']).getFullYear())));
      setYearOptions(uniqueYears);

      // Filter the data based on selected years
      updateChartData(data, selectedYears);
    }
  }, [data, selectedYears]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const jsonData = await parseExcel(file);
        console.log(jsonData)
        // Convert date format to actual dates
        const formattedData = jsonData.map(item => ({
          ...item,
          'Date Of Loss': new Date((item['Date Of Loss'] - 25569) * 86400 * 1000), // Convert Excel date to JavaScript date
        }));
        setData(formattedData);
      } catch (error) {
        console.error('Error parsing file:', error);
      }
    }
  };

  const handleYearFilterChange = (event) => {
    const { checked, value } = event.target;
    let updatedYears = [...selectedYears];
    if (checked) {
      updatedYears.push(parseInt(value));
    } else {
      updatedYears = updatedYears.filter(year => year !== parseInt(value));
    }
    setSelectedYears(updatedYears);
  };

  const updateChartData = (data, selectedYears) => {
    const filteredData = data.filter(item => {
      const itemYear = new Date(item['Date Of Loss']).getFullYear();
      return selectedYears.length === 0 || selectedYears.includes(itemYear);
    });

    const natureOfInjuryCount = filteredData.reduce((acc, item) => {
      const key = item['Nature Of Injury'];
      if (key) {
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});

    const partOfBodyCount = filteredData.reduce((acc, item) => {
      const key = item['Part of Body'];
      if (key) {
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});

    // Convert to array format for D3
    const aggregatedData = [
      ...Object.entries(natureOfInjuryCount).map(([label, value]) => ({
        label: `Nature Of Injury: ${label}`,
        value,
        category: 'Nature Of Injury',
      })),
      ...Object.entries(partOfBodyCount).map(([label, value]) => ({
        label: `Part of Body: ${label}`,
        value,
        category: 'Part of Body',
      }))
    ];

    setChartData(aggregatedData);
  };

  return (
    <div>
      <h1>Excel Data to D3 Bar Chart</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      <div>
        <h3>Filter by Year:</h3>
        {yearOptions.map(year => (
          <label key={year}>
            <input
              type="checkbox"
              checked={selectedYears.includes(year)}
              value={year}
              onChange={handleYearFilterChange}
            />
            {year}
          </label>
        ))}
      </div>
      {chartData.length > 0 && <D3BarChart data={chartData} />}
    </div>
  );
}