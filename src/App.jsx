import React, { useState } from 'react';
import { Container, Header, Message, PageHeader } from './styles/StyledComponents';
import UploadForm from './components/UploadForm';
import TransactionGrid from './components/TransactionGrid';
import Dashboard from './components/Dashboard';
import EnhancedTransactionTable from './components/EnhancedTransactionTable';
import { useTransactionManager } from './hooks/useTransactionManager';

function App() {
  const [viewMode, setViewMode] = useState('dashboard'); // dashboard, table
  const [filteredData, setFilteredData] = useState([]);
  
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
        </div>
      </PageHeader>
      
      <UploadForm
        selectedBank={selectedBank}
        selectedFile={selectedFile}
        isProcessing={isProcessing}
        onBankChange={handleBankChange}
        onFileChange={handleFileChange}
        onUpload={handleUpload}
      />

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
    </Container>
  );
}

export default App; 