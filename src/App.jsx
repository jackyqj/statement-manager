import React from 'react';
import { Container, Header, Message } from './styles/StyledComponents';
import UploadForm from './components/UploadForm';
import TransactionGrid from './components/TransactionGrid';
import { useTransactionManager } from './hooks/useTransactionManager';

function App() {
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
    handleRemoveTags
  } = useTransactionManager();

  return (
    <Container>
      <Header>Bank Statement Manager</Header>
      
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
        <TransactionGrid
          transactions={transactions}
          onSave={handleSave}
          onClearData={handleClearData}
          onDeleteTransactions={handleDeleteTransactions}
          onUpdateTags={handleUpdateTags}
          onRemoveTags={handleRemoveTags}
        />
      )}
    </Container>
  );
}

export default App; 