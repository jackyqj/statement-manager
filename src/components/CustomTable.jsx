import React, { useState, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { formatDate } from '../utils/csvProcessor';
import { RemoveTagButton } from '../styles/StyledComponents';

const TableContainer = styled.div`
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
  width: 100%;
  box-sizing: border-box;
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
  min-width: 150px;
  flex: 1;
  
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

const ActionBar = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: 2px solid #dc3545;
  border-radius: 6px;
  background: ${props => props.variant === 'danger' ? '#dc3545' : '#fff'};
  color: ${props => props.variant === 'danger' ? '#fff' : '#dc3545'};
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.variant === 'danger' ? '#c82333' : '#dc3545'};
    color: #fff;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const TagButton = styled(ActionButton)`
  border-color: #28a745;
  color: #28a745;
  
  &:hover {
    background: #28a745;
    color: #fff;
  }
`;

const TagFilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-width: 200px;
`;

const TagFilterChip = styled.span`
  background: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  
  &:hover {
    background: #0056b3;
  }
`;

const TagFilterSelect = styled.select`
  padding: 6px 10px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const TagDisplay = styled.span`
  background: #e9ecef;
  border-radius: 4px;
  padding: 2px 8px;
  margin: 2px;
  font-size: 12px;
  display: inline-block;
`;

const ActionCell = styled.td`
  padding: 8px;
  text-align: center;
  white-space: nowrap;
`;

const ActionIcon = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  margin: 0 2px;
  border-radius: 4px;
  font-size: 12px;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f8f9fa;
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

const CustomTable = ({ data, onSave, onDataChange, onDeleteTransactions, onUpdateTags, onRemoveTags }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({});
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [tagFilters, setTagFilters] = useState([]);

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
    
    return sortedData;
  }, [data, filters, sortConfig, dateRange]);

  // Filter by tags
  const filteredByTags = useMemo(() => {
    if (tagFilters.length === 0) return processedData;
    return processedData.filter(transaction => 
      transaction.tags && tagFilters.some(tag => transaction.tags.includes(tag))
    );
  }, [processedData, tagFilters]);

  // Final filtered data (after tag filtering)
  const finalFilteredData = useMemo(() => {
    return filteredByTags;
  }, [filteredByTags]);

  // Notify parent component of filtered data changes using useEffect
  useEffect(() => {
    if (onDataChange) {
      onDataChange(finalFilteredData);
    }
  }, [finalFilteredData, onDataChange]);

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
    setTagFilters([]);
  };

  // Selection functions
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

  // Action functions
  const handleDeleteSelected = () => {
    const selectedIndices = Array.from(selectedTransactions);
    const transactionsToDelete = selectedIndices.map(index => processedData[index]);
    onDeleteTransactions(transactionsToDelete);
    setSelectedTransactions(new Set());
  };

  const handleAddTag = () => {
    const tagName = prompt('Enter tag name:');
    if (tagName && tagName.trim()) {
      const selectedIndices = Array.from(selectedTransactions);
      const transactionsToTag = selectedIndices.map(index => processedData[index]);
      onUpdateTags(transactionsToTag, tagName.trim());
      setSelectedTransactions(new Set());
    }
  };

  const handleDeleteTransaction = (transaction) => {
    onDeleteTransactions([transaction]);
  };

  const handleTagTransaction = (transaction) => {
    const tagName = prompt('Enter tag name:');
    if (tagName && tagName.trim()) {
      onUpdateTags([transaction], tagName.trim());
    }
  };

  const handleRemoveTagFromTransaction = (transaction, tagToRemove) => {
    onRemoveTags([transaction], tagToRemove);
  };

  // Get all available tags
  const getAllTags = () => {
    const tags = new Set();
    data.forEach(transaction => {
      if (transaction.tags) {
        transaction.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  };

  // Tag filter functions
  const handleAddTagFilter = (tag) => {
    if (!tagFilters.includes(tag)) {
      setTagFilters([...tagFilters, tag]);
    }
  };

  const handleRemoveTagFilter = (tagToRemove) => {
    setTagFilters(tagFilters.filter(tag => tag !== tagToRemove));
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
    { key: 'select', label: '', sortable: false },
    { key: 'bankType', label: 'Bank', sortable: true },
    { key: 'Transaction date', label: 'Transaction Date', sortable: true },
    { key: 'Description', label: 'Description', sortable: true },
    { key: 'Billing amount', label: 'Billing Amount', sortable: true },
    // { key: 'Credit / Debit', label: 'Type', sortable: true },
    { key: 'tags', label: 'Tags', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false }
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
          <TagFilterContainer>
            <span style={{ fontWeight: 'bold', marginRight: '8px' }}>Tags:</span>
            {tagFilters.map(tag => (
              <TagFilterChip key={tag} onClick={() => handleRemoveTagFilter(tag)}>
                {tag} ×
              </TagFilterChip>
            ))}
            <TagFilterSelect
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  handleAddTagFilter(e.target.value);
                  e.target.value = '';
                }
              }}
            >
              <option value="">Add tag filter...</option>
              {getAllTags().filter(tag => !tagFilters.includes(tag)).map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </TagFilterSelect>
          </TagFilterContainer>
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

      {selectedTransactions.size > 0 && (
        <ActionBar>
          <span style={{ fontWeight: 'bold' }}>
            {selectedTransactions.size} transaction(s) selected
          </span>
          <ActionButton
            variant="danger"
            onClick={handleDeleteSelected}
          >
            Delete Selected
          </ActionButton>
          <TagButton onClick={handleAddTag}>
            Add Tag
          </TagButton>
        </ActionBar>
      )}

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
                           {column.key === 'select' ? (
                             <input
                               type="checkbox"
                               checked={selectedTransactions.size === finalFilteredData.length && finalFilteredData.length > 0}
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
                       {finalFilteredData.map((item, index) => (
                         <Tr key={index}>
                           <Td>
                             <input
                               type="checkbox"
                               checked={selectedTransactions.has(index)}
                               onChange={() => handleSelectTransaction(index)}
                             />
                           </Td>
                           <Td>{item.bankType?.toUpperCase()}</Td>
                           <Td>{formatDate(item['Transaction date'])}</Td>
                           <Td>{item['Description']}</Td>
                           <Td style={{ 
                             color: getAmountColor(item['Billing amount']), 
                             fontWeight: 'bold',
                             fontFamily: 'monospace',
                             textAlign: 'right',
                             whiteSpace: 'nowrap',
                             position: 'relative'
                           }}>
                             <span style={{ 
                               position: 'absolute', 
                               left: '12px', 
                               top: '50%', 
                               transform: 'translateY(-50%)' 
                             }}>
                               $
                             </span>
                             <span style={{ paddingLeft: '20px' }}>
                               {formatAmount(item['Billing amount']).amount}
                             </span>
                           </Td>
                           {/* <Td style={{ color: getTypeColor(item['Credit / Debit']), fontWeight: 'bold' }}>
                             {item['Credit / Debit']}
                           </Td> */}
                           <Td>
                             {item.tags && item.tags.map(tag => (
                               <TagDisplay key={tag}>
                                 {tag}
                                 <RemoveTagButton
                                   onClick={() => handleRemoveTagFromTransaction(item, tag)}
                                   title="Remove tag"
                                 >
                                   ×
                                 </RemoveTagButton>
                               </TagDisplay>
                             ))}
                           </Td>
                           <ActionCell>
                             <ActionIcon
                               onClick={() => handleTagTransaction(item)}
                               style={{ color: '#28a745' }}
                             >
                               🏷️
                             </ActionIcon>
                             <ActionIcon
                               onClick={() => handleDeleteTransaction(item)}
                               style={{ color: '#dc3545' }}
                             >
                               🗑️
                             </ActionIcon>
                           </ActionCell>
                         </Tr>
                       ))}
                     </tbody>
        </Table>
      </TableContainer>


    </>
  );
};

export default CustomTable; 