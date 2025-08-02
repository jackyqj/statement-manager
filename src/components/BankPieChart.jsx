import React, { useMemo, useEffect } from 'react';
import { Card } from '../styles/StyledComponents';

// Import Highcharts first, then modules
import Highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';

const BankPieChart = ({ transactions }) => {
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

  const getBankColor = (bank) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    
    const index = bank.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const chartData = useMemo(() => {
    try {
      if (!transactions || !Array.isArray(transactions)) {
        return [];
      }
      
      const bankTotals = {};
      
      transactions.forEach(transaction => {
        const amount = parseFloat(transaction['Billing amount']?.replace(/[^\d.-]/g, '') || 0);
        const bank = transaction.bankType || 'Unknown Bank';
        
        if (!bankTotals[bank]) {
          bankTotals[bank] = 0;
        }
        bankTotals[bank] += Math.abs(amount);
      });

      return Object.entries(bankTotals)
        .map(([bank, amount]) => ({
          name: bank,
          y: amount,
          color: getBankColor(bank)
        }))
        .sort((a, b) => b.y - a.y);
    } catch (error) {
      console.error('Error processing bank chart data:', error);
      return [];
    }
  }, [transactions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const options = {
    chart: {
      type: 'pie',
      height: 400,
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Spending by Banks',
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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏦</div>
          <h3 style={{ margin: '16px 0 8px 0', color: '#495057' }}>
            No Bank Data
          </h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Upload transactions to see spending breakdown by banks
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
    console.error('Error rendering BankPieChart:', error);
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

export default BankPieChart; 