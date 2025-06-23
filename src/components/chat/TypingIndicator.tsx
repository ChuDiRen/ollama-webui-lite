import React from 'react'

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-center px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md shadow-lg max-w-fit">
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        />
        <div
          className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        />
        <div
          className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        />
      </div>
    </div>
  )
}

export default TypingIndicator
