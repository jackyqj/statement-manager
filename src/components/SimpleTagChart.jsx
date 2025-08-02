import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Card } from '../styles/StyledComponents';

const TagLevelTabs = styled.div`
  display: flex;
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 20px;
`;

const TagLevelTab = styled.button`
  padding: 8px 16px;
  background: ${props => props.$active ? '#007bff' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#495057'};
  border: none;
  border-bottom: 3px solid ${props => props.$active ? '#007bff' : 'transparent'};
  cursor: pointer;
  font-weight: ${props => props.$active ? '600' : '400'};
  font-size: 14px;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$active ? '#0056b3' : '#f8f9fa'};
  }
`;

const SimpleTagChart = ({ transactions }) => {
  const [selectedTagLevel, setSelectedTagLevel] = useState(1);

  // Get available tag levels based on transactions
  const availableTagLevels = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) {
      return [1];
    }
    
    const maxTags = Math.max(...transactions.map(t => t.tags?.length || 0));
    return Array.from({ length: maxTags }, (_, i) => i + 1);
  }, [transactions]);

  const chartData = useMemo(() => {
    // Calculate total amount by tags
    const tagTotals = {};
    
    if (!transactions || !Array.isArray(transactions)) {
      return [];
    }
    
    transactions.forEach(transaction => {
      if (transaction && transaction.tags && Array.isArray(transaction.tags) && transaction.tags.length > 0) {
        // Get the tag at the selected level (1-based index)
        const tagIndex = selectedTagLevel - 1;
        const tag = transaction.tags[tagIndex];
        
        // Skip if this transaction doesn't have enough tags for the selected level
        if (tag) {
          const amount = parseFloat(transaction['Billing amount']?.replace(/[^\d.-]/g, '') || 0);
          
          if (!tagTotals[tag]) {
            tagTotals[tag] = 0;
          }
          tagTotals[tag] += Math.abs(amount);
        }
      }
    });

    return Object.entries(tagTotals)
      .map(([tag, amount]) => ({ tag, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, selectedTagLevel]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTagColor = (index) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    return colors[index % colors.length];
  };

  const getTagLevelLabel = (level) => {
    switch (level) {
      case 1: return '1st Tag';
      case 2: return '2nd Tag';
      case 3: return '3rd Tag';
      default: return `${level}th Tag`;
    }
  };

  const totalAmount = chartData.reduce((sum, item) => sum + item.amount, 0);

  if (chartData.length === 0) {
    return (
      <Card>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#6c757d'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <h3 style={{ margin: '16px 0 8px 0', color: '#495057' }}>
            No Tagged Transactions
          </h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Add tags to your transactions to see spending breakdown
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <TagLevelTabs>
        {availableTagLevels.map(level => (
          <TagLevelTab
            key={level}
            $active={selectedTagLevel === level}
            onClick={() => setSelectedTagLevel(level)}
          >
            {getTagLevelLabel(level)}
          </TagLevelTab>
        ))}
      </TagLevelTabs>

      <h3 style={{ margin: '0 0 20px 0', color: '#2c3e50', textAlign: 'center' }}>
        Spending by {getTagLevelLabel(selectedTagLevel)}
      </h3>
      <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '20px' }}>
        Total: {formatCurrency(totalAmount)}
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {chartData.map((item, index) => {
          const percentage = totalAmount > 0 ? (item.amount / totalAmount) * 100 : 0;
          
          return (
            <div key={item.tag} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              padding: '8px',
              borderRadius: '6px',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: getTagColor(index),
                flexShrink: 0
              }} />
              
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ 
                  fontWeight: '600', 
                  color: '#495057',
                  fontSize: '14px',
                  marginBottom: '4px'
                }}>
                  {item.tag}
                </div>
                
                <div style={{ 
                  width: '100%', 
                  height: '8px', 
                  backgroundColor: '#e9ecef',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: getTagColor(index),
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
              
              <div style={{ 
                textAlign: 'right',
                minWidth: '80px'
              }}>
                <div style={{ 
                  fontWeight: '700', 
                  color: '#2c3e50',
                  fontSize: '14px'
                }}>
                  {formatCurrency(item.amount)}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6c757d'
                }}>
                  {percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default SimpleTagChart; 