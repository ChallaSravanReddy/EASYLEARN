import React from 'react';
import './timeline-styles.css'; // import the CSS that contains .output-panel-container


const OutputPanel = ({ outputCode }) => {
  const styles = {
    panel: {
      width: '200px',
      height: '200px',
      border: '2px solid #007acc',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      overflow: 'hidden',
      background: 'white',
    },
    iframe: {
      width: '100%',
      height: '100%',
      border: 'none',
    },
  };

  return (
    <div className="output-panel-container">
    <div style={styles.panel}>
      <iframe
        style={styles.iframe}
        title="Code Output"
        sandbox="allow-scripts"
        srcDoc={outputCode}
      />
    </div>
  </div>
  );
};

export default OutputPanel;
