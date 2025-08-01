// Date formatting function
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  
  // Handle DD/MM/YYYY format (both HSBC and SBC use this format)
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  
  return dateStr;
};

// Bank-specific date formatting
const formatDateByBank = (dateStr, bankType) => {
  if (!dateStr) return '';
  
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    if (bankType === 'citi') {
      // Citi uses MM/DD/YYYY format
      const month = parts[0].padStart(2, '0');
      const day = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    } else {
      // HSBC, SCB, and HASB use DD/MM/YYYY format
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
  }
  
  return dateStr;
};

// CSV processing function
export const processCSV = (csvText, bankType) => {
  const lines = csvText.split('\n');
  
  if (bankType === 'scb') {
    return processSCBData(lines);
  } else if (bankType === 'citi') {
    return processCitiData(lines);
  } else if (bankType === 'hasb') {
    return processHASBData(lines);
  } else {
    return processHSBCData(lines);
  }
};

// Process HSBC format
const processHSBCData = (lines) => {
  const headers = lines[0].split(',').map(h => h.trim());
  const processedData = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '') continue;
    
    // Handle CSV parsing more robustly to account for quoted values
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add the last value
    
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    // Add bank type to each transaction
    row.bankType = 'hsbc';
    
    processedData.push(row);
  }
  
  return processedData;
};

// Process SCB format
const processSCBData = (lines) => {
  const processedData = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.includes('A. Point Card') || line.includes('日期') || 
        line.includes('帐户结余') || line.includes('信贷额') || line.includes('到期缴款日') || 
        line.includes('最低付款额') || line.includes('已志账项结余')) {
      continue;
    }
    
    // Skip header lines and empty lines
    if (line.includes('进支详列') || line.includes('港币银码') || line.includes('外币银码')) {
      continue;
    }
    
    // Parse SBC transaction line
    // Format: date, description, amount, foreign_amount
    const parts = line.split(',');
    if (parts.length >= 3) {
      const date = parts[0].trim();
      const description = parts[1].trim();
      const amountStr = parts[2].trim();
      
      // Skip if no valid date or amount
      if (!date || !amountStr || date === '日期') {
        continue;
      }
      
      // Parse amount and determine transaction type
      const amountMatch = amountStr.match(/HKD\s*([\d,]+\.?\d*)\s*(DR|CR)/);
      if (!amountMatch) continue;
      
      const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      const transactionType = amountMatch[2];
      
      // Convert SBC format to HSBC format
      const row = {
        'Transaction date': date,
        'Description': description,
        'Billing amount': transactionType === 'DR' ? `-${amount.toFixed(2)}` : amount.toFixed(2),
        'Billing currency': 'HKD',
        'Transaction status': 'POSTED',
        'Credit / Debit': transactionType === 'DR' ? 'DEBIT' : 'CREDIT',
        'bankType': 'scb'
      };
      
      processedData.push(row);
    }
  }
  
  return processedData;
};

// Process Citi format
const processCitiData = (lines) => {
  const processedData = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Handle CSV parsing more robustly to account for quoted values
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add the last value
    
    // Citi format: "Date","Description","Amount","","Card Number"
    if (values.length >= 3) {
      const date = values[0].replace(/"/g, '').trim();
      const description = values[1].replace(/"/g, '').trim();
      const amountStr = values[2].replace(/"/g, '').trim();
      
      // Skip if no valid date or amount
      if (!date || !amountStr) {
        continue;
      }
      
      // Parse amount
      const amount = parseFloat(amountStr);
      if (isNaN(amount)) continue;
      
      // Determine transaction type based on amount sign
      const transactionType = amount < 0 ? 'DEBIT' : 'CREDIT';
      
      // Convert Citi format to HSBC format
      const row = {
        'Transaction date': formatDateByBank(date, 'citi'),
        'Description': description,
        'Billing amount': amount.toFixed(2),
        'Billing currency': 'HKD',
        'Transaction status': 'POSTED',
        'Credit / Debit': transactionType,
        'bankType': 'citi'
      };
      
      processedData.push(row);
    }
  }
  
  return processedData;
};

// Process HASB format
const processHASBData = (lines) => {
  const processedData = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // HASB format: Transaction Date\tPost Date\tDescription\tAmount
    // Split by tab character
    const parts = line.split('\t');
    
    if (parts.length >= 4) {
      const transactionDate = parts[0].trim();
      const postDate = parts[1].trim();
      const description = parts[2].trim();
      const amountStr = parts[3].trim();
      
      // Skip if no valid date or amount
      if (!transactionDate || !amountStr) {
        continue;
      }
      
      // Parse amount - handle both positive and negative amounts
      let amount;
      let transactionType;
      
      if (amountStr.includes('CR')) {
        // Credit transaction
        const numericAmount = parseFloat(amountStr.replace('HKD', '').replace('CR', '').trim());
        amount = numericAmount;
        transactionType = 'CREDIT';
      } else {
        // Debit transaction (default)
        const numericAmount = parseFloat(amountStr.replace('HKD', '').trim());
        amount = -numericAmount; // Make it negative for debit
        transactionType = 'DEBIT';
      }
      
      if (isNaN(amount)) continue;
      
      // Convert HASB format to HSBC format
      const row = {
        'Transaction date': formatDateByBank(transactionDate, 'hasb'),
        'Description': description,
        'Billing amount': amount.toFixed(2),
        'Billing currency': 'HKD',
        'Transaction status': 'POSTED',
        'Credit / Debit': transactionType,
        'bankType': 'hasb'
      };
      
      processedData.push(row);
    }
  }
  
  return processedData;
};

// Duplicate detection function
export const filterDuplicates = (newTransactions, existingTransactions) => {
  const existingKeys = new Set(
    existingTransactions.map(t => `${t['bankType']}-${t['Transaction date']}-${t['Billing amount']}`)
  );
  
  return newTransactions.filter(t => {
    const key = `${t['bankType']}-${t['Transaction date']}-${t['Billing amount']}`;
    return !existingKeys.has(key);
  });
};

// Local storage utilities
export const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

export const loadFromLocalStorage = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
}; 