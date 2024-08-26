import React from 'react';

const StoreSelector = ({ data, selectedStore, onStoreChange }) => {
  const stores = Array.from(new Set(data.map(item => item["Organization Coding Level 1"])));

  return (
    <div className="store-selector">
      <h3>Select Stores</h3>
      <select 
        multiple 
        value={selectedStore} 
        onChange={(e) => onStoreChange(Array.from(e.target.selectedOptions, option => option.value))}
      >
        {stores.map((store, index) => (
          <option key={index} value={store}>{store}</option>
        ))}
      </select>
    </div>
  );
};

export default StoreSelector;