import React, { useState } from 'react';
import {
  SaveButton
} from '../styles/StyledComponents';
import CustomTable from './CustomTable';
import EnhancedStats from './EnhancedStats';

const TransactionGrid = ({ transactions, onSave, onClearData, onDeleteTransactions, onUpdateTags, onRemoveTags, onExportData }) => {
  const [filteredData, setFilteredData] = useState(transactions);

  const handleDataChange = (newFilteredData) => {
    setFilteredData(newFilteredData);
  };

  return (
    <>
      <EnhancedStats 
        transactions={transactions} 
        filteredTransactions={filteredData}
      />
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <SaveButton onClick={onSave}>
          Save to LocalStorage
        </SaveButton>
        
        <SaveButton 
          onClick={onExportData}
          style={{ 
            backgroundColor: '#17a2b8',
            borderColor: '#17a2b8'
          }}
        >
          Export to CSV
        </SaveButton>
        
        <SaveButton 
          onClick={onClearData}
          style={{ 
            backgroundColor: '#dc3545',
            borderColor: '#dc3545'
          }}
        >
          Clear All Data
        </SaveButton>
      </div>
      
      <CustomTable 
        data={transactions} 
        onSave={onSave} 
        onDataChange={handleDataChange}
        onDeleteTransactions={onDeleteTransactions}
        onUpdateTags={onUpdateTags}
        onRemoveTags={onRemoveTags}
      />
    </>
  );
};

export default TransactionGrid; 