import React from 'react';


const OutputPanel = ({ outputCode }) => {
  return (
    <div className="flex justify-center">
      <div className="w-64 h-64 border-2 border-blue-500 rounded-lg shadow-lg overflow-hidden bg-white">
        <iframe
          className="w-full h-full border-none"
          title="Code Output"
          sandbox="allow-scripts"
          srcDoc={outputCode}
        />
      </div>
    </div>
  );
};

export default OutputPanel;
