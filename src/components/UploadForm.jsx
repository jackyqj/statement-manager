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

    try {
      await onUpload(selectedFile, selectedBank);
      setMessage('File uploaded successfully!');
      setMessageType('success');
      // Reset form
      setSelectedBank('');
      setSelectedFile(null);
      // Clear file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      setMessage('Error uploading file. Please try again.');
      setMessageType('error');
    }
  };

  const handleCancel = () => {
    setSelectedBank('');
    setSelectedFile(null);
    setMessage('');
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
        />
      </FormGroup>

      {message && (
        <Message className={messageType}>
          {message}
        </Message>
      )}

      <FormActions>
        <CancelButton onClick={handleCancel}>
          Cancel
        </CancelButton>
        <UploadButton onClick={handleUpload}>
          Upload Statement
        </UploadButton>
      </FormActions>
    </UploadFormContainer>
  );
};

export default UploadForm; 