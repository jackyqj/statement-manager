import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Card, StatusBadge, QuickActions, QuickActionButton } from '../styles/StyledComponents';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const InsightCard = styled(Card)`
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.accent || 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'};
  }
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.color || '#2c3e50'};
  margin: 8px 0;
`;

const MetricLabel = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const TrendIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: ${props => props.trend === 'up' ? '#28a745' : '#dc3545'};
  margin-top: 8px;
`;

const ChartContainer = styled.div`
  height: 200px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 0.9rem;
`;

const Dashboard = ({ transactions, filteredTransactions }) => {
  const insights = useMemo(() => {
    const data = filteredTransactions || transactions;
    
    // Calculate key metrics
    const totalAmount = data.reduce((sum, t) => sum + parseFloat(t['Billing amount']?.replace(/[^\d.-]/g, '') || 0), 0);
    const totalTransactions = data.length;
    const uniqueBanks = [...new Set(data.map(t => t.bankType))].length;
    const avgTransaction = totalTransactions > 0 ? totalAmount / totalTransactions : 0;
    
    // Calculate monthly trends
    const monthlyData = data.reduce((acc, t) => {
      const date = new Date(t['Transaction date']);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) acc[monthKey] = { count: 0, amount: 0 };
      acc[monthKey].count++;
      acc[monthKey].amount += parseFloat(t['Billing amount']?.replace(/[^\d.-]/g, '') || 0);
      return acc;
    }, {});
    
    // Get top spending categories
    const categories = data.reduce((acc, t) => {
      const desc = t['Description']?.toLowerCase() || '';
      let category = 'Other';
      
      if (desc.includes('food') || desc.includes('restaurant') || desc.includes('mcdonalds')) category = 'Food & Dining';
      else if (desc.includes('transport') || desc.includes('octopus') || desc.includes('mtr')) category = 'Transport';
      else if (desc.includes('shopping') || desc.includes('taobao') || desc.includes('amazon')) category = 'Shopping';
      else if (desc.includes('entertainment') || desc.includes('netflix') || desc.includes('spotify')) category = 'Entertainment';
      else if (desc.includes('utilities') || desc.includes('electricity') || desc.includes('water')) category = 'Utilities';
      
      if (!acc[category]) acc[category] = 0;
      acc[category] += Math.abs(parseFloat(t['Billing amount']?.replace(/[^\d.-]/g, '') || 0));
      return acc;
    }, {});
    
    const topCategories = Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
    
    return {
      totalAmount,
      totalTransactions,
      uniqueBanks,
      avgTransaction,
      monthlyData,
      topCategories,
      recentActivity: data.slice(0, 5)
    };
  }, [transactions, filteredTransactions]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'HKD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <>
      <QuickActions>
        <QuickActionButton>📊 All Transactions</QuickActionButton>
        <QuickActionButton>💰 Income</QuickActionButton>
        <QuickActionButton>💸 Expenses</QuickActionButton>
        <QuickActionButton>🏦 By Bank</QuickActionButton>
        <QuickActionButton>📅 This Month</QuickActionButton>
      </QuickActions>

      <DashboardContainer>
        <InsightCard accent="linear-gradient(90deg, #28a745 0%, #20c997 100%)">
          <MetricLabel>Total Balance</MetricLabel>
          <MetricValue color="#28a745">
            {formatCurrency(insights.totalAmount)}
          </MetricValue>
          <StatusBadge variant={insights.totalAmount >= 0 ? 'success' : 'warning'}>
            {insights.totalAmount >= 0 ? 'Positive' : 'Negative'} Balance
          </StatusBadge>
        </InsightCard>

        <InsightCard accent="linear-gradient(90deg, #007bff 0%, #6610f2 100%)">
          <MetricLabel>Total Transactions</MetricLabel>
          <MetricValue color="#007bff">
            {insights.totalTransactions.toLocaleString()}
          </MetricValue>
          <StatusBadge variant="success">
            Across {insights.uniqueBanks} Banks
          </StatusBadge>
        </InsightCard>

        <InsightCard accent="linear-gradient(90deg, #ffc107 0%, #fd7e14 100%)">
          <MetricLabel>Average Transaction</MetricLabel>
          <MetricValue color="#fd7e14">
            {formatCurrency(insights.avgTransaction)}
          </MetricValue>
          <TrendIndicator trend="up">
            📈 Monthly Average
          </TrendIndicator>
        </InsightCard>

        <InsightCard accent="linear-gradient(90deg, #e83e8c 0%, #dc3545 100%)">
          <MetricLabel>Top Spending Category</MetricLabel>
          <MetricValue color="#dc3545">
            {insights.topCategories[0]?.[0] || 'N/A'}
          </MetricValue>
          <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
            {formatCurrency(insights.topCategories[0]?.[1] || 0)}
          </div>
        </InsightCard>
      </DashboardContainer>

      <Card>
        <h3 style={{ margin: '0 0 16px 0', color: '#2c3e50' }}>Spending by Category</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {insights.topCategories.map(([category, amount]) => (
            <div key={category} style={{ 
              padding: '12px', 
              background: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontWeight: '600', color: '#495057' }}>{category}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#dc3545' }}>
                {formatCurrency(amount)}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 style={{ margin: '0 0 16px 0', color: '#2c3e50' }}>Recent Activity</h3>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {insights.recentActivity.map((transaction, index) => (
            <div key={index} style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '12px 0',
              borderBottom: index < insights.recentActivity.length - 1 ? '1px solid #e9ecef' : 'none'
            }}>
              <div>
                <div style={{ fontWeight: '600', color: '#495057' }}>
                  {transaction['Description']}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6c757d' }}>
                  {transaction['Transaction date']} • {transaction.bankType?.toUpperCase()}
                </div>
              </div>
              <div style={{ 
                fontWeight: '700', 
                color: parseFloat(transaction['Billing amount']) >= 0 ? '#28a745' : '#dc3545'
              }}>
                {formatCurrency(parseFloat(transaction['Billing amount']))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
};

export default Dashboard; 