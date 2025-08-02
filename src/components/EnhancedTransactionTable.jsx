import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { formatDate } from '../utils/csvProcessor';
import { Card, StatusBadge } from '../styles/StyledComponents';

const TableWrapper = styled(Card)`
  overflow: hidden;
  padding: 0;
`;

const TableHeader = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
`;

const AdvancedFilters = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FilterInput = styled.input`
  padding: 8px 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`;

const Th = styled.th`
  background: #f8f9fa;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #495057;
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
    color: #adb5bd;
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
  padding: 16px 12px;
  border-bottom: 1px solid #f1f3f4;
  color: #495057;
`;

const Tr = styled.tr`
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &.selected {
    background-color: #e3f2fd;
  }
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin: 0 2px;
  transition: all 0.2s;
  
  &.edit {
    background: #007bff;
    color: white;
    
    &:hover {
      background: #0056b3;
    }
  }
  
  &.delete {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
  
  &.tag {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #1e7e34;
    }
  }
`;

const BulkActions = styled.div`
  background: #e3f2fd;
  padding: 16px 20px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const TagChip = styled.span`
  display: inline-block;
  background: #e9ecef;
  color: #495057;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  margin: 2px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #dc3545;
    color: white;
  }
`;

const EnhancedTransactionTable = ({ 
  data, 
  onDataChange, 
  onDeleteTransactions, 
  onUpdateTags, 
  onRemoveTags 
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [viewMode, setViewMode] = useState('all');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

  const sortData = (data, sortConfig) => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'Transaction date') {
        aValue = new Date(formatDate(aValue));
        bValue = new Date(formatDate(bValue));
      }

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

  const filterData = (data, filters) => {
    return data.filter(item => {
      // View mode filter
      if (viewMode === 'income' && parseFloat(item['Billing amount']) < 0) return false;
      if (viewMode === 'expenses' && parseFloat(item['Billing amount']) >= 0) return false;

      // Text filters
      const textFiltersPass = Object.keys(filters).every(key => {
        if (!filters[key]) return true;
        const itemValue = String(item[key] || '').toLowerCase();
        const filterValue = filters[key].toLowerCase();
        return itemValue.includes(filterValue);
      });

      if (!textFiltersPass) return false;

      // Date range filter
      if (dateRange.startDate || dateRange.endDate) {
        const transactionDate = formatDate(item['Transaction date']);
        const itemDate = new Date(transactionDate);
        
        if (dateRange.startDate) {
          const startDate = new Date(dateRange.startDate);
          if (itemDate < startDate) return false;
        }
        
        if (dateRange.endDate) {
          const endDate = new Date(dateRange.endDate);
          endDate.setHours(23, 59, 59, 999);
          if (itemDate > endDate) return false;
        }
      }

      return true;
    });
  };

  const processedData = useMemo(() => {
    let filteredData = filterData(data, filters);
    return sortData(filteredData, sortConfig);
  }, [data, filters, sortConfig, viewMode, dateRange]);

  useEffect(() => {
    if (onDataChange) {
      onDataChange(processedData);
    }
  }, [processedData, onDataChange]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setDateRange({ startDate: '', endDate: '' });
    setViewMode('all');
  };

  const handleSelectAll = () => {
    if (selectedTransactions.size === processedData.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(processedData.map((_, index) => index)));
    }
  };

  const handleSelectTransaction = (index) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTransactions(newSelected);
  };

  const handleDeleteSelected = () => {
    const transactionsToDelete = Array.from(selectedTransactions).map(index => processedData[index]);
    onDeleteTransactions(transactionsToDelete);
    setSelectedTransactions(new Set());
  };

  const handleAddTag = () => {
    const tagName = prompt('Enter tag name:');
    if (tagName && tagName.trim()) {
      const transactionsToTag = Array.from(selectedTransactions).map(index => processedData[index]);
      onUpdateTags(transactionsToTag, tagName.trim());
      setSelectedTransactions(new Set());
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return { symbol: '$', amount: '0.00' };
    const numericAmount = parseFloat(amount.toString().replace(/[^\d.-]/g, ''));
    if (isNaN(numericAmount)) return { symbol: '$', amount: '0.00' };
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

  const getAmountColor = (amount) => {
    return parseFloat(amount) >= 0 ? '#28a745' : '#dc3545';
  };

  const columns = [
    { key: 'select', label: '', sortable: false },
    { key: 'bankType', label: 'Bank', sortable: true },
    { key: 'Transaction date', label: 'Date', sortable: true },
    { key: 'Description', label: 'Description', sortable: true },
    { key: 'Billing amount', label: 'Amount', sortable: true },
    { key: 'tags', label: 'Tags', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false }
  ];

  return (
    <TableWrapper>
      <TableHeader>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setViewMode('all')}
            style={{ 
              padding: '8px 16px', 
              border: '1px solid #dee2e6', 
              borderRadius: '20px',
              background: viewMode === 'all' ? '#007bff' : 'white',
              color: viewMode === 'all' ? 'white' : '#495057',
              cursor: 'pointer'
            }}
          >
            📊 All ({data.length})
          </button>
          <button 
            onClick={() => setViewMode('income')}
            style={{ 
              padding: '8px 16px', 
              border: '1px solid #dee2e6', 
              borderRadius: '20px',
              background: viewMode === 'income' ? '#28a745' : 'white',
              color: viewMode === 'income' ? 'white' : '#495057',
              cursor: 'pointer'
            }}
          >
            💰 Income ({data.filter(t => parseFloat(t['Billing amount']) >= 0).length})
          </button>
          <button 
            onClick={() => setViewMode('expenses')}
            style={{ 
              padding: '8px 16px', 
              border: '1px solid #dee2e6', 
              borderRadius: '20px',
              background: viewMode === 'expenses' ? '#dc3545' : 'white',
              color: viewMode === 'expenses' ? 'white' : '#495057',
              cursor: 'pointer'
            }}
          >
            💸 Expenses ({data.filter(t => parseFloat(t['Billing amount']) < 0).length})
          </button>
        </div>

        <AdvancedFilters>
          <FilterGroup>
            <FilterLabel>Bank</FilterLabel>
            <FilterSelect
              value={filters.bankType || ''}
              onChange={(e) => handleFilter('bankType', e.target.value)}
            >
              <option value="">All Banks</option>
              {[...new Set(data.map(t => t.bankType))].map(bank => (
                <option key={bank} value={bank}>{bank?.toUpperCase()}</option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Description</FilterLabel>
            <FilterInput
              placeholder="Search descriptions..."
              value={filters.Description || ''}
              onChange={(e) => handleFilter('Description', e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Start Date</FilterLabel>
            <FilterInput
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>End Date</FilterLabel>
            <FilterInput
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </FilterGroup>
        </AdvancedFilters>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <StatusBadge $variant="success">
              {processedData.length} of {data.length} transactions
            </StatusBadge>
          </div>
          <ActionButton onClick={clearFilters} style={{ background: '#6c757d', color: 'white' }}>
            Clear Filters
          </ActionButton>
        </div>
      </TableHeader>

      {selectedTransactions.size > 0 && (
        <BulkActions>
          <span style={{ fontWeight: 'bold' }}>
            {selectedTransactions.size} transaction(s) selected
          </span>
          <ActionButton className="delete" onClick={handleDeleteSelected}>
            🗑️ Delete Selected
          </ActionButton>
          <ActionButton className="tag" onClick={handleAddTag}>
            🏷️ Add Tag
          </ActionButton>
        </BulkActions>
      )}

      <div style={{ overflowX: 'auto' }}>
        <Table>
          <thead>
            <tr>
              {columns.map(column => (
                <Th
                  key={column.key}
                  className={column.sortable ? 'sortable' : ''}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  {column.key === 'select' ? (
                    <input
                      type="checkbox"
                      checked={selectedTransactions.size === processedData.length && processedData.length > 0}
                      onChange={handleSelectAll}
                    />
                  ) : (
                    column.label
                  )}
                </Th>
              ))}
            </tr>
          </thead>
          <tbody>
            {processedData.map((item, index) => (
              <Tr key={index} className={selectedTransactions.has(index) ? 'selected' : ''}>
                <Td>
                  <input
                    type="checkbox"
                    checked={selectedTransactions.has(index)}
                    onChange={() => handleSelectTransaction(index)}
                  />
                </Td>
                <Td>
                  <StatusBadge $variant="success">
                    {item.bankType?.toUpperCase()}
                  </StatusBadge>
                </Td>
                <Td>{formatDate(item['Transaction date'])}</Td>
                <Td>
                  <div style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item['Description']}
                  </div>
                </Td>
                <Td style={{ 
                  color: getAmountColor(item['Billing amount']), 
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ textAlign: 'left' }}>
                    {formatAmount(item['Billing amount']).symbol}
                  </span>
                  <span style={{ textAlign: 'right' }}>
                    {formatAmount(item['Billing amount']).amount}
                  </span>
                </Td>
                <Td>
                  {item.tags && item.tags.map(tag => (
                    <TagChip key={tag} onClick={() => onRemoveTags([item], tag)}>
                      {tag} ×
                    </TagChip>
                  ))}
                </Td>
                <Td>
                  <ActionButton 
                    className="tag"
                    onClick={() => {
                      const tagName = prompt('Enter tag name:');
                      if (tagName && tagName.trim()) {
                        onUpdateTags([item], tagName.trim());
                      }
                    }}
                  >
                    🏷️
                  </ActionButton>
                  <ActionButton 
                    className="delete"
                    onClick={() => onDeleteTransactions([item])}
                  >
                    🗑️
                  </ActionButton>
                </Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </div>
    </TableWrapper>
  );
};

export default EnhancedTransactionTable; 