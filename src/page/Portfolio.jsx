import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  ArrowUp, 
  ArrowDown,
  Building2, 
  Wine, 
  Paintbrush, 
  Ship,
  Plus,
  ChevronRight,
  Clock,
  AlertCircle,
  Loader,
  Search,
  Filter,
  TrendingUp,
  ChevronDown,
  BadgeCheck,
  Star,
  FileText
} from 'lucide-react';
import ConnectButton from '../ConnectButton';
import BottomNavigation from '../components/BottomNavigation';
import toast from 'react-hot-toast';
import { getPortfolioAssets, getPortfolioHistory, initializePortfolioData } from '../utils/portfolioStorage';
import InvestmentReceipt from '../components/InvestmentReceipt';
import backgroundImage1 from '../assets/images/grow-card-dubai.png';
import backgroundImage2 from '../assets/images/grow-card-uk.png';
import backgroundImage3 from '../assets/images/grow-card-gold.png';
import backgroundImage4 from '../assets/images/grow-card-secure.png';
import backgroundImage5 from '../assets/images/grow-card-art.png';
import backgroundImage6 from '../assets/images/grow-card-wiskey.png';
import backgroundImage7 from '../assets/images/grow-card-marine.png';
import backgroundImage8 from '../assets/images/grow-card-ind.png';

const getCategoryGradient = (category) => {
  switch (category?.toLowerCase()) {
    case 'real estate':
      return 'linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(37, 99, 235, 0.9))';
    case 'wine':
    case 'whiskey':
      return 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(185, 28, 28, 0.9))';
    case 'art':
      return 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(126, 34, 206, 0.9))';
    case 'marine':
      return 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(3, 105, 161, 0.9))';
    case 'gold':
      return 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(161, 98, 7, 0.9))';
    case 'secure yield':
      return 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(21, 128, 61, 0.9))';
    default:
      return 'linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(4, 39, 112, 0.9))';
  }
};

const getMaturityStatus = (lockInPeriod, investmentDate) => {
  if (!lockInPeriod || !investmentDate) return null;

  const now = new Date();
  const investDate = new Date(investmentDate);
  const lockInMonths = parseInt(lockInPeriod);
  const maturityDate = new Date(investDate);
  maturityDate.setMonth(maturityDate.getMonth() + lockInMonths);
  
  const timeLeft = maturityDate - now;
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  const monthsLeft = Math.ceil(daysLeft / 30);
  const weeksLeft = Math.ceil(daysLeft / 7);

  if (timeLeft <= 0) {
    const monthsPast = Math.abs(Math.floor((now - maturityDate) / (1000 * 60 * 60 * 24 * 30)));
    return { 
      type: 'matured', 
      text: `Matured ${monthsPast} ${monthsPast === 1 ? 'month' : 'months'} ago` 
    };
  } else if (daysLeft <= 7) {
    return { 
      type: 'soon', 
      text: daysLeft <= 1 ? 'Matures tomorrow' : `${daysLeft}` 
    };
  } else if (daysLeft <= 30) {
    return { 
      type: 'upcoming', 
      text: `${weeksLeft} ${weeksLeft === 1 ? 'week' : 'weeks'}` 
    };
  } else {
    return { 
      type: 'pending', 
      text: `${monthsLeft} ${monthsLeft === 1 ? 'month' : 'months'}` 
    };
  }
};

