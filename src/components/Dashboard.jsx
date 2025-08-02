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

const DashboardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 0;
  border-bottom: 1px solid #e9ecef;
`;

const ChartToggleButton = styled.button`
  padding: 6px 12px;
  background: ${props => props.$isSimple ? '#dc3545' : '#28a745'};
  color: white;
  border: none;
  border-radius: 16px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: ${props => props.$isSimple ? '#c82333' : '#218838'};
    transform: translateY(-1px);
  }
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
  position: relative;
  
  &:hover {
    background: ${props => props.$active ? '#0056b3' : '#f8f9fa'};
  }
`;

const TagLevelDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  min-width: 150px;
  z-index: 100;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-5px)'};
  transition: all 0.2s ease;
`;

const TagLevelItem = styled.div`
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 13px;
  color: #495057;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:first-child {
    border-radius: 6px 6px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 6px 6px;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #e9ecef;
  }
`;

const TabContent = styled.div`
  display: ${props => props.$active ? 'block' : 'none'};
`;

const Dashboard = ({ transactions, filteredTransactions }) => {
  const [useSimpleCharts, setUseSimpleCharts] = useState(false);
  const [activeTab, setActiveTab] = useState('tags');
  const [isTagLevelOpen, setIsTagLevelOpen] = useState(false);
  const [selectedTagLevel, setSelectedTagLevel] = useState(1);
  
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

  const availableTagLevels = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) {
      return [1];
    }
    
    const maxTags = Math.max(...transactions.map(t => t.tags?.length || 0));
    return Array.from({ length: maxTags }, (_, i) => i + 1);
  }, [transactions]);

  return (
    <>
      <DashboardHeader>
        <h2 style={{ margin: 0, color: '#2c3e50', fontSize: '1.5rem' }}>
          Financial Analytics
        </h2>
        {activeTab === 'tags' && (
          <ChartToggleButton 
            $isSimple={useSimpleCharts}
            onClick={() => setUseSimpleCharts(!useSimpleCharts)}
          >
            {useSimpleCharts ? '📊 Simple' : '📊 Highcharts'}
          </ChartToggleButton>
        )}
      </DashboardHeader>

      <TabContainer>
        <TabList>
          <TabButton 
            $active={activeTab === 'tags'} 
            onClick={() => setActiveTab('tags')}
            onMouseEnter={() => activeTab === 'tags' && setIsTagLevelOpen(true)}
            onMouseLeave={() => setIsTagLevelOpen(false)}
            style={{ position: 'relative' }}
          >
            🏷️ Tags
            {activeTab === 'tags' && (
              <TagLevelDropdown $isOpen={isTagLevelOpen}>
                {availableTagLevels.map(level => (
                  <TagLevelItem
                    key={level}
                    onClick={() => {
                      setSelectedTagLevel(level);
                      setIsTagLevelOpen(false);
                    }}
                  >
                    {getTagLevelLabel(level)}
                  </TagLevelItem>
                ))}
              </TagLevelDropdown>
            )}
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
          <ErrorBoundary fallbackMessage="Unable to load tag chart. Try switching to simple charts.">
            {useSimpleCharts ? (
              <SimpleTagChart transactions={filteredTransactions} selectedTagLevel={selectedTagLevel} />
            ) : (
              <TagPieChart transactions={filteredTransactions} selectedTagLevel={selectedTagLevel} />
            )}
          </ErrorBoundary>
        </TabContent>

        <TabContent $active={activeTab === 'banks'}>
          <ErrorBoundary fallbackMessage="Unable to load bank chart. Please try refreshing the page.">
            <BankPieChart transactions={filteredTransactions} />
          </ErrorBoundary>
        </TabContent>

        <TabContent $active={activeTab === 'trends'}>
          <ErrorBoundary fallbackMessage="Unable to load trend chart. Please try refreshing the page.">
            <MonthlyTrendChart transactions={filteredTransactions} />
          </ErrorBoundary>
        </TabContent>
      </TabContainer>
    </>
  );
};

export default Dashboard; 