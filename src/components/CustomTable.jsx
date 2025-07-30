import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { formatDate } from '../utils/csvProcessor';

const TableContainer = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  background: #f8f9fa;
  padding: 15px 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #dee2e6;
  cursor: pointer;
  user-select: none;
  position: relative;
  
  &:hover {
    background: #e9ecef;
  }
  
  &.sortable::after {
    content: '↕';
    position: absolute;
    right: 8px;
    color: #999;
  }
  
  &.sorted-asc::after {
    content: '↑';
    color: #007bff;
  }
  
  &.sorted-desc::after {
    content: '↓';
    color: #007bff;
  }
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  color: #333;
  
  &:nth-child(3) {
    max-width: 300px;
    word-wrap: break-word;
  }
`;

const Tr = styled.tr`
  &:hover {
    background-color: #f8f9fa;
  }
`;

const FilterContainer = styled.div`
  padding: 15px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
`;

const FilterInput = styled.input`
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  margin-right: 10px;
  width: 200px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  margin-right: 10px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  border-radius: 4px;
  margin: 0 2px;
  
  &:hover {
    background: #e9ecef;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.active {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }
`;

const ClearFiltersButton = styled.button`
  background: #dc3545;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  margin-left: 10px;
  
  &:hover {
    background: #c82333;
  }
`;

const CustomTable = ({ data, onSave }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Sorting function
  const sortData = (data, sortConfig) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle date sorting
      if (sortConfig.key === 'Transaction date') {
        aValue = new Date(formatDate(aValue));
        bValue = new Date(formatDate(bValue));
      }

      // Handle numeric sorting for amounts
      if (sortConfig.key === 'Billing amount') {
        aValue = parseFloat(aValue.replace(/[^\d.-]/g, ''));
        bValue = parseFloat(bValue.replace(/[^\d.-]/g, ''));
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Filtering function
  const filterData = (data, filters) => {
    return data.filter(item => {
      return Object.keys(filters).every(key => {
        if (!filters[key]) return true;
        
        const itemValue = String(item[key] || '').toLowerCase();
        const filterValue = filters[key].toLowerCase();
        
        return itemValue.includes(filterValue);
      });
    });
  };

  // Apply sorting and filtering
  const processedData = useMemo(() => {
    let filteredData = filterData(data, filters);
    return sortData(filteredData, sortConfig);
  }, [data, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(processedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = processedData.slice(startIndex, endIndex);

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  // Handle filtering
  const handleFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  // Get color for amount and type
  const getAmountColor = (amount) => {
    return amount?.startsWith('-') ? '#dc3545' : '#28a745';
  };

  const getTypeColor = (type) => {
    return type === 'DEBIT' ? '#dc3545' : '#28a745';
  };

  const columns = [
    { key: 'bankType', label: 'Bank', sortable: true },
    { key: 'Transaction date', label: 'Transaction Date', sortable: true },
    { key: 'Description', label: 'Description', sortable: true },
    { key: 'Billing amount', label: 'Billing Amount', sortable: true },
    { key: 'Credit / Debit', label: 'Type', sortable: true }
  ];

  return (
    <>
      <FilterContainer>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <span style={{ fontWeight: 'bold', marginRight: '10px' }}>Filters:</span>
          <FilterInput
            placeholder="Filter by Bank..."
            value={filters.bankType || ''}
            onChange={(e) => handleFilter('bankType', e.target.value)}
          />
          <FilterInput
            placeholder="Filter by Description..."
            value={filters.Description || ''}
            onChange={(e) => handleFilter('Description', e.target.value)}
          />
          <FilterInput
            placeholder="Filter by Type..."
            value={filters['Credit / Debit'] || ''}
            onChange={(e) => handleFilter('Credit / Debit', e.target.value)}
          />
          <ClearFiltersButton onClick={clearFilters}>
            Clear Filters
          </ClearFiltersButton>
        </div>
      </FilterContainer>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              {columns.map(column => (
                <Th
                  key={column.key}
                  className={column.sortable ? 'sortable' : ''}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  {column.label}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, index) => (
              <Tr key={index}>
                <Td>{item.bankType?.toUpperCase()}</Td>
                <Td>{formatDate(item['Transaction date'])}</Td>
                <Td>{item['Description']}</Td>
                <Td style={{ color: getAmountColor(item['Billing amount']), fontWeight: 'bold' }}>
                  {item['Billing amount']}
                </Td>
                <Td style={{ color: getTypeColor(item['Credit / Debit']), fontWeight: 'bold' }}>
                  {item['Credit / Debit']}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <PaginationContainer>
          <div>
            Showing {startIndex + 1}-{Math.min(endIndex, processedData.length)} of {processedData.length} transactions
          </div>
          <div>
            <PaginationButton
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </PaginationButton>
            <PaginationButton
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </PaginationButton>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              if (pageNum > totalPages) return null;
              
              return (
                <PaginationButton
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={currentPage === pageNum ? 'active' : ''}
                >
                  {pageNum}
                </PaginationButton>
              );
            })}
            
            <PaginationButton
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </PaginationButton>
            <PaginationButton
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </PaginationButton>
          </div>
        </PaginationContainer>
      )}
    </>
  );
};

export default CustomTable; 