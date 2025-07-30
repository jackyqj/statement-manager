// Date formatting function
export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  
  // Handle DD/MM/YYYY format
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  
  return dateStr;
};

// CSV processing function
export const processCSV = (csvText, bankType) => {
  const lines = csvText.split('\n');
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
    row.bankType = bankType;
    
    processedData.push(row);
  }
  
  return processedData;
};

// Duplicate detection function
export const filterDuplicates = (newTransactions, existingTransactions) => {
  const existingKeys = new Set(
    existingTransactions.map(t => `${t['Transaction date']}-${t['Billing amount']}`)
  );
  
  return newTransactions.filter(t => {
    const key = `${t['Transaction date']}-${t['Billing amount']}`;
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