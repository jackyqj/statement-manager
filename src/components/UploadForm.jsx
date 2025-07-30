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
      <FormGroup>
        <Label htmlFor="bank-select">
          Select Bank: {selectedBank && (
            <span style={{color: '#28a745', fontWeight: 'normal'}}>
              ✓ {selectedBank.toUpperCase()}
            </span>
          )}
        </Label>
        <Select
          id="bank-select"
          value={selectedBank}
          onChange={onBankChange}
        >
          <option value="">Choose a bank...</option>
          <option value="hsbc">HSBC</option>
          <option value="hsb">HSB</option>
          <option value="scb">SCB</option>
          <option value="citi">Citi</option>
        </Select>
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="file-input">
          Upload CSV File: {selectedFile && (
            <span style={{color: '#28a745', fontWeight: 'normal'}}>
              ✓ {selectedFile.name}
            </span>
          )}
        </Label>
        <FileInput
          id="file-input"
          type="file"
          accept=".csv"
          onChange={onFileChange}
        />
      </FormGroup>
      
      <UploadButton
        onClick={onUpload}
        disabled={!selectedFile || !selectedBank || isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Upload & Process'}
      </UploadButton>
    </UploadSection>
  );
};

export default UploadForm; 