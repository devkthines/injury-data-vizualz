import React from 'react';

const StoreSelector = ({ data, selectedStore, onStoreChange, disabled }) => {
  const stores = Array.from(new Set(data.map(item => item["Organization Coding Level 1"]))).sort();

  const handleChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    if (selectedOptions.includes('all')) {
      onStoreChange(stores);
    } else {
      onStoreChange(selectedOptions);
    }
  };

  return (
    <div className="store-selector">
      <h3>Select Stores</h3>
      <p className="instructions">
        Hold Ctrl (Windows) or Cmd (Mac) to select multiple stores. 
        Choose "All Stores" to select all.
      </p>
      <select 
        multiple 
        size={Math.min(10, stores.length + 1)}
        value={selectedStore} 
        onChange={handleChange}
        className="store-select"
        disabled={disabled}
      >
        <option value="all">All Stores</option>
        {stores.map((store, index) => (
          <option key={index} value={store}>{store}</option>
        ))}
      </select>
    </div>
  );
};

export default StoreSelector;