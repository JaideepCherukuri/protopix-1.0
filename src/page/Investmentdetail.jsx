import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../components/Modal';
import ConnectButton from '../ConnectButton';
import { useAppKit } from '@reown/appkit/react';
import BottomNavigation from '../components/BottomNavigation';
import { useAccount } from 'wagmi';
import { useLocation } from 'react-router-dom';
import { ethers } from 'ethers';
import axios from 'axios';
import { 
  ChevronDown, 
  ArrowUpRight, 
  FileText, 
  Shield, 
  Building2, 
  Calendar,
  TrendingUp,
  Wallet,
  Clock,
  BadgeCheck,
  Download,
  DollarSign,
  Bitcoin,
  RefreshCw,
  Fuel,
  ArrowLeftRight,
  Globe,
  Mail,
  Copy,
  Lock,
  ExternalLink
} from 'lucide-react';
import { parseUnits } from 'viem';
import { 
  useWriteContract,
  useWaitForTransactionReceipt,
  useSimulateContract
} from 'wagmi';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';
import { motion, useAnimation } from "framer-motion";

import { saveTransaction } from '../utils/transactionStorage';
import InvestmentReceipt from '../components/InvestmentReceipt';
import { addInvestment } from '../utils/portfolioStorage';

// USDT token addresses based on network
const USDT_TOKENS = {
  mainnet: {
    network: "BSC Mainnet",
    name: "USDT",
    address: "0x55d398326f99059fF775485246999027B3197955",
    symbol: "USDT",
    decimals: 18,
    chainId: 56
  },
  testnet: {
    network: "BSC Testnet",
    name: "USDT",
    address: "0x53A5E28C96c5c886A56711021fFCA19650D20bBf",
    symbol: "USDT",
    decimals: 18,
    chainId: 97
  }
};

const DetailSection = ({ title, children }) => (
  <div className="border-b border-gray-200 py-6">
    <h3 className="text-lg font-semibold mb-4">{title}</h3>
    {children}
  </div>
);
const BSC_SCAN_API_KEY = 'GH8RED93CMI9YPHPW9WDJFKJ27G3EU475T';
const USDT_CONTRACT_ADDRESSES = {
  mainnet: '0x55d398326f99059fF775485246999027B3197955',
  testnet: '0x53A5E28C96c5c886A56711021fFCA19650D20bBf'
};

const BSC_SCAN_ENDPOINTS = {
  mainnet: 'https://api.bscscan.com/api',
  testnet: 'https://api-testnet.bscscan.com/api'
};

