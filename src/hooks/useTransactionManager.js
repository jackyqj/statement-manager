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
        setMessage(`Successfully processed ${uniqueNewTransactions.length} new transactions.`);
      }
      
      // Reset form
      setSelectedFile(null);
      setSelectedBank('');
      
      // Clear file input more reliably
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        if (input.value) {
          input.value = '';
        }
      });
      
    } catch (error) {
      setMessage('Error processing file. Please check the file format.');
      console.error('Error processing file:', error);
      throw error; // Re-throw to let the calling component handle it
    } finally {
      setIsProcessing(false);
    }
  };

  const uploadFile = async (file, bank) => {
    if (!file || !bank) {
      setMessage('Please select both a file and bank type.');
      return;
    }

    setIsProcessing(true);
    setMessage('');

    try {
      const text = await file.text();
      const newTransactions = processCSV(text, bank);
      
      // Filter out duplicates
      const uniqueNewTransactions = filterDuplicates(newTransactions, transactions);
      
      if (uniqueNewTransactions.length === 0) {
        setMessage('No new transactions found. All data already exists.');
      } else {
        const updatedTransactions = [...transactions, ...uniqueNewTransactions];
        setTransactions(updatedTransactions);
        setMessage(`Successfully processed ${uniqueNewTransactions.length} new transactions.`);
      }
      
    } catch (error) {
      setMessage('Error processing file. Please check the file format.');
      console.error('Error processing file:', error);
      throw error;
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
    
    // Clear file inputs more reliably
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(input => {
      if (input.value) {
        input.value = '';
      }
    });
    
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

  // Add sample tags to transactions for demo purposes
  const addSampleTags = () => {
    const updatedTransactions = transactions.map(transaction => {
      const desc = transaction['Description']?.toLowerCase() || '';
      let tags = transaction.tags || [];

      // Add relevant tags based on description
      if (desc.includes('food') || desc.includes('restaurant') || desc.includes('mcdonalds') || desc.includes('kfc') || desc.includes('starbucks')) {
        tags = [...new Set([...tags, 'Food & Dining'])];
      }
      if (desc.includes('transport') || desc.includes('octopus') || desc.includes('mtr') || desc.includes('bus') || desc.includes('taxi')) {
        tags = [...new Set([...tags, 'Transport'])];
      }
      if (desc.includes('shopping') || desc.includes('taobao') || desc.includes('amazon') || desc.includes('mall') || desc.includes('store')) {
        tags = [...new Set([...tags, 'Shopping'])];
      }
      if (desc.includes('entertainment') || desc.includes('netflix') || desc.includes('spotify') || desc.includes('movie') || desc.includes('game')) {
        tags = [...new Set([...tags, 'Entertainment'])];
      }
      if (desc.includes('utilities') || desc.includes('electricity') || desc.includes('water') || desc.includes('gas') || desc.includes('internet')) {
        tags = [...new Set([...tags, 'Utilities'])];
      }
      if (desc.includes('salary') || desc.includes('income') || desc.includes('deposit')) {
        tags = [...new Set([...tags, 'Income'])];
      }
      if (desc.includes('atm') || desc.includes('withdrawal')) {
        tags = [...new Set([...tags, 'ATM'])];
      }
      if (desc.includes('online') || desc.includes('payment')) {
        tags = [...new Set([...tags, 'Online Payment'])];
      }

      // If no specific tags were added, add a general category based on amount
      if (tags.length === (transaction.tags || []).length) {
        const amount = parseFloat(transaction['Billing amount']?.replace(/[^\d.-]/g, '') || 0);
        if (amount > 0) {
          tags = [...new Set([...tags, 'Income'])];
        } else if (amount < 0) {
          tags = [...new Set([...tags, 'Expense'])];
        }
      }

      return { ...transaction, tags };
    });

    const transactionsWithTags = updatedTransactions.filter(t => t.tags && t.tags.length > 0);
    setTransactions(updatedTransactions);
    saveToLocalStorage('bankTransactions', updatedTransactions);
    setMessage(`Sample tags added to ${transactionsWithTags.length} transactions!`);
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
    uploadFile,
    handleSave,
    handleClearData,
    handleDeleteTransactions,
    handleUpdateTags,
    handleRemoveTags,
    handleExportData,
    addSampleTags
  };
}; 