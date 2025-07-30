import { formatDate } from './csvProcessor';

export const getColumnDefs = () => [
  {
    field: 'bankType',
    headerName: 'Bank',
    width: 100,
    cellRenderer: (params) => params.value?.toUpperCase() || '',
    filter: 'agTextColumnFilter',
  },
  {
    field: 'Transaction date',
    headerName: 'Transaction Date',
    width: 150,
    type: 'date',
    cellRenderer: (params) => formatDate(params.value) || '',
    filter: 'agTextColumnFilter',
  },
  {
    field: 'Description',
    headerName: 'Description',
    flex: 1,
    minWidth: 200,
    filter: 'agTextColumnFilter',
  },
  {
    field: 'Billing amount',
    headerName: 'Billing Amount',
    width: 150,
    filter: 'agNumberColumnFilter',
  },
  {
    field: 'Credit / Debit',
    headerName: 'Type',
    width: 100,
    filter: 'agTextColumnFilter',
  }
];

export const getDefaultColDef = () => ({
  sortable: true,
  resizable: true,
  filter: true,
  floatingFilter: false
});

export const getGridOptions = (transactions) => ({
  rowData: transactions,
  columnDefs: getColumnDefs(),
  defaultColDef: getDefaultColDef(),
  pagination: false,
  paginationPageSize: 100,
  domLayout: "autoHeight",
  suppressRowClickSelection: true,
  enableCellTextSelection: true,
  animateRows: true,
  suppressCellFocus: true,
  onGridReady: (params) => {
    console.log('Grid ready, row data:', transactions);
    params.api.sizeColumnsToFit();
  }
}); 