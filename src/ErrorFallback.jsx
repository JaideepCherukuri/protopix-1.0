import React from 'react';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Something went wrong
          </h2>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              {error.message || 'An unexpected error occurred'}
            </p>
          </div>

          <button
            onClick={resetErrorBoundary}
            className="bg-[#d71921] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#b5171a] transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback; 