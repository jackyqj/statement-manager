import React, { useMemo, useEffect, useState } from 'react';
import { Card } from '../styles/StyledComponents';
import styled from 'styled-components';

// Import Highcharts first, then modules
import Highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';

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

const TagPieChart = ({ transactions, selectedTagLevel = 1 }) => {
  // Initialize Highcharts modules
  useEffect(() => {
    if (typeof Highcharts !== 'undefined') {
      try {
        Highcharts.setOptions({
          global: {
            useUTC: false
          }
        });
      } catch (error) {
        console.error('Error initializing Highcharts:', error);
      }
    }
  }, []);

  const getTagColor = (tag) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    
    const index = tag.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Get available tag levels based on transactions
  const availableTagLevels = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) {
      return [1];
    }
    
    const maxTags = Math.max(...transactions.map(t => t.tags?.length || 0));
    return Array.from({ length: maxTags }, (_, i) => i + 1);
  }, [transactions]);

  const chartData = useMemo(() => {
    try {
      if (!transactions || !Array.isArray(transactions)) {
        return [];
      }
      
      const tagTotals = {};
      
      transactions.forEach(transaction => {
        if (transaction?.tags && Array.isArray(transaction.tags) && transaction.tags.length > 0) {
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
        .map(([tag, amount]) => ({
          name: tag,
          y: amount,
          color: getTagColor(tag)
        }))
        .sort((a, b) => b.y - a.y);
    } catch (error) {
      console.error('Error processing chart data:', error);
      return [];
    }
  }, [transactions, selectedTagLevel]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTagLevelLabel = (level) => {
    switch (level) {
      case 1: return '1st Tag';
      case 2: return '2nd Tag';
      case 3: return '3rd Tag';
      default: return `${level}th Tag`;
    }
  };

  const options = {
    chart: {
      type: 'pie',
      height: 400,
      backgroundColor: 'transparent'
    },
    title: {
      text: `Spending by ${getTagLevelLabel(selectedTagLevel)}`,
      style: {
        color: '#2c3e50',
        fontSize: '18px',
        fontWeight: 'bold'
      }
    },
    subtitle: {
      text: `Total: ${formatCurrency(chartData.reduce((sum, item) => sum + item.y, 0))}`,
      style: {
        color: '#6c757d',
        fontSize: '14px'
      }
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b><br>{point.percentage:.1f}%<br>{point.y:,.0f} HKD',
          style: {
            fontSize: '12px',
            fontWeight: 'bold'
          }
        },
        showInLegend: true,
        size: '60%',
        center: ['50%', '50%']
      }
    },
    legend: {
      layout: 'vertical',
      align: 'right',
      verticalAlign: 'middle',
      itemStyle: {
        fontSize: '12px',
        fontWeight: 'normal'
      },
      itemHoverStyle: {
        color: '#007bff'
      }
    },
    tooltip: {
      formatter: function() {
        return `<b>${this.point.name}</b><br/>
                Amount: ${formatCurrency(this.point.y)}<br/>
                Percentage: ${this.point.percentage.toFixed(1)}%`;
      }
    },
    series: [{
      name: 'Amount',
      data: chartData,
      size: '100%',
      innerSize: '60%'
    }],
    credits: {
      enabled: false
    },
    accessibility: {
      enabled: false
    },
    exporting: {
      enabled: true,
      buttons: {
        contextButton: {
          menuItems: ['downloadPNG', 'downloadPDF', 'downloadCSV']
        }
      }
    }
  };

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

  if (typeof Highcharts === 'undefined') {
    return (
      <Card>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#6c757d'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ margin: '16px 0 8px 0', color: '#495057' }}>
            Highcharts Not Loaded
          </h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Please refresh the page to load the chart library
          </p>
        </div>
      </Card>
    );
  }

  try {
    return (
      <Card>
        <HighchartsReact
          highcharts={Highcharts}
          options={options}
        />
      </Card>
    );
  } catch (error) {
    console.error('Error rendering TagPieChart:', error);
    return (
      <Card>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#6c757d'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h3 style={{ margin: '16px 0 8px 0', color: '#495057' }}>
            Chart Error
          </h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Unable to display chart. Please try refreshing the page.
          </p>
        </div>
      </Card>
    );
  }
};

export default TagPieChart; 