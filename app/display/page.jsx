'use client'
import React, { useState } from 'react';
import D3BarChart from '../components/D3BarChart';
import StoreSelector from '../components/StoreSelector';
import { parseExcel } from '../../utils/parseExcel';

const Display = () => {
  const [data, setData] = useState([]);
  const [selectedVisualization, setSelectedVisualization] = useState('overallInjuries');
  const [selectedStore, setSelectedStore] = useState([]);
  const [selectedSorting, setSelectedSorting] = useState('default');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewingData, setIsViewingData] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return; // Prevent proceeding with an empty file
  
    try {
      const parsedData = await parseExcel(file);
      setData(parsedData);
      setIsViewingData(true);
    } catch (error) {
      console.error("Error parsing Excel file:", error);
    }
  };

  const handleSortingChange = (event) => {
    setSelectedSorting(event.target.value);
  };

  const handleVisualizationChange = (event) => {
    setSelectedVisualization(event.target.value);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleReset = () => {
    setData([]);
    setSelectedVisualization('overallInjuries');
    setSelectedStore([]);
    setSelectedSorting('default');
    setSelectedItem(null);
    setIsViewingData(false);
  
    // Clear the file input
    document.getElementById('fileInput').value = null;
  };

  const renderDataTable = () => {
    if (!isViewingData) return null;

    let tableData = [];
    let headers = [];

    switch (selectedVisualization) {
      case 'overallInjuries':
        headers = ['Nature Of Injury', 'Count'];
        tableData = Object.entries(
          data.reduce((acc, item) => {
            acc[item['Nature Of Injury']] = (acc[item['Nature Of Injury']] || 0) + 1;
            return acc;
          }, {})
        ).map(([injury, count]) => ({ injury, count }));
        break;
      case 'injuriesByLocation':
        headers = ['Location', 'Top Injury', 'Count'];
        tableData = Object.entries(
          data.reduce((acc, item) => {
            const location = item['Organization Coding Level 1'];
            if (!acc[location]) acc[location] = {};
            acc[location][item['Nature Of Injury']] = (acc[location][item['Nature Of Injury']] || 0) + 1;
            return acc;
          }, {})
        ).map(([location, injuries]) => {
          const [topInjury, count] = Object.entries(injuries).reduce((a, b) => b[1] > a[1] ? b : a);
          return { location, topInjury, count };
        });
        break;
      case 'injuriesByBodyPart':
        headers = ['Body Part', 'Top Injury', 'Count'];
        tableData = Object.entries(
          data.reduce((acc, item) => {
            const bodyPart = item['Part of Body'];
            if (!acc[bodyPart]) acc[bodyPart] = {};
            acc[bodyPart][item['Nature Of Injury']] = (acc[bodyPart][item['Nature Of Injury']] || 0) + 1;
            return acc;
          }, {})
        ).map(([bodyPart, injuries]) => {
          const [topInjury, count] = Object.entries(injuries).reduce((a, b) => b[1] > a[1] ? b : a);
          return { bodyPart, topInjury, count };
        });
        break;
      case 'natureToBodyPart':
        headers = ['Nature Of Injury', 'Body Part', 'Count'];
        tableData = Object.entries(
          data.reduce((acc, item) => {
            const key = `${item['Nature Of Injury']}-${item['Part of Body']}`;
            acc[key] = (acc[key] || 0) + 1;
            return acc;
          }, {})
        ).map(([key, count]) => {
          const [natureOfInjury, bodyPart] = key.split('-');
          return { natureOfInjury, bodyPart, count };
        });
        break;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((header, index) => (
                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tableData.map((row, index) => (
              <tr key={index}>
                {Object.values(row).map((value, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap">{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white py-4">
        <h1 className="text-2xl font-bold text-center">Workplace Injury Analysis Dashboard</h1>
      </header>

      <main className="p-6 flex-grow">
        {/* Chart Section */}
        <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Data Visualization</h2>
          {isViewingData ? (
            <D3BarChart 
              data={data} 
              selectedVisualization={selectedVisualization} 
              selectedStore={selectedStore}
              sorting={selectedSorting}
              onItemClick={handleItemClick}
              className="w-full h-96"
            />
          ) : (
            <div className="flex items-center justify-center h-96 bg-gray-200 rounded-lg">
              <p className="text-gray-500">No data to display. Please upload a file.</p>
            </div>
          )}
        </div>

        {/* Controls and Instructions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Controls</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Upload Data</label>
                <input id="fileInput" type="file" onChange={handleFileChange} disabled={isViewingData} className="mt-1 block w-full" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Visualization</label>
                <select onChange={handleVisualizationChange} disabled={!isViewingData} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                  <option value="overallInjuries">Overall Injuries</option>
                  <option value="injuriesByLocation">Injuries by Location</option>
                  <option value="injuriesByBodyPart">Injuries by Body Part</option>
                  <option value="natureToBodyPart">Nature of Injury to Body Part</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sort By</label>
                <select onChange={handleSortingChange} disabled={!isViewingData} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
                  <option value="default">Default Sorting</option>
                  <option value="alphabetical-asc">Alphabetical (A-Z)</option>
                  <option value="alphabetical-desc">Alphabetical (Z-A)</option>
                  <option value="count-asc">Count (Low to High)</option>
                  <option value="count-desc">Count (High to Low)</option>
                </select>
              </div>
              {(selectedVisualization === 'injuriesByLocation' || selectedVisualization === 'injuriesByBodyPart') && (
                <StoreSelector 
                  data={data} 
                  selectedStore={selectedStore} 
                  onStoreChange={setSelectedStore}
                  disabled={!isViewingData}
                />
              )}
              <button onClick={handleReset} disabled={!isViewingData} className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
                Reset
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Upload your Excel file through the &ldquo;Upload Data&rdquo; input, ensuring the file contains a single sheet named &ldquo;Detail.&rdquo;</li>
              <li>Choose a visualization type from the dropdown.</li>
              <li>Use &ldquo;Sort By&rdquo; to change data ordering.</li>
              <li>For location or body part visualizations, use &ldquo;Select Stores&rdquo; to filter data.</li>
              <li>Click on chart elements for more details.</li>
              <li>Use &ldquo;Reset&rdquo; to clear all data and start over.</li>
            </ol>
          </div>
        </div>

        {/* Data Table */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Data Table</h2>
          {isViewingData ? renderDataTable() : (
            <p className="text-gray-500">No data available. Please upload a file.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Display;
