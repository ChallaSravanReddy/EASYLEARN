import React, { useState } from 'react';

export default function WebChat() {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 1000 
    }}>
      <button
        onClick={toggleChat}
        style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#4CAF50',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }}
      >
        💬
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '70px',
          right: '0',
          width: '350px',
          height: '500px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 5px 40px rgba(0,0,0,0.16)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '10px',
            borderBottom: '1px solid #eee',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0 }}>Assistant</h3>
            <button 
              onClick={toggleChat}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px'
              }}
            >
              ×
            </button>
          </div>
          <div style={{ flex: 1, padding: '15px', overflowY: 'auto' }}>
            <p>Welcome! How can I help you today?</p>
          </div>
          <div style={{ padding: '10px', borderTop: '1px solid #eee' }}>
            <input
              type="text"
              placeholder="Type your message..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                outline: 'none'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
