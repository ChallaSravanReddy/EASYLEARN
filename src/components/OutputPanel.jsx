import React from 'react';

const OutputPanel = ({ outputCode }) => {
  return (
    <div className="w-full h-full bg-[#0d1117] overflow-hidden">
      <iframe
        className="w-full h-full border-none"
        title="Terminal Output"
        sandbox="allow-scripts"
        srcDoc={outputCode}
      />
    </div>
  );
};

export default OutputPanel;
