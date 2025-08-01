import React from 'react';
import {
  UploadSection,
  FormGroup,
  Label,
  Select,
  FileInput,
  UploadButton
} from '../styles/StyledComponents';

const UploadForm = ({
  selectedBank,
  selectedFile,
  isProcessing,
  onBankChange,
  onFileChange,
  onUpload
}) => {
  return (
    <UploadSection>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '180px' }}>
          <Select
            id="bank-select"
            value={selectedBank}
            onChange={onBankChange}
            style={{ marginBottom: '0' }}
          >
            <option value="">Choose a bank...</option>
            <option value="hsbc">HSBC</option>
            <option value="hasb">HASB</option>
            <option value="scb">SCB</option>
            <option value="citi">Citi</option>
            <option value="localstorage">LocalStorage</option>
          </Select>
          {selectedBank && (
            <div style={{ 
              fontSize: '12px', 
              color: '#28a745', 
              marginTop: '4px',
              fontWeight: '500'
            }}>
              ✓ {selectedBank.toUpperCase()}
            </div>
          )}
        </div>
        
        <div style={{ flex: '2', minWidth: '280px' }}>
          <FileInput
            id="file-input"
            type="file"
            accept=".csv"
            onChange={onFileChange}
            style={{ marginBottom: '0' }}
          />
          {selectedFile && (
            <div style={{ 
              fontSize: '12px', 
              color: '#28a745', 
              marginTop: '4px',
              fontWeight: '500'
            }}>
              ✓ {selectedFile.name}
            </div>
          )}
        </div>
        
        <div style={{ flex: '0 0 auto' }}>
          <UploadButton
            onClick={onUpload}
            disabled={!selectedFile || !selectedBank || isProcessing}
            style={{ marginBottom: '0' }}
          >
            {isProcessing ? 'Processing...' : 'Upload & Process'}
          </UploadButton>
        </div>
      </div>
    </UploadSection>
  );
};

export default UploadForm; 