const MaturityBadge = ({ status }) => {
  if (!status) return null;

  const getBadgeColor = () => {
    switch (status.type) {
      case 'matured':
        return 'text-green-100';
      case 'soon':
        return 'text-yellow-100';
      default:
        return 'text-red-100 ';
    }
  };

  return (
    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium border ${getBadgeColor()}`}>
      <div className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        <span>{status.text}</span>
      </div>
    </div>
  );
};

const ProviderBadge = ({ provider, verified = true }) => (
  <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20">
    <div className="flex items-center gap-1">
      {provider}
      {verified && <BadgeCheck className="w-3 h-3 text-blue-100" />}
    </div>
  </div>
);

const CategoryTag = ({ category }) => (
  <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20">
    {category}
  </div>
);

const TopPerformerBadge = () => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="absolute -top-2 -right-2 w-12 h-12"
  >
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="w-full h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 rounded-full opacity-20"></div>
    </motion.div>
    <motion.div
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
    </motion.div>
  </motion.div>
);

const AssetCard = ({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeType, 
  apy, 
  onClick, 
  backgroundImage,
  provider,
  assetType,
  maturityStatus,
  isTopPerformer,
  investmentDate,
  lockInPeriod
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
    style={{
      backgroundImage: `${getCategoryGradient(assetType)}, url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}
  >
    {isTopPerformer && <TopPerformerBadge />}
    <ProviderBadge provider={provider} />
    <MaturityBadge status={maturityStatus} />
    <CategoryTag category={assetType} />
    
    <div className="flex items-center gap-3 mb-4 mt-8">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white bg-white/20">
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <div className="font-medium text-white">{label}</div>
        <div className="text-sm text-gray-300">APY: {typeof apy === 'string' ? apy : `${apy.toFixed(1)}%`}</div>
      </div>
      <ChevronRight size={20} className="text-gray-300" />
    </div>
    <div className="flex items-end justify-between">
      <div>
        <div className="text-2xl font-semibold text-white">${value}</div>
        <div className={`flex items-center text-sm ${
          changeType === 'up' ? 'text-green-400' : 'text-red-400'
        }`}>
          {changeType === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
          <span>{change}%</span>
        </div>
      </div>
      <motion.div 
        className="w-20 h-12"
        style={{
          background: `linear-gradient(to right, ${
            changeType === 'up' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'
          }, transparent)`
        }}
      />
    </div>
  </motion.div>
);

const TransactionItem = ({ type, amount, date, status, hash, onClick, hasReceipt }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className="p-4 bg-white rounded-xl shadow-sm mb-3 cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
  >
    {hasReceipt && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"
      />
    )}
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          type === 'investment' ? 'bg-blue-100 text-blue-600' : 
          type === 'withdrawal' ? 'bg-orange-100 text-orange-600' : 
          'bg-green-100 text-green-600'
        }`}>
          {type === 'investment' ? <Plus size={20} /> : 
           type === 'withdrawal' ? <ArrowUp size={20} /> : 
           <TrendingUp size={20} />}
        </div>
        <div>
          <div className="font-medium text-gray-900">
            {type === 'investment' ? 'New Investment' :
             type === 'withdrawal' ? 'Withdrawal' :
             'Yield Payment'}
          </div>
          <div className="text-sm text-gray-500">{new Date(date).toLocaleDateString()}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold">${amount}</div>
        <div className={`text-sm ${
          status === 'completed' ? 'text-green-500' :
          status === 'pending' ? 'text-orange-500' :
          'text-red-500'
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </div>
      </div>
    </div>
    <div className="text-xs text-gray-500 font-mono flex items-center gap-2">
      <span>TX: {hash ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : 'N/A'}</span>
      {hasReceipt && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-1 text-blue-500"
        >
          <FileText className="w-3 h-3" />
          <span>View Receipt</span>
        </motion.div>
      )}
    </div>
  </motion.div>
);

const EmptyState = ({ type, message, actionLabel, onAction }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="flex flex-col items-center justify-center py-12 px-4"
  >
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      {type === 'loading' ? (
        <Loader className="w-8 h-8 text-gray-400 animate-spin" />
      ) : type === 'error' ? (
        <AlertCircle className="w-8 h-8 text-red-400" />
      ) : (
        <Search className="w-8 h-8 text-gray-400" />
      )}
    </div>
    <p className="text-gray-500 text-center mb-4">{message}</p>
    {actionLabel && (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAction}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
      >
        {actionLabel}
      </motion.button>
    )}
  </motion.div>
);