const USDT_ABI = [
  {
    "constant": true,
    "inputs": [{"name": "_owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "balance", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_spender", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      {"name": "_to", "type": "address"},
      {"name": "_value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      {"name": "_owner", "type": "address"},
      {"name": "_spender", "type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  }
];

const StatCard = ({ label, value, subtext }) => (
  <div className="bg-[rgba(31,41,45,0.3)] rounded-xl p-4">
    <p className="text-sm text-white-900 mb-1">{label}</p>
    <p className="text-l font-semibold mb-1">{value}</p>
    
  </div>
);

const HighlightCard = ({ title, description, fullWidth }) => (
    <div className={`bg-gray-900 text-white p-8 rounded-2xl ${fullWidth ? 'col-span-full' : ''}`}>
      <h3 className="text-xl font-serif mb-4 text-cream">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  );

const USDT_RECIPIENT = import.meta.env.VITE_USDT_RECIPIENT;

// Add this helper function for better error messages
const getErrorMessage = (error) => {
  if (!error) return 'Transaction failed';
  
  // Handle common errors
  if (error.message?.includes('insufficient funds')) {
    return 'Insufficient funds to cover gas fees';
  }
  if (error.message?.includes('user rejected')) {
    return 'Transaction was rejected';
  }
  if (error.message?.includes('allowance')) {
    return 'Please approve USDT spending first';
  }
  if (error.message?.includes('invalid address')) {
    return 'Invalid recipient address. Please try again.';
  }
  if (!USDT_RECIPIENT) {
    return 'Configuration error: Recipient address not set';
  }
  
  return error.message || 'Transaction failed';
};

// Add this component at the top level
const TransactionStatus = ({ status, message, error, details, hash, explorerUrl }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  if (!status) return null;

  return (
    <div className={`mt-4 p-4 rounded-xl border ${getStatusColor()}`}>
      <div className="flex items-center space-x-3">
        {status === 'loading' && (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {status === 'success' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        )}
        {status === 'error' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <div className="flex-1">
          <p className="font-medium">{message}</p>
          {details && <p className="text-sm mt-1">{details}</p>}
          {error && <p className="text-sm mt-1 text-red-600">{error}</p>}
          {hash && explorerUrl && (
            <a 
              href={`${explorerUrl}/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-2 space-x-1"
            >
              <span>View on Explorer</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

// Add the swipe animation styles
const swipeAnimationStyles = `
  @keyframes swipeArrows {
    0% { opacity: 0.4; transform: translateX(3px); }
    50% { opacity: 0.8; transform: translateX(-3px); }
    100% { opacity: 0.4; transform: translateX(3px); }
  }
  .swipe-indicator {
    animation: swipeArrows 1.5s ease-in-out infinite;
  }
  .left-arrow { animation-delay: 0s; }
  .right-arrow { animation-delay: 0.2s; }
`;

const ProgressBar = ({ progress, timeRemaining }) => (
  <div className="mt-3 w-full space-y-2">
    <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">
      <div 
        className="absolute h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
      </div>
    </div>
    <div className="flex justify-between text-xs text-gray-600 font-medium px-1">
      <div className="flex items-center space-x-2">
        <svg className="w-4 h-4 text-blue-600 animate-spin" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <span>{progress}% Complete</span>
      </div>
      <span className="text-indigo-600">{timeRemaining}</span>
    </div>
  </div>
);

const SwipeIndicator = () => (
  <div className="absolute bottom-1 left-0 right-0 flex justify-center items-center space-x-1 py-1 pointer-events-none opacity-70">
    <style>{swipeAnimationStyles}</style>
    <span className="text-xs text-gray-500 swipe-indicator left-arrow">⟪</span>
    <span className="text-xs text-gray-500 font-medium">swipe to dismiss</span>
    <span className="text-xs text-gray-500 swipe-indicator right-arrow">⟫</span>
  </div>
);

const TransactionToast = ({ config }) => (
  <div className="w-full max-w-md bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100/50 overflow-hidden">
    <div className="p-4 relative">
      <div className="flex items-start space-x-3">
        {config.icon}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 font-['SF Pro Text']">
            {config.title}
          </p>
          <p className="mt-1 text-sm text-gray-600 font-['SF Pro Text']">
            {config.message}
          </p>
        </div>
      </div>
      
      {config.progress && (
        <ProgressBar 
          progress={config.progress} 
          timeRemaining={config.timeRemaining}
        />
      )}

      {config.swipeable && <SwipeIndicator />}
    </div>
  </div>
);

const ToastContent = ({ config }) => {
  const controls = useAnimation();
  
  const handleDragEnd = (event, info) => {
    if (Math.abs(info.offset.x) > 100) {
      controls.start({ x: info.offset.x < 0 ? -500 : 500, opacity: 0 })
        .then(() => {
          document.dispatchEvent(new CustomEvent('closeToast'));
        });
    } else {
      controls.start({ x: 0, opacity: 1 });
    }
  };

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      initial={{ opacity: 0, y: -20 }}
      animate={controls}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Box
        p={4}
        bg="white"
        rounded="xl"
        shadow="xl"
        border="1px"
        borderColor="gray.100"
        maxW="400px"
        position="relative"
        overflow="hidden"
        {...config.containerStyle}
      >
        <VStack spacing={3} width="100%" pb={config.swipeable ? "6" : "0"}>
          {/* Header */}
          <HStack spacing={3} width="100%">
            {config.icon}
            <VStack align="start" spacing={1} flex={1}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                {config.title}
              </Text>
              <Text fontSize="sm" color="gray.600">
                {config.message}
              </Text>
            </VStack>
          </HStack>

          {/* Progress Bar */}
          {config.progress && (
            <Box width="100%">
              <Box width="100%" height="2" bg="gray.100" rounded="full" overflow="hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${config.progress}%` }}
                  transition={{ duration: 0.5 }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(to right, #3b82f6, #6366f1)',
                    borderRadius: 'inherit'
                  }}
                />
              </Box>
              <HStack justify="space-between" mt={1} fontSize="xs" color="gray.500">
                <Text>{config.progress}% Complete</Text>
                {config.timeRemaining && (
                  <Text color="indigo.600">{config.timeRemaining}</Text>
                )}
              </HStack>
            </Box>
          )}

          {/* Action Buttons */}
          {config.actionButtons && (
            <HStack spacing={2} justify="flex-end" width="100%">
              {config.actionButtons.map((button, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={button.onClick}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    button.variant === 'solid'
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {button.label}
                </motion.button>
              ))}
            </HStack>
          )}
        </VStack>

        {/* Swipe Indicator */}
        {config.swipeable && (
          <Box
            position="absolute"
            bottom={1}
            left={0}
            right={0}
            display="flex"
            justifyContent="center"
            alignItems="center"
            pointerEvents="none"
            opacity={0.7}
          >
            <style>{swipeAnimationStyles}</style>
            <Text fontSize="xs" color="gray.500" className="swipe-indicator left-arrow">⟪</Text>
            <Text fontSize="xs" color="gray.500" mx={1}>swipe to dismiss</Text>
            <Text fontSize="xs" color="gray.500" className="swipe-indicator right-arrow">⟫</Text>
          </Box>
        )}
      </Box>
    </motion.div>
  );
};

const showToast = (type, title, config) => {
  const toastConfig = {
    duration: config?.duration || 5000,
    position: 'top-center',
    style: {
      maxWidth: '32rem',
      background: 'transparent',
      padding: '0',
      boxShadow: 'none'
    }
  };

  return toast(
    <ToastContent
      config={{
        ...config,
        title,
        type,
        swipeable: true,
        containerStyle: {
          background: type === 'error'
            ? 'linear-gradient(to right, #fef2f2, #fee2e2)'
            : 'linear-gradient(to right, #f5f3ff, #ede9fe)',
          borderLeft: `4px solid ${
            type === 'error' ? '#dc2626' : '#6366f1'
          }`
        }
      }}
    />,
    toastConfig
  );
};

// Update the handleInvestNow function to use the new toast
const handleInvestNow = async () => {
  try {
    // Show approval request toast
    const approvalToastId = showToast('processing', null, {
      message: '📱 Action Required: Sign Transaction',
      details: 'Please approve USDT spending in your wallet',
      icon: (
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
      progress: 25,
      timeRemaining: 'Estimated: 30s',
      actionButtons: [
        {
          label: '������ Retry',
          onClick: handleApproveAndTransfer,
          variant: 'solid'
        },
        {
          label: '❌ Cancel',
          onClick: handleCancelTransaction,
          variant: 'ghost'
        }
      ]
    });

    // Rest of the function remains the same...
  } catch (error) {
    showToast('error', null, {
      message: '❌ Transaction Failed',
      details: getErrorMessage(error),
      icon: (
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      ),
      actionButtons: [
        {
          label: '🔄 Try Again',
          onClick: handleApproveAndTransfer,
          variant: 'solid'
        }
      ]
    });
  }
};

// Add the receipt component with a different name
const InvestmentTransactionReceipt = ({ transaction, onClose }) => (
  <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden relative">
    {/* Success Header */}
    <div className="text-center py-8 bg-gradient-to-r from-green-50 to-emerald-50">
      <div className="mb-4">
        <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-gray-800">Investment Successful!</h2>
      <p className="text-gray-600">Transaction confirmed on blockchain</p>
    </div>

    {/* Amount Section */}
    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6">
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
          <span>{new Date(transaction.date).toLocaleString()}</span>
        </div>
      </div>
    </div>

    {/* Transaction Hash */}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
              <a
                href={transaction.explorer + '/tx/' + transaction.hash}
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

    {/* Investment Details */}
    <div className="px-6 py-4 bg-gray-50">
      <h4 className="text-sm font-medium text-gray-900 mb-4">Investment Details</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Investment Type</p>
          <p className="mt-1 font-medium text-red-900">{transaction.investmentDetails.title}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Expected APY</p>
          <p className="mt-1 font-medium text-xl text-green-600">{transaction.investmentDetails.apy}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Lock-in Period</p>
          <p className="mt-1 font-light text-gray-900">{transaction.investmentDetails.tenure} months</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Expected Return</p>
          <p className="mt-1 font-medium text-xl text-green-900">{transaction.investmentDetails.expectedReturn} {transaction.currency}</p>
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
      <div className="text-center text-xs text-gray-400">
        <p>This is a cryptographically verified receipt</p>
        <p>All transactions are permanently recorded on blockchain</p>
      </div>
    </div>
  </div>
);

// Add this helper function
const getNetworkName = (networkId) => {
  switch (networkId) {
    case '97':
      return { name: 'BSC Testnet', color: 'text-gray-500' };
    case '56':
      return { name: 'BSC Mainnet', color: 'text-yellow-500' };
    default:
      return { name: 'Unknown Network', color: 'text-gray-500' };
  }
};

// Update the fetchUSDTBalance function with better error handling
const fetchUSDTBalance = async (address, isConnected, setIsLoading, setUsdtBalance) => {
  if (!address || !isConnected) {
    console.log('Skipping balance fetch: No address or not connected');
    return;
  }

  setIsLoading(true);
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Ensure provider is ready
    await provider.ready;
    
    const networkId = await provider.getNetwork().then(net => net.chainId.toString());
    const networkType = networkId === '97' ? 'testnet' : 'mainnet';
    const contractAddress = USDT_CONTRACT_ADDRESSES[networkType];

    console.log('Fetching balance with params:', {
      address,
      contractAddress,
      networkId,
      networkType
    });

    // Validate contract address
    if (!contractAddress) {
      throw new Error('Invalid network or missing contract address');
    }

    const usdtContract = new ethers.Contract(
      contractAddress,
      USDT_ABI,
      provider
    );

    try {
      const balance = await usdtContract.balanceOf(address);
      console.log('Raw balance:', balance.toString());
      const formattedBalance = ethers.utils.formatUnits(balance, 18);
      console.log('Formatted balance:', formattedBalance);
      setUsdtBalance(parseFloat(formattedBalance).toFixed(2));
    } catch (contractError) {
      console.error('Contract call error:', {
        error: contractError,
        code: contractError.code,
        message: contractError.message,
        data: contractError.data
      });
      throw new Error(`Contract call failed: ${contractError.message}`);
    }
  } catch (error) {
    console.error('Error fetching USDT balance:', error);
    toast.error('Failed to fetch USDT balance. Please check your network connection.');
    setUsdtBalance('0.00');
  } finally {
    setIsLoading(false);
  }
};

// Add this helper function to get the opposite network info
const getOppositeNetwork = (currentNetworkId) => {
  switch (currentNetworkId) {
    case '97':
      return { id: '56', name: 'Switch to Mainnet', color: 'text-green-500' };
    case '56':
      return { id: '97', name: 'Switch to Testnet', color: 'text-yellow-500' };
    default:
      return { id: '97', name: 'Switch Network', color: 'text-gray-500' };
  }
};

// Add this helper function for gas price conversion
const getGasInUSD = (bnbAmount) => {
  // Assuming BNB price is $220 (you might want to fetch this dynamically)
  const BNB_PRICE_USD = 220;
  return (parseFloat(bnbAmount) * BNB_PRICE_USD).toFixed(2);
};

export default function InvestmentDetail() {
  const location = useLocation();
  const [investmentAmount, setInvestmentAmount] = useState('');
  const { 
    title = '',
    floatingapy = '0%',
    description = '',
    hashtag = '',
    backgroundImageUrl = '',
    lockin = '12 months',
    redemption = 'quarterly',
    paymentmethods = 'Stablecoins | Fiat | Crypto',
    assetType = '',
    capacity = '',
    totalInvested = '$0',
    provider = 'Pixx Finance',
    activestatus = 'Active',
    expectedReturn = '0%'
  } = location.state || {};
  const [expanded, setExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { connectStatus, walletBalances } = useAppKit();
  const { address, isConnected } = useAccount();
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [usdtBalance, setUsdtBalance] = useState('0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [investmentType, setInvestmentType] = useState('crypto'); // 'crypto' or 'fiat'
  // Add these near the top of InvestmentDetail component
const [selectedTenure, setSelectedTenure] = useState(24);
const MIN_TENURE = 3;
const MAX_TENURE = 24;
const RECOMMENDED_TENURE = 14;
const ANNUAL_RATE = parseFloat(floatingapy.replace('%', '')) / 100;// 9% APY

// Add this helper function
const calculateExpectedReturn = (amount, tenure) => {
  if (!amount) return 0;
  const monthlyRate = ANNUAL_RATE / 12;
  return (amount * (1 + monthlyRate * tenure)).toFixed(2);
};

  
  useEffect(() => {
    if (isConnected) {
      setShowAccountDetails(true);
    }
  }, [isConnected]);

  const handleInvestNowClick = () => {
    setIsModalOpen(true);
  };
  // Add this useEffect to fetch balance when address changes
  useEffect(() => {
    const handleChainChanged = async (chainId) => {
      const networkId = parseInt(chainId, 16).toString();
      console.log('Network changing to:', networkId);
      
      // Clear current balance while switching
      setUsdtBalance('0.00');
      setIsLoading(true);

      // Wait for network switch to complete
      try {
        // Wait for provider to be ready with new network
        await window.ethereum.request({ method: 'eth_chainId' });
        
        // Add additional delay to ensure network is fully switched
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('Network switch complete, fetching new balance...');
        
        if (address && isConnected) {
          await fetchUSDTBalance(address, isConnected, setIsLoading, setUsdtBalance);
        }
      } catch (error) {
        console.error('Error during network switch:', error);
        toast.error('Network switch failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    const handleAccountsChanged = async () => {
      console.log('Account changed, refreshing balance...');
      if (address && isConnected) {
        await fetchUSDTBalance(address, isConnected, setIsLoading, setUsdtBalance);
      }
    };

    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      // Initial fetch
      fetchUSDTBalance(address, isConnected, setIsLoading, setUsdtBalance);

      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [address, isConnected]); // Add dependencies

  const [showReceipt, setShowReceipt] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);

  // Add error state
  const [error, setError] = useState(null);

  // Update simulate contract with better error handling
  const { data: simulateData, error: simulateError } = useSimulateContract({
    address: USDT_CONTRACT_ADDRESSES[window.ethereum?.networkVersion === '97' ? 'testnet' : 'mainnet'],
    abi: USDT_ABI,
    functionName: 'transfer',
    args: [
      USDT_RECIPIENT,
      investmentAmount ? parseUnits(investmentAmount.toString(), 18) : 0n
    ],
    enabled: Boolean(investmentAmount && investmentAmount >= 1 && address && USDT_RECIPIENT),
    onError(err) {
      console.error('Simulation error:', {
        error: err,
        recipient: USDT_RECIPIENT,
        amount: investmentAmount,
        address
      });
      toast.error(getErrorMessage(err), {
        id: 'simulation-error',
      });
      setError(err);
    }
  });

  // Add logging to debug contract interaction
  useEffect(() => {
    if (simulateData) {
      console.log('Simulation data:', simulateData);
      console.log('Contract address:', USDT_CONTRACT_ADDRESSES[window.ethereum?.networkVersion === '97' ? 'testnet' : 'mainnet']);
      console.log('Network:', window.ethereum?.networkVersion);
      console.log('Recipient:', USDT_RECIPIENT);
      console.log('Amount:', investmentAmount);
    }
  }, [simulateData, investmentAmount]);

  // Update contract write with loading and error states
  const { 
    writeContract, 
    isLoading: isTransactionLoading,
    error: writeError
  } = useWriteContract({
    onError(err) {
      console.error('Write contract error:', err);
      setTransactionStatus({
        status: 'error',
        message: 'Transaction failed',
        error: err.message.includes('User denied') ? 'You rejected the transaction' : getErrorMessage(err)
      });
    }
  });

  // In your InvestmentDetail component, add a new state
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [isTransactionPending, setIsTransactionPending] = useState(false);

  // Update the handleConfirmInvestment function
  const [transactionStage, setTransactionStage] = useState('idle'); // 'idle', 'preparing', 'approving', 'processing', 'success'

  const handleConfirmInvestment = async () => {
    try {
      setError(null);
      setIsTransactionPending(true);
      setTransactionStage('preparing');
      
      if (!address || !investmentAmount) {
        throw new Error('Please connect wallet and enter investment amount');
      }

      // Calculate token price and tokens received
      const calculatedTokenPrice = 1.25; // You can make this dynamic based on your requirements
      const calculatedTokensReceived = parseFloat(investmentAmount) / calculatedTokenPrice;

      // Initialize provider and contract
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const currentToken = window.ethereum?.networkVersion === '97' ? USDT_TOKENS.testnet : USDT_TOKENS.mainnet;
      const tokenContract = new ethers.Contract(currentToken.address, USDT_ABI, signer);

      // Update UI to processing state
      setTransactionStage('processing');
      toast.loading('Processing your investment...', {
        id: 'investment',
        style: {
          background: '#18181b',
          color: '#fff',
          borderRadius: '14px',
          padding: '16px 24px',
        }
      });

      // Execute the transfer
      const transferTx = await tokenContract.transfer(
        USDT_RECIPIENT,
        ethers.utils.parseUnits(investmentAmount.toString(), 18)
      );

      toast.loading('Confirming transaction...', {
        id: 'investment',
        style: {
          background: '#18181b',
          color: '#fff',
          borderRadius: '14px',
          padding: '16px 24px',
        }
      });

      // Wait for transaction confirmation
      const receipt = await transferTx.wait();
      
      // Prepare transaction details
      const transactionDetails = {
        type: 'investment',
        hash: receipt.transactionHash,
        from: address,
        to: USDT_RECIPIENT,
        network: window.ethereum?.networkVersion === '97' ? 'BSC Testnet' : 'BSC Mainnet',
        explorer: window.ethereum?.networkVersion === '97' 
          ? 'https://testnet.bscscan.com'
          : 'https://bscscan.com',
        amount: investmentAmount,
        tokenPrice: calculatedTokenPrice,
        tokensReceived: calculatedTokensReceived,
        currency: 'USDT',
        date: new Date().toISOString(),
        status: 'completed',
        userAddress: address,
        investmentDetails: {
          title,
          provider: "Pixx Finance",
          assetType: hashtag,
          floatingapy: floatingapy,
          lockin,
          redemption,
          paymentmethods,
          capacity,
          apy: floatingapy,
          tenure: selectedTenure,
          expectedReturn: calculateExpectedReturn(investmentAmount, selectedTenure),
          backgroundImageUrl
        }
      };

      // Save transaction to storage and update portfolio
      addInvestment(transactionDetails);
      window.dispatchEvent(new CustomEvent('newTransaction'));
      
      // Update UI to success state
      setTransactionStage('success');
      toast.success('Investment Successful', {
        id: 'investment',
        duration: 5000,
        style: {
          background: '#18181b',
          color: '#fff',
          borderRadius: '14px',
          padding: '16px 24px',
        }
      });

      // Show receipt after a brief delay
      setTimeout(() => {
        setTransactionDetails(transactionDetails);
        setShowReceipt(true);
        setIsModalOpen(false);
      }, 1000);

    } catch (err) {
      console.error('Investment error:', err);
      setTransactionStage('idle');
      const errorMsg = err.message.includes('User denied') 
        ? 'Transaction was cancelled'
        : getErrorMessage(err);

      toast.error(errorMsg, {
        id: 'investment',
        style: {
          background: '#18181b',
          color: '#fff',
          borderRadius: '14px',
          padding: '16px 24px',
        }
      });
      setError(err);
    } finally {
      setIsTransactionPending(false);
    }
  };

  // Effect to handle errors
  useEffect(() => {
    if (simulateError || writeError) {
      const errorMessage = (simulateError || writeError)?.message || 'Transaction failed';
      console.log('Error details:', {
        simulateError,
        writeError
      });
      
      // Don't show duplicate error messages
      if (!transactionStatus?.error) {
        toast.error(errorMessage, {
          id: 'transaction-error'
        });
      }
    }
  }, [simulateError, writeError, transactionStatus]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Add this for debugging
  useEffect(() => {
    console.log('Environment variables:', {
      USDT_RECIPIENT,
      networkVersion: window.ethereum?.networkVersion,
      contractAddress: USDT_CONTRACT_ADDRESSES[window.ethereum?.networkVersion === '97' ? 'testnet' : 'mainnet']
    });
  }, []);

  // Investment button component with loading states
  const InvestmentButton = ({ onClick, disabled, stage }) => {
    const getButtonContent = () => {
      switch (stage) {
        case 'preparing':
          return (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Preparing...</span>
            </div>
          );
        case 'approving':
          return (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Awaiting Approval...</span>
            </div>
          );
        case 'processing':
          return (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </div>
          );
        case 'success':
          return (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Investment Successful</span>
            </div>
          );
        default:
          return 'Confirm Investment';
      }
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled || ['preparing', 'approving', 'processing'].includes(stage)}
        className={`w-full px-4 py-3 mt-6 rounded-xl font-medium transition-all duration-300 relative
          ${stage === 'success' 
            ? 'bg-green-600 hover:bg-green-700' 
            : disabled 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-[#d71921] hover:bg-[#b5171a] text-white'
          }
          ${['preparing', 'approving', 'processing'].includes(stage) ? 'cursor-wait' : ''}
        `}
      >
        {getButtonContent()}
      </button>
    );
  };

  // In your InvestmentDetail component, add this state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState('0.001'); // You can calculate this dynamically

  // Update the refresh handler
  const handleRefreshBalance = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await fetchUSDTBalance(address, isConnected, setIsLoading, setUsdtBalance);
    } catch (error) {
      console.error('Error refreshing balance:', error);
      toast.error('Failed to refresh balance');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-0">
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
          style: {
            background: 'transparent',
            padding: '0px',
            margin: '0px',
            boxShadow: 'none',
            border: 'none',
            maxWidth: '100%',
            backdropFilter: 'blur(8px)'
          }
        }}
      />

      {/* Hero Section */}
      <div 
        className="relative h-[250px] sm:h-[300px] md:h-[400px] bg-cover bg-center"
        style={{ 
          backgroundImage: `linear-gradient(rgba(18, 24, 39, 0.8), rgba(18, 24, 39, 0.95)), url(${backgroundImageUrl})`
        }}
      >
        {/* Content Container with better spacing */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
          {/* Tags at top */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2 py-1 text-xs sm:text-sm bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-white">
              {hashtag}
            </span>
            <span className="px-2 py-1 text-xs sm:text-sm bg-green-500/10 backdrop-blur-sm border border-green-400/10 rounded-full text-green-400">
              {activestatus}
            </span>
            
          </div>

          {/* Main Content - Pushed to bottom */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{title}</h1>
              <p className="text-sm text-gray-300 max-w-2xl line-clamp-2 sm:line-clamp-none">
                {description}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/5">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-gray-300">Target Annual Return</span>
                </div>
                <p className="text-base sm:text-lg font-bold text-white">{floatingapy}</p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/5">
                <div className="flex items-center space-x-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-gray-300">Lock-in Period</span>
                </div>
                <p className="text-base sm:text-lg font-bold text-white">{lockin}</p>
              </div>

              <div className="hidden md:block bg-white/5 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/5">
                <div className="flex items-center space-x-2 mb-1">
                  <DollarSign className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-gray-300">Min. Investment</span>
                </div>
                <p className="text-base sm:text-lg font-bold text-white">$1</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Section */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 mt-6">
          {/* Provider Details */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            {/* Logo and Name */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 sm:w-14 h-12 sm:h-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 flex-shrink-0">
                <Building2 className="w-6 sm:w-7 h-6 sm:h-7 text-[#d71921]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Pixx Finance</h2>
                  <BadgeCheck className="w-4 sm:w-5 h-4 sm:h-5 text-blue-500" />
                  <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded-full">Verified</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Licensed Investment Manager</p>
              </div>
            </div>

            {/* Stats - Scrollable on mobile */}
            <div className="flex sm:grid sm:grid-cols-3 gap-3 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 -mx-4 sm:mx-0 px-4 sm:px-0">
              <div className="bg-gray-50 rounded-lg p-3 min-w-[110px] sm:min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">AUM</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">$250M+</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 min-w-[110px] sm:min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Track Record</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">5+ Years</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 min-w-[110px] sm:min-w-0">
                <p className="text-xs sm:text-sm text-gray-600">Investors</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">10,000+</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-6 pb-24">
        {/* Investment Progress & Stats - New section */}
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-[#d71921]" />
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Investment Progress</h2>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-full">
                {totalInvested} Raised
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Total Capacity</span>
              <span className="text-sm font-medium text-gray-900">{capacity}</span>
            </div>
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(parseInt(totalInvested.replace(/\D/g, '')) / parseInt(capacity.replace(/\D/g, ''))) * 100}%` }}
                className="absolute h-full bg-[#d71921]"
              />
            </div>
          </div>

          {/* Add Investment Stats */}
          
        </div>

        {/* Investment Overview - New section */}
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <div className="flex items-center space-x-3 mb-6">
            <Building2 className="w-6 h-6 text-[#d71921]" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Investment Overview</h2>
          </div>

          <div className="prose text-gray-700">
            <p className="mb-4">{description}</p>
            <div className={`transition-all duration-300 ${expanded ? 'h-auto' : 'h-20 overflow-hidden'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-[#d71921] mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">Investment Strategy</h4>
                      <p className="text-sm text-gray-600">Premium real estate portfolio with focus on capital appreciation and rental yields.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Building2 className="w-5 h-5 text-[#d71921] mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">Asset Class</h4>
                      <p className="text-sm text-gray-600">{assetType} backed by prime Dubai properties.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="w-5 h-5 text-[#d71921] mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">Investment Timeline</h4>
                      <p className="text-sm text-gray-600">{lockin} lock-in with {redemption} redemption windows.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <BadgeCheck className="w-5 h-5 text-[#d71921] mt-1" />
                    <div>
                      <h4 className="font-medium text-gray-900">Regulatory Status</h4>
                      <p className="text-sm text-gray-600">DFSA regulated investment vehicle.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setExpanded(!expanded)}
              className="flex items-center text-[#d71921] space-x-1 mt-4 hover:text-[#b5171a] transition-colors"
            >
              <span>{expanded ? 'Show less' : 'Read more'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Risk & Compliance - New section */}
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-[#d71921]" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Risk & Compliance</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Metrics */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Risk Rating</span>
                  <span className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full">
                    Investment Grade
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">A+</span>
                  <span className="text-sm text-gray-500">by Moody's</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Asset Class</span>
                  <span className="px-2 py-1 text-xs bg-purple-50 text-purple-600 rounded-full">
                    {assetType}
                  </span>
                </div>
                <p className="text-sm text-gray-500">Real Estate Backed Security</p>
              </div>
            </div>

            {/* Compliance Info */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <BadgeCheck className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-900">Regulatory Compliance</span>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">DFSA Regulated</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">KYC/AML Compliant</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Terms - New section */}
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="w-6 h-6 text-[#d71921]" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Investment Terms</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Lock-in Period</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{lockin}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <RefreshCw className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Redemption</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{redemption}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-600">Payment Methods</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{paymentmethods}</p>
            </div>
          </div>
        </div>

        {/* Highlights - New section */}
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-[#d71921]" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Investment Highlights</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                icon: <Building2 className="w-8 h-8 text-[#d71921]" />,
                title: "Premium Real Estate",
                description: "Access to Dubai's most sought-after properties in prime locations.",
                stats: `${capacity} Total Pool Size`
              },
              {
                icon: <TrendingUp className="w-8 h-8 text-[#d71921]" />,
                title: "Attractive Returns",
                description: "Target annual yield of ${floatingapy} with bi-annual distributions.",
                stats: "Historical: 12.3% APY"
              },
              {
                icon: <Shield className="w-8 h-8 text-[#d71921]" />,
                title: "Institutional Grade",
                description: "Professional management and regulatory compliance.",
                stats: "A+ Risk Rating"
              },
              {
                icon: <RefreshCw className="w-8 h-8 text-[#d71921]" />,
                title: "Flexible Investment",
                description: `${redemption} redemption windows after ${lockin} lock-in period.`,
                stats: "Bi-annual Liquidity"
              }
            ].map((highlight, index) => (
              <div 
                key={index}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    {highlight.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{highlight.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{highlight.description}</p>
                    <p className="text-xs font-medium text-[#d71921]">{highlight.stats}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods - New section */}
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <div className="flex items-center space-x-3 mb-6">
            <Wallet className="w-6 h-6 text-[#d71921]" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Payment Methods</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <Bitcoin className="w-8 h-8 text-[#d71921]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Cryptocurrency</h3>
                  <p className="text-sm text-gray-600">USDT, USDC</p>
                </div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span>Instant processing</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span>No transaction fees</span>
                </li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <DollarSign className="w-8 h-8 text-[#d71921]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Fiat Currency</h3>
                  <p className="text-sm text-gray-600">Bank Transfer, Cards</p>
                </div>
              </div>
              <ul className="space-y-2">
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span>Multiple currencies accepted</span>
                </li>
                <li className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span>Secure payment processing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Documents - New section */}
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="w-6 h-6 text-[#d71921]" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Important Documents</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: <FileText className="w-6 h-6 text-[#d71921]" />,
                title: "Investment Memorandum",
                size: "2.4 MB",
                type: "PDF"
              },
              {
                icon: <Building2 className="w-6 h-6 text-[#d71921]" />,
                title: "Property Portfolio",
                size: "3.5 MB",
                type: "PDF"
              },
              {
                icon: <FileText className="w-6 h-6 text-[#d71921]" />,
                title: "Terms & Conditions",
                size: "1.2 MB",
                type: "PDF"
              },
              {
                icon: <FileText className="w-6 h-6 text-[#d71921]" />,
                title: "Risk Disclosure",
                size: "1.8 MB",
                type: "PDF"
              }
            ].map((doc, index) => (
              <button 
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm group-hover:shadow-md transition-shadow">
                    {doc.icon}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{doc.title}</p>
                    <p className="text-xs text-gray-500">{doc.size} • {doc.type}</p>
                  </div>
                </div>
                <Download className="w-5 h-5 text-gray-400 group-hover:text-[#d71921] transition-colors" />
              </button>
            ))}
          </div>
        </div>

        {/* Tokenization & Blockchain Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <div className="flex items-center space-x-3 mb-6">
            <svg className="w-6 h-6 text-[#d71921]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 10V3L4 14H11V21L20 10H13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Blockchain Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contract Details */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Smart Contract</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Contract Address</span>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs bg-white px-2 py-1 rounded border border-gray-100">0x1234...5678</code>
                    <button className="p-1 hover:bg-white rounded-lg transition-colors">
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Token Standard</span>
                  <span className="text-sm font-medium text-gray-900">ERC-3643</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Network</span>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                    <span className="text-sm font-medium text-gray-900">BNB Chain</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Audit */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Security Audit</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Audited by CertiK</p>
                    <p className="text-xs text-gray-500">Security Score: 95/100</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Multi-signature Wallet</p>
                    <p className="text-xs text-gray-500">3/5 Signers Required</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Token Metrics */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Total Supply</p>
              <p className="text-lg font-semibold text-gray-900">1,000,000 REALT</p>
              <p className="text-xs text-gray-500">Fixed Supply</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Token Price</p>
              <p className="text-lg font-semibold text-gray-900">$1.00 USDT</p>
              <p className="text-xs text-gray-500">Pegged to USD</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Market Cap</p>
              <p className="text-lg font-semibold text-gray-900">$1,000,000</p>
              <p className="text-xs text-gray-500">Fully Diluted</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Holders</p>
              <p className="text-lg font-semibold text-gray-900">250+</p>
              <p className="text-xs text-gray-500">Verified Investors</p>
            </div>
          </div>

          {/* Audit Trail */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Contract Audit Trail</h3>
            <div className="space-y-3">
              {[
                {
                  event: 'Contract Deployment',
                  date: '2024-01-15',
                  hash: '0xabc...def',
                  status: 'Verified'
                },
                {
                  event: 'CertiK Audit Complete',
                  date: '2024-01-20',
                  hash: '0xghi...jkl',
                  status: 'Passed'
                },
                {
                  event: 'Token Distribution',
                  date: '2024-02-01',
                  hash: '0xmno...pqr',
                  status: 'Active'
                }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.event}</p>
                      <p className="text-xs text-gray-500">{item.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <code className="text-xs bg-white px-2 py-1 rounded border border-gray-100">{item.hash}</code>
                    <a 
                      href={`https://bscscan.com/tx/${item.hash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-1 hover:bg-white rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real Estate Asset Details */}
        <div className="bg-white rounded-xl p-6 shadow-sm mt-6">
          <div className="flex items-center space-x-3 mb-6">
            <Building2 className="w-6 h-6 text-[#d71921]" />
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Asset Details</h2>
          </div>

          {/* Property Gallery */}
          <div className="relative mb-6">
            {/* Add image gallery component here */}
          </div>

          {/* Property Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Location</p>
              <p className="text-base font-semibold text-gray-900">Dubai Marina</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Property Type</p>
              <p className="text-base font-semibold text-gray-900">Commercial</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Total Area</p>
              <p className="text-base font-semibold text-gray-900">10,000 sq.ft</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Occupancy Rate</p>
              <p className="text-base font-semibold text-gray-900">95%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-10 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Minimum Investment</p>
            <p className="text-2xl font-semibold">$1</p>
          </div>
          <button onClick={handleInvestNowClick} className="bg-[#d71921] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#b5171a] transition-colors flex items-center space-x-2">
            <span>Invest Now</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        {/* Modal */}
        
<Modal isOpen={isModalOpen} onClose={handleCloseModal}>
  

  <div className="flex p-1 bg-gray-100 rounded-xl mb-6">
    <button
      className={`flex-1 py-1 text-sm font-medium rounded-lg transition-all ${
        investmentType === 'crypto'
          ? 'bg-white text-gray-900 shadow'
          : 'text-gray-600 hover:text-gray-900'
      }`}
      onClick={() => setInvestmentType('crypto')}
    >
      Invest via Stablecoin
    </button>
    <button
      className={`flex-1 py-1 text-xsm font-medium rounded-lg transition-all ${
        investmentType === 'fiat'
          ? 'bg-white text-gray-900 shadow'
          : 'text-gray-600 hover:text-gray-900'
      }`}
      onClick={() => setInvestmentType('fiat')}
    >
      Invest via Fiat Currency
    </button>
  </div>

  {investmentType === 'crypto' ? (
    <>
      <div className="mt-6 p-5 bg-gray-50 rounded-xl border border-gray-200">
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-1">Transferring from</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-gray-600" />
              <ConnectButton accountStatus="avatar" chainStatus="icon" />
            </div>
            <button
              onClick={async () => {
                const opposite = getOppositeNetwork(window.ethereum?.networkVersion);
                try {
                  await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: `0x${parseInt(opposite.id).toString(16)}` }],
                  });
                } catch (error) {
                  console.error('Failed to switch network:', error);
                  toast.error('Failed to switch network. Please try again.');
                }
              }}
              className={`inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-full 
                border ${getOppositeNetwork(window.ethereum?.networkVersion).color}
                hover:bg-white/50 active:bg-white/75 transition-all duration-200`}
            >
              <ArrowLeftRight className="w-3 h-3" />
              {window.ethereum?.networkVersion === '97' ? 'Testnet' : 'Mainnet'}
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="https://imgur.com/5NgRebx.png" alt="USDT" className="w-6 h-6" />
              <span className="text-sm text-gray-600">USDT Balance</span>
            </div>
            <div className="flex items-center space-x-3">
              <p className="text-sm font-medium">
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-gray-300 border-t-[#d71921] rounded-full animate-spin" />
                    <span className="text-gray-500">Loading...</span>
                  </span>
                ) : (
                  <span className="font-mono">{usdtBalance} USDT</span>
                )}
              </p>
              <button
                onClick={handleRefreshBalance}
                disabled={isRefreshing}
                className={`p-1.5 rounded-lg hover:bg-gray-100 transition-all ${
                  isRefreshing ? 'opacity-50' : ''
                }`}
              >
                <RefreshCw className={`w-4 h-4 text-gray-600 ${
                  isRefreshing ? 'animate-spin' : ''
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Network and Gas Fee Info */}
        <div className="mt-4 p-3 bg-gray-100/50 rounded-xl space-y-3">
          {/* Network Indicator */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Network</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              getNetworkName(window.ethereum?.networkVersion).color
            } bg-white/50 border border-current font-medium`}>
              {getNetworkName(window.ethereum?.networkVersion).name}
            </span>
          </div>

          {/* Estimated Gas Fee */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Fuel className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-xs text-gray-600">Estimated Gas Fee</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-gray-700">~{estimatedGas} BNB</span>
              <span className="text-xs text-gray-500">(${getGasInUSD(estimatedGas)})</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 relative">
        <div className="relative flex items-center">
          <input
            type="number"
            min="5000"
            step="100"
            placeholder="0.00"
            value={investmentAmount}
            onChange={(e) => setInvestmentAmount(e.target.value)}
            className="w-full px-4 py-3 text-2xl font-light bg-gray-50 border-2 border-gray-100 rounded-xl outline-none transition-all duration-200 focus:border-[#d71921] focus:bg-white"
          />
          <div className="absolute right-4 text-gray-400">USDT</div>
        </div>
        <p className="mt-2 text-xs text-gray-500">Minimum investment: $1</p>
      </div>

      <div className="mt-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Investment Tenure</span>
          <span className="text-sm font-medium">{selectedTenure} months</span>
        </div>
        
        <div className="relative mb-4">
          <input
            type="range"
            min={MIN_TENURE}
            max={MAX_TENURE}
            value={selectedTenure}
            onChange={(e) => setSelectedTenure(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div 
            className="absolute top-[-6px] w-1 h-4 bg-green-500" 
            style={{
              left: `${((RECOMMENDED_TENURE - MIN_TENURE) / (MAX_TENURE - MIN_TENURE)) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          />
          <div className="absolute top-4 text-xs text-green-600"
            style={{
              left: `${((RECOMMENDED_TENURE - MIN_TENURE) / (MAX_TENURE - MIN_TENURE)) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          >
            Recommended
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-xl">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Expected Return</span>
            <span className="text-sm font-medium">
              {investmentAmount ? 
                `${calculateExpectedReturn(investmentAmount, selectedTenure)} USDT` : 
                '-'
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Annual Yield</span>
            <span className="text-sm font-medium text-green-600">{ANNUAL_RATE * 100}% APY</span>
          </div>

          {/* Add Transaction Status Box */}
          {transactionStatus && (
            <TransactionStatus 
              status={transactionStatus.status}
              message={transactionStatus.message}
              error={transactionStatus.error}
              details={transactionStatus.details}
              hash={transactionStatus.hash}
              explorerUrl={transactionStatus.explorerUrl}
            />
          )}

          {transactionStatus?.status === 'success' && (
            <a 
              href={`${transactionStatus.explorerUrl}/tx/${transactionStatus.hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center justify-center space-x-1"
            >
              <span>View on Explorer</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      <InvestmentButton
        onClick={handleConfirmInvestment}
        disabled={
          !investmentAmount ||
          investmentAmount < 1 ||
          Number(investmentAmount) > Number(usdtBalance) ||
          Boolean(error)
        }
        stage={transactionStage}
      />
    </>
  ) : (
    <div className="py-12 px-4 text-center">
      <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
      <p className="text-sm text-gray-600 max-w-sm mx-auto">
        Thorough compliance checks are required to enable investments through your local currency.
      </p>
    </div>
  )}
</Modal>
<BottomNavigation />
      </div>

      {/* Add Transaction Receipt */}
      {showReceipt && transactionDetails && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <InvestmentReceipt
            transaction={transactionDetails}
            onClose={() => setShowReceipt(false)}
          />
        </div>
      )}
    </div>
  );
}