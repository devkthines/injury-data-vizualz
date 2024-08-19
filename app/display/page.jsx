// pages/index.js
import { useState } from 'react';
import { parseExcel } from '../utils/parseExcel';
import D3BarChart from '../components/D3BarChart';

export default function Home() {
  const [data, setData] = useState([]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const jsonData = await parseExcel(file);
        // Assume the data has 'label' and 'value' properties
        setData(jsonData.map(item => ({
          label: item.label || 'Unknown',
          value: Number(item.value) || 0
        })));
      } catch (error) {
        console.error('Error parsing file:', error);
      }
    }
  };

  return (
    <div>
      <h1>Excel Data to D3 Bar Chart</h1>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
      {data.length > 0 && <D3BarChart data={data} />}
    </div>
  );
}
