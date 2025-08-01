import { useState, useEffect } from 'react';
import { processCSV, filterDuplicates, saveToLocalStorage, loadFromLocalStorage } from '../utils/csvProcessor';

export const useTransactionManager = () => {
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = loadFromLocalStorage('bankTransactions');
    if (savedData) {
      setTransactions(savedData);
    }
  }, []);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setMessage('');
  };

  const handleBankChange = (event) => {
    setSelectedBank(event.target.value);
    setMessage('');
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedBank) {
      setMessage('Please select both a file and bank type.');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      const text = await selectedFile.text();
      const newTransactions = processCSV(text, selectedBank);
      
      // Filter out duplicates
      const uniqueNewTransactions = filterDuplicates(newTransactions, transactions);
      
      if (uniqueNewTransactions.length === 0) {
        setMessage('No new transactions found. All data already exists.');
      } else {
        const updatedTransactions = [...transactions, ...uniqueNewTransactions];
        setTransactions(updatedTransactions);
        console.log('Updated transactions:', updatedTransactions);
        setMessage(`Successfully processed ${uniqueNewTransactions.length} new transactions.`);
      }
      
      // Reset form
      setSelectedFile(null);
      setSelectedBank('');
      document.getElementById('file-input').value = '';
      
    } catch (error) {
      setMessage('Error processing file. Please check the file format.');
      console.error('Error processing file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    const success = saveToLocalStorage('bankTransactions', transactions);
    if (success) {
      setMessage('Data saved successfully to localStorage!');
    } else {
      setMessage('Error saving data to localStorage.');
    }
  };

  const handleClearData = () => {
    // Clear from localStorage
    localStorage.removeItem('bankTransactions');
    
    // Clear from state
    setTransactions([]);
    
    // Reset form
    setSelectedFile(null);
    setSelectedBank('');
    document.getElementById('file-input').value = '';
    
    setMessage('All data cleared successfully!');
  };

  const handleDeleteTransactions = (transactionsToDelete) => {
    const updatedTransactions = transactions.filter(transaction => 
      !transactionsToDelete.some(toDelete => 
        toDelete['Transaction date'] === transaction['Transaction date'] &&
        toDelete['Billing amount'] === transaction['Billing amount'] &&
        toDelete.bankType === transaction.bankType
      )
    );
    
    setTransactions(updatedTransactions);
    saveToLocalStorage('bankTransactions', updatedTransactions);
    setMessage(`${transactionsToDelete.length} transaction(s) deleted successfully!`);
  };

  const handleUpdateTags = (transactionsToTag, tagName) => {
    const updatedTransactions = transactions.map(transaction => {
      const shouldUpdate = transactionsToTag.some(toTag => 
        toTag['Transaction date'] === transaction['Transaction date'] &&
        toTag['Billing amount'] === transaction['Billing amount'] &&
        toTag.bankType === transaction.bankType
      );
      
      if (shouldUpdate) {
        const existingTags = transaction.tags || [];
        const newTags = existingTags.includes(tagName) 
          ? existingTags 
          : [...existingTags, tagName];
        
        return { ...transaction, tags: newTags };
      }
      
      return transaction;
    });
    
    setTransactions(updatedTransactions);
    saveToLocalStorage('bankTransactions', updatedTransactions);
    setMessage(`Tag "${tagName}" added to ${transactionsToTag.length} transaction(s)!`);
  };

  const handleRemoveTags = (transactionsToUpdate, tagToRemove) => {
    const updatedTransactions = transactions.map(transaction => {
      const shouldUpdate = transactionsToUpdate.some(toUpdate => 
        toUpdate['Transaction date'] === transaction['Transaction date'] &&
        toUpdate['Billing amount'] === transaction['Billing amount'] &&
        toUpdate.bankType === transaction.bankType
      );
      
      if (shouldUpdate) {
        const existingTags = transaction.tags || [];
        const newTags = existingTags.filter(tag => tag !== tagToRemove);
        
        return { ...transaction, tags: newTags };
      }
      
      return transaction;
    });
    
    setTransactions(updatedTransactions);
    saveToLocalStorage('bankTransactions', updatedTransactions);
    setMessage(`Tag "${tagToRemove}" removed from ${transactionsToUpdate.length} transaction(s)!`);
  };

  const handleExportData = () => {
    if (transactions.length === 0) {
      setMessage('No data to export.');
      return;
    }

    try {
      // Define CSV headers
      const headers = [
        'Bank',
        'Transaction Date',
        'Description',
        'Billing Amount',
        'Billing Currency',
        'Transaction Status',
        'Credit / Debit',
        'Tags'
      ];

      // Convert transactions to CSV format
      const csvContent = [
        headers.join(','),
        ...transactions.map(transaction => [
          transaction.bankType?.toUpperCase() || '',
          transaction['Transaction date'] || '',
          `"${(transaction['Description'] || '').replace(/"/g, '""')}"`,
          transaction['Billing amount'] || '',
          transaction['Billing currency'] || '',
          transaction['Transaction status'] || '',
          transaction['Credit / Debit'] || '',
          transaction.tags ? `"${transaction.tags.join('; ')}"` : ''
        ].join(','))
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bank_transactions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setMessage('Data exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      setMessage('Error exporting data.');
    }
  };

  const clearMessage = () => {
    setTimeout(() => setMessage(''), 5000);
  };

  useEffect(() => {
    if (message) {
      clearMessage();
    }
  }, [message]);

  return {
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
  };
}; 