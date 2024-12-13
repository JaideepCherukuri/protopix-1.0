import React from 'react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Check } from 'lucide-react';

const InvestmentReceipt = ({ transaction, onClose }) => {
  const navigate = useNavigate();

  const handleOpenPortfolio = () => {
    onClose();
    navigate('/portfolio');
  };

  if (!transaction || !transaction.investmentDetails) {
    return null;
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl max-w-md w-full shadow-xl relative">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>

      <div className="p-6 border-b border-gray-100">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-6 h-6 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-center mb-1">Investment Successful</h3>
        <p className="text-gray-500 text-center text-sm">
          Your investment has been processed successfully
        </p>
      </div>

      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
          <div className="flex items-center space-x-3">
            <img src="https://imgur.com/nIelz0g.png" alt="USDT" className="w-8 h-8" />
            <div>
              <h3 className="text-xl font-bold text-green-800">{transaction.amount} {transaction.currency}</h3>
              <p className="text-sm text-gray-600">Investment Amount</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatDate(transaction.date)}</span>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="mb-4 p-3 bg-blue-50 rounded-xl">
          <div className="flex flex-col space-y-2">
            <span className="text-xs text-gray-500">Transaction Hash</span>
            <div className="flex items-center justify-between bg-white/50 px-3 py-2 rounded-lg">
              <span className="font-mono text-xs text-gray-600 break-all">{transaction.hash}</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(transaction.hash);
                    toast.success('Hash copied to clipboard');
                  }}
                  className="p-1.5 text-gray-500 hover:text-gray-700 bg-white rounded-lg border border-gray-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </button>
                <a
                  href={`${transaction.explorer}/tx/${transaction.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-gray-500 hover:text-gray-700 bg-white rounded-lg border border-gray-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-900 mb-4">Investment Details</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Investment Type</p>
            <p className="mt-1 font-medium text-gray-900">{transaction.investmentDetails.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Expected APY</p>
            <p className="mt-1 font-medium text-green-600">{transaction.investmentDetails.apy}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Lock Period</p>
            <p className="mt-1 font-medium text-gray-900">{transaction.investmentDetails.lockin}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Expected Return</p>
            <p className="mt-1 font-medium text-gray-900">${transaction.investmentDetails.expectedReturn}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tokens Received</p>
            <p className="mt-1 font-medium text-gray-900">{transaction.tokensReceived} PIXX</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Token Price</p>
            <p className="mt-1 font-medium text-gray-900">${transaction.tokenPrice}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="text-center text-xs text-gray-400">
          <p>This is a cryptographically verified receipt</p>
          <p>All transactions are permanently recorded on blockchain</p>
        </div>
      </div>

      <div className="p-6">
        <button
          onClick={handleOpenPortfolio}
          className="w-full bg-[#d71921] text-white py-3 rounded-xl font-medium hover:bg-[#b5171a] transition-colors"
        >
          Open Portfolio
        </button>
      </div>
    </div>
  );
};

export default InvestmentReceipt; 