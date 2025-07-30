import React from 'react';
import {
  Stats,
  SaveButton
} from '../styles/StyledComponents';
import CustomTable from './CustomTable';

const TransactionGrid = ({ transactions, onSave }) => {
  return (
    <>
      <Stats>
        <span>Total Transactions: {transactions.length}</span>
        <span>Banks: {[...new Set(transactions.map(t => t.bankType))].join(', ')}</span>
        <span>Total Debits: {transactions.filter(t => t['Credit / Debit'] === 'DEBIT').length}</span>
        <span>Total Credits: {transactions.filter(t => t['Credit / Debit'] === 'CREDIT').length}</span>
      </Stats>
      
      <SaveButton onClick={onSave}>
        Save to LocalStorage
      </SaveButton>
      
      <CustomTable data={transactions} onSave={onSave} />
    </>
  );
};

export default TransactionGrid; 