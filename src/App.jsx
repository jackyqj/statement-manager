import React, { useState } from 'react';
import { Container, Header, Message, PageHeader, Card } from './styles/StyledComponents';
import UploadModal from './components/UploadModal';
import ActionMenu from './components/ActionMenu';
import Dashboard from './components/Dashboard';
import EnhancedTransactionTable from './components/EnhancedTransactionTable';
import { useTransactionManager } from './hooks/useTransactionManager';
import styled from 'styled-components';

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin: 20px 0;
`;

const EmptyStateIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.6;
`;

const EmptyStateTitle = styled.h3`
  margin: 16px 0 8px 0;
  color: #495057;
  font-size: 1.5rem;
`;

const EmptyStateText = styled.p`
  margin: 0;
  font-size: 16px;
  color: #6c757d;
  line-height: 1.5;
`;

const UploadPrompt = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ViewToggle = styled.div`
  display: flex;
  gap: 8px;
  background: rgba(255,255,255,0.1);
  padding: 4px;
  border-radius: 24px;
`;

const ViewButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background: ${props => props.$active ? 'rgba(255,255,255,0.2)' : 'transparent'};
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(255,255,255,0.15);
  }
`;

function App() {
  const [viewMode, setViewMode] = useState('dashboard'); // dashboard, table
  const [filteredData, setFilteredData] = useState([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  const {
    selectedBank,
    selectedFile,
    transactions,
    message,
    isProcessing,
    handleFileChange,
    handleBankChange,
    handleUpload,
    handleSave,
    handleClearData,
    handleDeleteTransactions,
    handleUpdateTags,
    handleRemoveTags,
    handleExportData
  } = useTransactionManager();

  const handleModalUpload = async (file, bank) => {
    // Set the bank and file in the transaction manager
    handleBankChange({ target: { value: bank } });
    handleFileChange({ target: { files: [file] } });
    
    // Trigger the upload
    await handleUpload();
    
    // Close the modal after successful upload
    setIsUploadModalOpen(false);
  };

  const handleOpenUploadModal = () => {
    setIsUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setIsUploadModalOpen(false);
  };

  return (
    <Container>
      <PageHeader>
        <Header>Bank Statement Manager</Header>
        <HeaderActions>
          <ViewToggle>
            <ViewButton 
              $active={viewMode === 'dashboard'}
              onClick={() => setViewMode('dashboard')}
            >
              📊 Dashboard
            </ViewButton>
            <ViewButton 
              $active={viewMode === 'table'}
              onClick={() => setViewMode('table')}
            >
              📋 Table View
            </ViewButton>
          </ViewToggle>
          <ActionMenu 
            onUpload={handleOpenUploadModal}
            onSave={handleSave}
            onExport={handleExportData}
            onClear={handleClearData}
            hasData={transactions.length > 0}
          />
        </HeaderActions>
      </PageHeader>

      {message && (
        <Message className={message.includes('Error') ? 'error' : 'success'}>
          {message}
        </Message>
      )}

      {transactions.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>📊</EmptyStateIcon>
          <EmptyStateTitle>Welcome to Bank Statement Manager</EmptyStateTitle>
          <EmptyStateText>
            Get started by uploading your first bank statement to see your spending insights, 
            trends, and financial analysis in beautiful charts and tables.
          </EmptyStateText>
          <UploadPrompt onClick={handleOpenUploadModal}>
            📄 Upload Your First Statement
          </UploadPrompt>
        </EmptyState>
      ) : (
        <>
          {viewMode === 'dashboard' ? (
            <Dashboard 
              transactions={transactions} 
              filteredTransactions={filteredData}
            />
          ) : (
            <EnhancedTransactionTable
              data={transactions}
              onDataChange={setFilteredData}
              onDeleteTransactions={handleDeleteTransactions}
              onUpdateTags={handleUpdateTags}
              onRemoveTags={handleRemoveTags}
            />
          )}
        </>
      )}

      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={handleCloseUploadModal}
        onUpload={handleModalUpload}
      />
    </Container>
  );
}

export default App; 