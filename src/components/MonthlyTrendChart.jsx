import React, { useMemo, useEffect } from 'react';
import { Card } from '../styles/StyledComponents';

// Import Highcharts first, then modules
import Highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';

const MonthlyTrendChart = ({ transactions }) => {
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

  const chartData = useMemo(() => {
    try {
      if (!transactions || !Array.isArray(transactions)) {
        return { months: [], incomeData: [], expensesData: [], netData: [] };
      }
      
      const monthlyData = {};
      
      transactions.forEach(transaction => {
        if (transaction && transaction['Transaction date']) {
          const date = new Date(transaction['Transaction date']);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const amount = parseFloat(transaction['Billing amount']?.replace(/[^\d.-]/g, '') || 0);
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = {
              income: 0,
              expenses: 0,
              net: 0
            };
          }
          
          if (amount >= 0) {
            monthlyData[monthKey].income += amount;
          } else {
            monthlyData[monthKey].expenses += Math.abs(amount);
          }
          
          monthlyData[monthKey].net += amount;
        }
      });

      const months = Object.keys(monthlyData).sort();
      const incomeData = months.map(month => monthlyData[month].income);
      const expensesData = months.map(month => monthlyData[month].expenses);
      const netData = months.map(month => monthlyData[month].net);

      return {
        months,
        incomeData,
        expensesData,
        netData
      };
    } catch (error) {
      console.error('Error processing monthly chart data:', error);
      return { months: [], incomeData: [], expensesData: [], netData: [] };
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

  const formatMonth = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const options = {
    chart: {
      type: 'column',
      height: 400,
      backgroundColor: 'transparent'
    },
    title: {
      text: 'Monthly Spending Trends',
      style: {
        color: '#2c3e50',
        fontSize: '18px',
        fontWeight: 'bold'
      }
    },
    subtitle: {
      text: 'Income vs Expenses by Month',
      style: {
        color: '#6c757d',
        fontSize: '14px'
      }
    },
    xAxis: {
      categories: chartData.months.map(formatMonth),
      crosshair: true,
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yAxis: {
      title: {
        text: 'Amount (HKD)',
        style: {
          fontSize: '14px',
          fontWeight: 'bold'
        }
      },
      labels: {
        formatter: function() {
          return formatCurrency(this.value);
        }
      }
    },
    tooltip: {
      shared: true,
      useHTML: true,
      formatter: function() {
        let tooltip = `<b>${this.x}</b><br/>`;
        
        this.points.forEach(point => {
          const color = point.color;
          const name = point.series.name;
          const value = formatCurrency(point.y);
          tooltip += `<span style="color:${color}">●</span> ${name}: <b>${value}</b><br/>`;
        });
        
        return tooltip;
      }
    },
    plotOptions: {
      column: {
        pointPadding: 0.2,
        borderWidth: 0,
        groupPadding: 0.1
      }
    },
    series: [
      {
        name: 'Income',
        data: chartData.incomeData,
        color: '#28a745',
        stack: 'amount'
      },
      {
        name: 'Expenses',
        data: chartData.expensesData,
        color: '#dc3545',
        stack: 'amount'
      }
    ],
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
    },
    legend: {
      enabled: true,
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemStyle: {
        fontSize: '12px'
      }
    }
  };

  if (chartData.months.length === 0) {
    return (
      <Card>
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          color: '#6c757d'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
          <h3 style={{ margin: '16px 0 8px 0', color: '#495057' }}>
            No Transaction Data
          </h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            Upload transactions to see monthly spending trends
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
    console.error('Error rendering MonthlyTrendChart:', error);
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

export default MonthlyTrendChart; 