import React from 'react';
import styled from 'styled-components';

const StatsContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: white;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 8px;
  color: #fff;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const BankSummary = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const BankSummaryTitle = styled.h3`
  margin: 0 0 15px 0;
  font-size: 1.1rem;
  color: #fff;
  text-align: center;
`;

const BankSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
`;

const BankCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
`;

const BankName = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
  color: #fff;
`;

const BankAmount = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: ${props => props.ispositive ? '#4ade80' : '#f87171'};
`;

const EnhancedStats = ({ transactions, filteredTransactions }) => {
  // Calculate total amounts
  const calculateTotalAmount = (data) => {
    return data.reduce((total, transaction) => {
      const amount = parseFloat(transaction['Billing amount']?.replace(/[^\d.-]/g, '') || 0);
      return total + amount;
    }, 0);
  };

  // Calculate amounts by bank
  const calculateAmountsByBank = (data) => {
    const bankTotals = {};
    data.forEach(transaction => {
      const bank = transaction.bankType?.toUpperCase() || 'UNKNOWN';
      const amount = parseFloat(transaction['Billing amount']?.replace(/[^\d.-]/g, '') || 0);
      
      if (!bankTotals[bank]) {
        bankTotals[bank] = 0;
      }
      bankTotals[bank] += amount;
    });
    return bankTotals;
  };

  // Calculate transaction counts
  const calculateTransactionCounts = (data) => {
    const counts = {
      total: data.length,
      debits: data.filter(t => t['Credit / Debit'] === 'DEBIT').length,
      credits: data.filter(t => t['Credit / Debit'] === 'CREDIT').length
    };
    
    const banks = [...new Set(data.map(t => t.bankType?.toUpperCase()))];
    counts.banks = banks.join(', ');
    
    return counts;
  };

  // Use filtered data if available, otherwise use all transactions
  const displayData = filteredTransactions || transactions;
  
  const totalAmount = calculateTotalAmount(displayData);
  const amountsByBank = calculateAmountsByBank(displayData);
  const counts = calculateTransactionCounts(displayData);

  return (
    <StatsContainer>
      <StatsGrid>
        <StatCard>
          <StatValue>{counts.total}</StatValue>
          <StatLabel>Total Transactions</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue style={{ color: totalAmount >= 0 ? '#4ade80' : '#f87171' }}>
            {totalAmount >= 0 ? '+' : ''}{totalAmount.toFixed(2)}
          </StatValue>
          <StatLabel>Total Amount (HKD)</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue style={{ color: '#f87171' }}>{counts.debits}</StatValue>
          <StatLabel>Total Debits</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue style={{ color: '#4ade80' }}>{counts.credits}</StatValue>
          <StatLabel>Total Credits</StatLabel>
        </StatCard>
      </StatsGrid>

      {Object.keys(amountsByBank).length > 0 && (
        <BankSummary>
          <BankSummaryTitle>Amount by Bank</BankSummaryTitle>
          <BankSummaryGrid>
            {Object.entries(amountsByBank).map(([bank, amount]) => (
              <BankCard key={bank}>
                <BankName>{bank}</BankName>
                <BankAmount ispositive={amount >= 0}>
                  {amount >= 0 ? '+' : ''}{amount.toFixed(2)}
                </BankAmount>
              </BankCard>
            ))}
          </BankSummaryGrid>
        </BankSummary>
      )}
    </StatsContainer>
  );
};

export default EnhancedStats; 