export default function Portfolio() {
  const { isConnected, address } = useAccount();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [portfolioData, setPortfolioData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('assets');
  const [timeRange, setTimeRange] = useState('1M');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  
  useEffect(() => {
    const loadPortfolioData = async () => {
      if (!isConnected || !address) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Initialize storage if needed
        initializePortfolioData();
        
        // Get stored assets and history
        const storedAssets = getPortfolioAssets();
        const storedHistory = getPortfolioHistory();
        
        // Original placeholder assets with backgrounds
        const placeholderAssets = [
          {
            icon: Building2,
            label: "Dubai Real Estate",
            value: "75,000",
            change: "8.2",
            changeType: "up",
            apy: 9.5,
            assetType: "real estate",
            backgroundImage: backgroundImage1
          },
          {
            icon: Wine,
            label: "Fine Wine & Whiskey",
            value: "25,000",
            change: "5.4",
            changeType: "up",
            apy: 12.3,
            assetType: "wine",
            backgroundImage: backgroundImage6
          },
          {
            icon: Paintbrush,
            label: "Art Collection",
            value: "15,000",
            change: "2.1",
            changeType: "down",
            apy: 7.8,
            assetType: "art",
            backgroundImage: backgroundImage5
          },
          {
            icon: Ship,
            label: "Marine Finance",
            value: "10,000",
            change: "6.8",
            changeType: "up",
            apy: 15.2,
            assetType: "marine",
            backgroundImage: backgroundImage7
          }
        ];

        // Transform stored assets to match placeholder format
        const realAssets = storedAssets
          .filter(asset => !asset.isPlaceholder)
          .map(asset => {
            const maturityStatus = getMaturityStatus(asset.lockin, asset.investmentDate);
            // Remove % sign if present and parse as float
            const apyValue = parseFloat(asset.apy.toString().replace('%', ''));
            
            return {
              icon: getAssetIcon(asset.assetType),
              label: asset.title,
              value: asset.amount.toLocaleString(),
              change: (apyValue / 2).toFixed(1), // Half of APY as current change
              changeType: 'up',
              apy: apyValue,
              assetType: asset.assetType,
              backgroundImage: asset.backgroundImageUrl || getAssetBackground(asset.assetType),
              provider: asset.provider || "Pixx Finance",
              maturityStatus,
              investmentDate: asset.investmentDate,
              lockInPeriod: asset.lockin,
              originalData: asset
            };
          });

        // Sort assets by APY to determine top performer
        const sortedAssets = [...realAssets].sort((a, b) => parseFloat(b.apy) - parseFloat(a.apy));
        if (sortedAssets.length > 0) {
          sortedAssets[0].isTopPerformer = true;
        }

        // Combine real assets first, then placeholders
        const combinedAssets = [...realAssets, ...placeholderAssets];
        
        // Calculate total value and return from all assets
        const totalValue = combinedAssets.reduce((sum, asset) => {
          return sum + parseFloat(asset.value.replace(/,/g, ''));
        }, 0);

        const totalReturn = combinedAssets.reduce((sum, asset) => {
          const assetValue = parseFloat(asset.value.replace(/,/g, ''));
          const returnValue = assetValue * (asset.apy / 100);
          return sum + returnValue;
        }, 0);

        const returnPercentage = (totalReturn / totalValue) * 100;

        setPortfolioData({
          totalValue,
          totalReturn: returnPercentage,
          assets: combinedAssets
        });

        // Original placeholder transactions
        const placeholderTransactions = [
          {
            type: 'investment',
            amount: '25,000',
            date: '2024-02-15',
            status: 'completed',
            hash: '0x1234567890abcdef1234567890abcdef12345678'
          },
          {
            type: 'yield',
            amount: '1,250',
            date: '2024-02-01',
            status: 'completed',
            hash: '0xabcdef1234567890abcdef1234567890abcdef12'
          },
          {
            type: 'withdrawal',
            amount: '5,000',
            date: '2024-01-15',
            status: 'pending',
            hash: '0x7890abcdef1234567890abcdef1234567890abcd'
          }
        ];

        // Transform stored transactions
        const realTransactions = storedHistory
          .filter(item => !item.isPlaceholder)
          .map(item => ({
            type: 'investment',
            amount: item.amount.toLocaleString(),
            date: item.date,
            status: item.status,
            hash: item.hash,
            hasReceipt: !!item.transactionDetails,
            originalData: item
          }));

        // Put real transactions first, then placeholders
        setTransactions([...realTransactions, ...placeholderTransactions]);
        
      } catch (err) {
        console.error('Error loading portfolio data:', err);
        setError('Failed to load portfolio data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolioData();

    // Listen for new transactions
    window.addEventListener('newTransaction', loadPortfolioData);
    return () => window.removeEventListener('newTransaction', loadPortfolioData);
  }, [isConnected, address]);

  const getAssetIcon = (assetType) => {
    switch (assetType?.toLowerCase()) {
      case 'real estate':
        return Building2;
      case 'wine':
        return Wine;
      case 'art':
        return Paintbrush;
      case 'marine':
        return Ship;
      default:
        return Building2;
    }
  };

  const getAssetBackground = (assetType) => {
    switch (assetType?.toLowerCase()) {
      case 'real estate':
        return backgroundImage1;
      case 'uk property':
        return backgroundImage2;
      case 'gold':
        return backgroundImage3;
      case 'secure yield':
        return backgroundImage4;
      case 'art':
        return backgroundImage5;
      case 'wine':
      case 'whiskey':
        return backgroundImage6;
      case 'marine':
        return backgroundImage7;
      case 'india property':
        return backgroundImage8;
      default:
        return backgroundImage1; // Default background
    }
  };

  const handleAssetClick = (asset) => {
    navigate('/asset-detail', { 
      state: { 
        asset: {
          id: asset.originalData?.id || `portfolio-${Date.now()}`,
          name: asset.label,
          icon: asset.backgroundImage,
          currentValue: parseFloat(asset.value.replace(/,/g, '')),
          currentApy: asset.apy,
          targetApy: asset.apy, // Using same APY as target for now
          accumulatedYield: (parseFloat(asset.value.replace(/,/g, '')) * parseFloat(asset.change) / 100).toFixed(2),
          nextDistribution: new Date(Date.now() + 30*24*60*60*1000), // 30 days from now
          maturityDate: asset.originalData?.maturityDate || new Date(Date.now() + 365*24*60*60*1000),
          investmentDate: asset.investmentDate || new Date(),
          lockinPeriod: asset.lockInPeriod || '12 months',
          redemptionFrequency: '30 days', // Default value
          assetType: asset.assetType,
          status: 'active'
        }
      }
    });
  };

  const handleTransactionClick = (transaction) => {
    if (transaction.originalData?.transactionDetails) {
      setSelectedTransaction(transaction.originalData.transactionDetails);
      setShowReceipt(true);
    }
  };

  const handleInvestClick = () => {
    navigate('/explore-pixx');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmptyState
          type="error"
          message="Please connect your wallet to view your portfolio"
          actionLabel="Connect Wallet"
          onAction={() => {}} // This will trigger your ConnectButton
        />
        <BottomNavigation />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmptyState
          type="loading"
          message="Loading your portfolio..."
        />
        <BottomNavigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmptyState
          type="error"
          message={error}
          actionLabel="Try Again"
          onAction={() => window.location.reload()}
        />
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[rgba(18,24,39)] p-6 pb-16"
      >
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <ConnectButton accountStatus="avatar" chainStatus="icon" />
              <div className="h-8 w-[1px] bg-gray-700" />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
                onClick={() => toast('No new notifications')}
              >
                <Bell className="text-gray-400" size={24} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              </motion.button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => toast('Filters coming soon')}
              className="p-2 rounded-xl bg-gray-800 text-gray-400"
            >
              <Filter size={20} />
            </motion.button>
          </div>

          <div className="text-white mb-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-semibold">
                ${portfolioData.totalValue.toLocaleString()}
              </span>
              <span className="text-gray-400">.00</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className={`flex items-center ${
                portfolioData.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {portfolioData.totalReturn >= 0 ? (
                  <ArrowUp size={16} />
                ) : (
                  <ArrowDown size={16} />
                )}
                <span>${Math.abs((portfolioData.totalValue * portfolioData.totalReturn / 100)).toFixed(2)}</span>
              </div>
              <div className="flex gap-2">
                {['1W', '1M', '3M', '1Y', 'ALL'].map((range) => (
                  <motion.button
                    key={range}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      timeRange === range 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {range}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleInvestClick}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-medium shadow-lg"
            >
              <Plus size={20} />
              <span>Invest</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toast('Withdrawal feature coming soon')}
              className="flex-1 bg-gray-800 py-3 rounded-xl flex items-center justify-center gap-2 text-white font-medium"
            >
              <ArrowUp size={20} />
              <span>Withdraw</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-xl mx-auto -mt-8 rounded-t-3xl bg-gray-50 p-6 min-h-screen">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex-1 py-2 text-center rounded-xl font-medium transition-all ${
              activeTab === 'assets'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Assets
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 text-center rounded-xl font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            History
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'assets' ? (
            <motion.div
              key="assets"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 gap-4"
            >
              {portfolioData.assets.map((asset, index) => (
                <AssetCard
                  key={index}
                  {...asset}
                  backgroundImage={asset.backgroundImage}
                  onClick={() => handleAssetClick(asset)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {transactions.length > 0 ? (
                transactions.map((transaction, index) => (
                  <TransactionItem 
                    key={index} 
                    {...transaction} 
                    onClick={() => handleTransactionClick(transaction)}
                  />
                ))
              ) : (
                <EmptyState
                  type="empty"
                  message="No transactions yet"
                  actionLabel="Make Your First Investment"
                  onAction={handleInvestClick}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNavigation />

      {/* Transaction Receipt Modal */}
      {showReceipt && selectedTransaction && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <InvestmentReceipt
            transaction={selectedTransaction}
            onClose={() => {
              setShowReceipt(false);
              setSelectedTransaction(null);
            }}
          />
        </div>
      )}
    </div>
  );
}