import React from 'react';
import { CheckCircle, Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const TransactionReceipt = ({ 
  isOpen, 
  onClose, 
  transaction,
  investment
}) => {
  if (!isOpen) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-3xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Investment Successful</h2>
          <p className="text-gray-300 text-center">Your transaction has been confirmed</p>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Investment Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Investment</p>
                  <p className="font-medium">{investment.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{investment.assetType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-medium">${investment.amount} USDT</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">APY</p>
                  <p className="font-medium text-green-600">{investment.floatingapy}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tenure</p>
                  <p className="font-medium">{investment.tenure} months</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Network</p>
                  <p className="font-medium">{transaction.network}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Transaction Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">From</p>
                    <p className="font-medium">{formatAddress(transaction.from)}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(transaction.from)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">To</p>
                    <p className="font-medium">{formatAddress(transaction.to)}</p>
                  </div>
                  <button 
                    onClick={() => copyToClipboard(transaction.to)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Transaction Hash</p>
                    <p className="font-medium">{formatAddress(transaction.hash)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => copyToClipboard(transaction.hash)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <Copy className="w-4 h-4 text-gray-400" />
                    </button>
                    <a 
                      href={`${transaction.explorer}/tx/${transaction.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-500">Gas Spent</p>
                    <p className="font-medium">{transaction.gasSpent} BNB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 py-3 px-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionReceipt;