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

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    try {
      const parsedData = await parseExcel(file);
      setData(parsedData);
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

  return (
    <div className="layout">
      <div className="top-section">
        <div className="control-panel">
          <h2>Controls</h2>
          <div className="file-input">
            <h3>Upload Data</h3>
            <input type="file" onChange={handleFileChange} />
          </div>
          <div className="visualization-selector">
            <h3>Select Visualization</h3>
            <select value={selectedVisualization} onChange={handleVisualizationChange}>
              <option value="overallInjuries">Overall Injuries</option>
              <option value="injuriesByLocation">Injuries by Location</option>
              <option value="injuriesByBodyPart">Injuries by Body Part</option>
              <option value="natureToBodyPart">Nature of Injury to Body Part</option>
            </select>
          </div>
          <div className="sorting-selector">
            <h3>Sort By</h3>
            <select onChange={handleSortingChange}>
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
            />
          )}
        </div>
        <div className="chart-container">
          <D3BarChart 
            data={data} 
            selectedVisualization={selectedVisualization} 
            selectedStore={selectedStore}
            sorting={selectedSorting}
            onItemClick={handleItemClick}
          />
        </div>
      </div>
      <div className="bottom-section">
        <div className="details">
          <h3>Details</h3>
          {selectedItem && (
            <div>
              <h4>{selectedItem.group}</h4>
              <p>Injury: {selectedItem.injury}</p>
              <p>Count: {selectedItem.count}</p>
              {/* Add more details here based on the data structure */}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Display;