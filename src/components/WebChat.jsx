import React from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function WebChat() {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleChat}
        className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Toggle chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="mt-2 w-80 h-[500px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <header className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-800/80 border-b border-gray-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-slate-100 flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-500" /> Assistant
            </h3>
            <button
              onClick={toggleChat}
              className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
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
