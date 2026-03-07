import React from 'react';

export default function WebChat() {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleChat}
        className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-600 transition"
        aria-label="Toggle chat"
      >
        <span className="text-2xl">💬</span>
      </button>

      {isOpen && (
        <div className="mt-2 w-80 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <header className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b">
            <h3 className="text-sm font-semibold text-gray-800">Assistant</h3>
            <button
              onClick={toggleChat}
              className="text-gray-600 hover:text-gray-800 focus:outline-none"
              aria-label="Close chat"
            >
              ×
            </button>
          </header>
          <div className="flex-1 p-4 overflow-y-auto text-sm text-gray-700">
            <p>Welcome! How can I help you today?</p>
          </div>
          <footer className="px-4 py-2 border-t">
            <input
              type="text"
              placeholder="Type your message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </footer>
        </div>
      )}
    </div>
  );
}
