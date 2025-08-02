import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FormGroup, 
  Label, 
  Select, 
  FileInput, 
  UploadButton, 
  Message 
} from '../styles/StyledComponents';

const UploadFormContainer = styled.div`
  width: 100%;
`;

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  justify-content: flex-end;
`;

const CancelButton = styled.button`
  background: #6c757d;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background: #5a6268;
  }
`;

const UploadForm = ({ onUpload, onCancel }) => {
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [isUploading, setIsUploading] = useState(false);

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
    if (!selectedBank || !selectedFile) {
      setMessage('Please select both a bank and a file.');
      setMessageType('error');
      return;
    }

    setIsUploading(true);
    setMessage('');

    try {
      await onUpload(selectedFile, selectedBank);
      setMessage('File uploaded successfully!');
      setMessageType('success');
      
      // Reset form after successful upload
      setTimeout(() => {
        setSelectedBank('');
        setSelectedFile(null);
        setMessage('');
        setIsUploading(false);
        // Clear file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
      }, 1500); // Show success message for 1.5 seconds
      
    } catch (error) {
      setMessage('Error uploading file. Please try again.');
      setMessageType('error');
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedBank('');
    setSelectedFile(null);
    setMessage('');
    setIsUploading(false);
    if (onCancel) onCancel();
  };

  return (
    <UploadFormContainer>
      <FormGroup>
        <Label htmlFor="bank-select">Select Bank:</Label>
        <Select
          id="bank-select"
          value={selectedBank}
          onChange={handleBankChange}
          disabled={isUploading}
        >
          <option value="">Choose a bank...</option>
          <option value="hsbc">HSBC</option>
          <option value="hasb">HASB</option>
          <option value="scb">SCB</option>
          <option value="citi">Citi</option>
          <option value="localstorage">LocalStorage</option>
        </Select>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="file-input">Select CSV File:</Label>
        <FileInput
          id="file-input"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </FormGroup>

      {message && (
        <Message className={messageType}>
          {message}
        </Message>
      )}

      <FormActions>
        <CancelButton onClick={handleCancel} disabled={isUploading}>
          Cancel
        </CancelButton>
        <UploadButton onClick={handleUpload} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Statement'}
        </UploadButton>
      </FormActions>
    </UploadFormContainer>
  );
};

export default UploadForm; 