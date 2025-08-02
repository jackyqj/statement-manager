import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const MenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const MenuButton = styled.button`
  padding: 8px 16px;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 20px;
  background: rgba(255,255,255,0.1);
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: rgba(255,255,255,0.2);
  }
`;

const MenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  min-width: 200px;
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.2s ease;
`;

const MenuItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #495057;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: background-color 0.2s;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:first-child {
    border-radius: 8px 8px 0 0;
  }
  
  &:last-child {
    border-radius: 0 0 8px 8px;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #e9ecef;
  }
`;

const MenuDivider = styled.div`
  height: 1px;
  background: #e9ecef;
  margin: 4px 0;
`;

const ActionMenu = ({ 
  onUpload, 
  onSave, 
  onExport, 
  onClear, 
  hasData = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleAction = (action) => {
    setIsOpen(false);
    action();
  };

  return (
    <MenuContainer ref={menuRef}>
      <MenuButton onClick={handleMenuToggle}>
        ⚙️ Actions
        <span style={{ fontSize: '12px' }}>▼</span>
      </MenuButton>
      
      <MenuDropdown $isOpen={isOpen}>
        <MenuItem onClick={() => handleAction(onUpload)}>
          📄 Upload Statement
        </MenuItem>
        
        {hasData && (
          <>
            <MenuDivider />
            <MenuItem onClick={() => handleAction(onSave)}>
              💾 Save to LocalStorage
            </MenuItem>
            <MenuItem onClick={() => handleAction(onExport)}>
              📤 Export to CSV
            </MenuItem>
            <MenuDivider />
            <MenuItem onClick={() => handleAction(onClear)}>
              🗑️ Clear All Data
            </MenuItem>
          </>
        )}
      </MenuDropdown>
    </MenuContainer>
  );
};

export default ActionMenu; 