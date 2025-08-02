import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Card, StatusBadge } from '../styles/StyledComponents';
import TagPieChart from './TagPieChart';
import MonthlyTrendChart from './MonthlyTrendChart';
import SimpleTagChart from './SimpleTagChart';
import BankPieChart from './BankPieChart';
import ErrorBoundary from './ErrorBoundary';

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
    background: ${props => props.$accent || 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'};
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

const ChartToggleButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.$isSimple ? '#dc3545' : '#28a745'};
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s;
  
  &:hover {
    background: ${props => props.$isSimple ? '#c82333' : '#218838'};
  }
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const TabContainer = styled.div`
  margin-bottom: 20px;
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 2px solid #e9ecef;
  margin-bottom: 20px;
`;

const TabButton = styled.button`
  padding: 12px 24px;
  background: ${props => props.$active ? '#007bff' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#495057'};
  border: none;
  border-bottom: 3px solid ${props => props.$active ? '#007bff' : 'transparent'};
  cursor: pointer;
  font-weight: ${props => props.$active ? '600' : '400'};
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$active ? '#0056b3' : '#f8f9fa'};
  }
`;

const TabContent = styled.div`
  display: ${props => props.$active ? 'block' : 'none'};
`;

const Dashboard = ({ transactions, filteredTransactions }) => {
  const [useSimpleCharts, setUseSimpleCharts] = useState(false);
  const [activeTab, setActiveTab] = useState('tags');
  
  const insights = useMemo(() => {
    const data = filteredTransactions || transactions;
    
    // Calculate key metrics
    const totalAmount = data.reduce((sum, t) => sum + parseFloat(t['Billing amount']?.replace(/[^\d.-]/g, '') || 0), 0);
    
    return {
      totalAmount
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
      <DashboardContainer>
        <InsightCard $accent="linear-gradient(90deg, #28a745 0%, #20c997 100%)">
          <MetricLabel>Total Balance</MetricLabel>
          <MetricValue color="#28a745">
            {formatCurrency(insights.totalAmount)}
          </MetricValue>
          <StatusBadge $variant={insights.totalAmount >= 0 ? 'success' : 'warning'}>
            {insights.totalAmount >= 0 ? 'Positive' : 'Negative'} Balance
          </StatusBadge>
        </InsightCard>
      </DashboardContainer>

      <TabContainer>
        <TabList>
          <TabButton 
            $active={activeTab === 'tags'} 
            onClick={() => setActiveTab('tags')}
          >
            🏷️ Tags
          </TabButton>
          <TabButton 
            $active={activeTab === 'banks'} 
            onClick={() => setActiveTab('banks')}
          >
            🏦 Banks
          </TabButton>
          <TabButton 
            $active={activeTab === 'trends'} 
            onClick={() => setActiveTab('trends')}
          >
            📈 Trends
          </TabButton>
        </TabList>

        <TabContent $active={activeTab === 'tags'}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <ChartToggleButton 
              $isSimple={useSimpleCharts}
              onClick={() => setUseSimpleCharts(!useSimpleCharts)}
            >
              {useSimpleCharts ? 'Switch to Highcharts' : 'Switch to Simple Charts'}
            </ChartToggleButton>
          </div>
          
          <ErrorBoundary fallbackMessage="Unable to load tag chart. Try switching to simple charts.">
            {useSimpleCharts ? (
              <SimpleTagChart transactions={transactions} />
            ) : (
              <TagPieChart transactions={transactions} />
            )}
          </ErrorBoundary>
        </TabContent>

        <TabContent $active={activeTab === 'banks'}>
          <ErrorBoundary fallbackMessage="Unable to load bank chart. Please try refreshing the page.">
            <BankPieChart transactions={transactions} />
          </ErrorBoundary>
        </TabContent>

        <TabContent $active={activeTab === 'trends'}>
          <ErrorBoundary fallbackMessage="Unable to load trend chart. Please try refreshing the page.">
            <MonthlyTrendChart transactions={transactions} />
          </ErrorBoundary>
        </TabContent>
      </TabContainer>
    </>
  );
};

export default Dashboard; 