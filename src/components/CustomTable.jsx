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

const DateFilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
`;

const DateFilterLabel = styled.span`
  font-weight: bold;
  color: #333;
  min-width: 80px;
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 150px;
  
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

const CustomTable = ({ data, onSave, onDataChange }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

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
      // Check text filters
      const textFiltersPass = Object.keys(filters).every(key => {
        if (!filters[key]) return true;
        
        const itemValue = String(item[key] || '').toLowerCase();
        const filterValue = filters[key].toLowerCase();
        
        return itemValue.includes(filterValue);
      });

      if (!textFiltersPass) return false;

      // Check date range filter
      if (dateRange.startDate || dateRange.endDate) {
        const transactionDate = formatDate(item['Transaction date']);
        const itemDate = new Date(transactionDate);
        
        if (dateRange.startDate) {
          const startDate = new Date(dateRange.startDate);
          if (itemDate < startDate) return false;
        }
        
        if (dateRange.endDate) {
          const endDate = new Date(dateRange.endDate);
          // Set end date to end of day for inclusive filtering
          endDate.setHours(23, 59, 59, 999);
          if (itemDate > endDate) return false;
        }
      }

      return true;
    });
  };

  // Apply sorting and filtering
  const processedData = useMemo(() => {
    let filteredData = filterData(data, filters);
    const sortedData = sortData(filteredData, sortConfig);
    
    // Notify parent component of filtered data changes
    if (onDataChange) {
      onDataChange(sortedData);
    }
    
    return sortedData;
  }, [data, filters, sortConfig, dateRange]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle filtering
  const handleFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setDateRange({ startDate: '', endDate: '' });
  };

  // Get color for amount and type
  const getAmountColor = (amount) => {
    return amount?.startsWith('-') ? '#dc3545' : '#28a745';
  };

  const getTypeColor = (type) => {
    return type === 'DEBIT' ? '#dc3545' : '#28a745';
  };

  // Format amount for accounting display
  const formatAmount = (amount) => {
    if (!amount) return { symbol: '$', amount: '0.00' };
    
    // Remove any existing currency symbols and convert to number
    const numericAmount = parseFloat(amount.toString().replace(/[^\d.-]/g, ''));
    
    if (isNaN(numericAmount)) return { symbol: '$', amount: '0.00' };
    
    // Format with accounting style: $ (1,000.00) for negative, $ 1,000.00 for positive
    const absAmount = Math.abs(numericAmount);
    const formattedAmount = absAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    if (numericAmount < 0) {
      return { symbol: '$', amount: `(${formattedAmount})` };
    } else {
      return { symbol: '$', amount: formattedAmount };
    }
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
        
        <DateFilterContainer>
          <DateFilterLabel>Date Range:</DateFilterLabel>
          <DateInput
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            placeholder="Start Date"
          />
          <span style={{ color: '#666' }}>to</span>
          <DateInput
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            placeholder="End Date"
          />
        </DateFilterContainer>
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
            {processedData.map((item, index) => (
              <Tr key={index}>
                <Td>{item.bankType?.toUpperCase()}</Td>
                <Td>{formatDate(item['Transaction date'])}</Td>
                <Td>{item['Description']}</Td>
                                                  <Td style={{ 
                                    color: getAmountColor(item['Billing amount']), 
                                    fontWeight: 'bold',
                                    fontFamily: 'monospace',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                  }}>
                                    <span style={{ textAlign: 'left' }}>$</span>
                                    <span style={{ textAlign: 'right' }}>
                                      {formatAmount(item['Billing amount']).amount}
                                    </span>
                                  </Td>
                <Td style={{ color: getTypeColor(item['Credit / Debit']), fontWeight: 'bold' }}>
                  {item['Credit / Debit']}
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>


    </>
  );
};

export default CustomTable; 