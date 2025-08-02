import React, { useState } from 'react';
import { Container, Header, Message, PageHeader } from './styles/StyledComponents';
import UploadModal from './components/UploadModal';
import Dashboard from './components/Dashboard';
import EnhancedTransactionTable from './components/EnhancedTransactionTable';
import { useTransactionManager } from './hooks/useTransactionManager';

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
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button 
            onClick={() => setViewMode('dashboard')}
            style={{ 
              padding: '8px 16px', 
              border: '1px solid rgba(255,255,255,0.3)', 
              borderRadius: '20px',
              background: viewMode === 'dashboard' ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            📊 Dashboard
          </button>
          <button 
            onClick={() => setViewMode('table')}
            style={{ 
              padding: '8px 16px', 
              border: '1px solid rgba(255,255,255,0.3)', 
              borderRadius: '20px',
              background: viewMode === 'table' ? 'rgba(255,255,255,0.2)' : 'transparent',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            📋 Table View
          </button>
          <button 
            onClick={handleOpenUploadModal}
            style={{ 
              padding: '8px 16px', 
              border: '1px solid rgba(255,255,255,0.3)', 
              borderRadius: '20px',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            📄 Upload Statement
          </button>
        </div>
      </PageHeader>

      {message && (
        <Message className={message.includes('Error') ? 'error' : 'success'}>
          {message}
        </Message>
      )}

      {transactions.length > 0 && (
        <>
          {viewMode === 'dashboard' ? (
            <>
              <Dashboard 
                transactions={transactions} 
                filteredTransactions={filteredData}
              />
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                  onClick={handleSave}
                  style={{ 
                    padding: '12px 24px', 
                    background: '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Save to LocalStorage
                </button>
                <button 
                  onClick={handleExportData}
                  style={{ 
                    padding: '12px 24px', 
                    background: '#17a2b8', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Export to CSV
                </button>
                <button 
                  onClick={handleClearData}
                  style={{ 
                    padding: '12px 24px', 
                    background: '#dc3545', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Clear All Data
                </button>
              </div>
            </>
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