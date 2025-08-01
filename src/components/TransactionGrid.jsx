import React, { useState } from 'react';
import {
  SaveButton
} from '../styles/StyledComponents';
import CustomTable from './CustomTable';
import EnhancedStats from './EnhancedStats';

const TransactionGrid = ({ transactions, onSave }) => {
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
      
      <SaveButton onClick={onSave}>
        Save to LocalStorage
      </SaveButton>
      
      <CustomTable 
        data={transactions} 
        onSave={onSave} 
        onDataChange={handleDataChange}
      />
    </>
  );
};

export default TransactionGrid; 