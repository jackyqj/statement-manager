import React from 'react';
import { AgGridReact } from 'ag-grid-react';
// import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {
  GridContainer,
  Stats,
  FilterSection,
  FilterButton,
  SaveButton
} from '../styles/StyledComponents';
import { getGridOptions } from '../utils/gridConfig';
import { formatDate } from '../utils/csvProcessor';

const TransactionGrid = ({ transactions, onSave }) => {
  const gridOptions = getGridOptions(transactions);

  const handleClearFilters = () => {
    const gridApi = document.querySelector('.ag-grid-react')?.gridApi;
    if (gridApi) {
      gridApi.setFilterModel(null);
    }
  };

  return (
    <>
      
      <SaveButton onClick={onSave}>
        Save to LocalStorage
      </SaveButton>
      
      <GridContainer>
        <AgGridReact {...gridOptions} />
      </GridContainer>
      
    </>
  );
};

export default TransactionGrid; 