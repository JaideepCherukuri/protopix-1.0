import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Clock, DollarSign, ArrowUpRight, 
  Calendar, RefreshCw, AlertCircle, ChevronRight, ArrowLeft, ArrowUp, ArrowDown, Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import { format, differenceInDays } from 'date-fns';
import { getTransactions as getTransactionHistory } from '../utils/transactionStorage';
import { Chart as ChartJS } from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';
import BottomNavigation from '../components/BottomNavigation';
import toast from 'react-hot-toast';

// Register the zoom plugin
ChartJS.register(zoomPlugin);

// Import your components
import AnimatedProgressBar from '../components/AnimatedProgressBar';

// Add the getCategoryGradient function
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
      return 'linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(215, 25, 33, 0.9))';
  }
};

// Add this keyframe animation to your CSS
const pulseAnimation = {
  '0%': { opacity: 0.4 },
  '50%': { opacity: 1 },
  '100%': { opacity: 0.4 },
};

export default function AssetDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { asset } = location.state || {};

  // Redirect if no asset data
  useEffect(() => {
    if (!asset) {
      navigate('/portfolio');
    }
  }, [asset, navigate]);

  // States for various data
  const [transactions, setTransactions] = useState([]);
  const [yieldData, setYieldData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Daily Yield',
        data: [],
        borderColor: '#10B981',
        tension: 0.4,
      }
    ]
  });
  const [maturityInfo, setMaturityInfo] = useState({
    daysLeft: 0,
    date: new Date()
  });

  // Fetch asset data on mount
  useEffect(() => {
    if (asset?.id) {
      // Get transaction history
      const txHistory = getTransactionHistory().filter(tx => tx.assetId === asset.id);
      setTransactions(txHistory);

      // Calculate maturity info
      const maturityDate = new Date(asset.maturityDate);
      const daysToMaturity = differenceInDays(maturityDate, new Date());
      setMaturityInfo({
        daysLeft: daysToMaturity,
        date: maturityDate
      });

      // Generate yield data (placeholder - replace with real data)
      const generateYieldData = () => {
        const days = 30; // Last 30 days
        const labels = [];
        const data = [];
        const baseYield = parseFloat(asset.currentApy) / 365; // Daily yield

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          labels.push(format(date, 'MMM dd'));
          // Add some random variation to daily yield
          const dailyYield = baseYield * (1 + (Math.random() - 0.5) * 0.1);
          data.push(dailyYield.toFixed(3));
        }

        return { labels, data };
      };

      const { labels, data } = generateYieldData();
      setYieldData(prev => ({
        ...prev,
        labels,
        datasets: [{
          ...prev.datasets[0],
          data
        }]
      }));
    }
  }, [asset?.id]);

  // Handle invest more
  const handleInvestMore = () => {
    navigate('/investment-detail', { 
      state: {
        title: asset.name,
        floatingapy: `${asset.currentApy}%`,
        hashtag: asset.assetType,
        // ... other required props
      }
    });
  };

  // Add chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: value => value + '%'
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  const handleLiquidate = () => {
    if (maturityInfo.daysLeft > 0) {
      toast.error(`Cannot liquidate. Asset locked for ${maturityInfo.daysLeft} more days.`);
      return;
    }
    // Handle liquidation logic here
  };

  if (!asset) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Hero Section with gradient overlay */}
      <div 
        className="h-48 sm:h-56 bg-cover bg-center relative"
        style={{ 
          backgroundImage: `url(${asset.backgroundImage || asset.icon})`,
        }}
      >
        {/* Gradient Overlay - Darker for better text visibility */}
        <div 
          className="absolute inset-0" 
          style={{ 
            background: `${getCategoryGradient(asset.assetType)}, rgba(0, 0, 0, 0.3)` 
          }}
        />
        
        {/* Back Button with better contrast */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/30 hover:bg-black/40 text-white backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Asset Type Badge */}
        <div className="absolute top-4 right-4 z-10">
          <span className="px-3 py-1.5 text-xs font-medium text-white bg-black/30 rounded-full backdrop-blur-sm border border-white/20">
            {asset.assetType}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Asset Card */}
        <div className="bg-white rounded-xl p-6 shadow-sm -mt-20 relative z-10 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                <img src={asset.icon} alt={asset.name} className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{asset.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500">Asset ID:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {asset.id.slice(0, 8)}...{asset.id.slice(-6)}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Value Cards - Enhanced */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Current Value Card - More intuitive */}
            <div className="bg-gradient-to-br from-[#d71921]/5 to-[#d71921]/10 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <p className="text-sm text-gray-600">Investment Value</p>
                <div className="flex items-center space-x-1 bg-green-100 px-2 py-0.5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-green-700">Live</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <p className="text-2xl font-bold text-gray-900">${asset.currentValue}</p>
                  <div className="flex items-center space-x-1 text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">+${asset.accumulatedYield}</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-200">
                  <div>
                    <p>Initial Investment</p>
                    <p className="font-medium text-gray-700">${asset.initialInvestment}</p>
                  </div>
                  <div className="text-right">
                    <p>Total Returns</p>
                    <p className="font-medium text-green-600">+{((asset.currentValue - asset.initialInvestment) / asset.initialInvestment * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* APY Performance Card - Simplified */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <p className="text-sm text-gray-600">APY Performance</p>
                <div className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-blue-100">
                  <span className="text-xs font-medium text-blue-700">Real-time</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Live APY with pulse */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm text-gray-600">Current APY</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{asset.currentApy}%</p>
                </div>

                {/* Target APY */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🎯</span>
                    <span className="text-sm text-gray-600">Target APY</span>
                  </div>
                  <p className="text-lg text-gray-600">{asset.targetApy}%</p>
                </div>

                {/* Performance Status */}
                <div className="pt-2 border-t border-gray-200">
                  {asset.currentApy > asset.targetApy ? (
                    <div className="flex items-center justify-between text-green-600 bg-green-50 p-2 rounded-lg">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">+{(asset.currentApy - asset.targetApy).toFixed(1)}% Above Target</span>
                    </div>
                  ) : asset.currentApy < asset.targetApy ? (
                    <div className="flex items-center justify-between text-orange-600 bg-orange-50 p-2 rounded-lg">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">-{(asset.targetApy - asset.currentApy).toFixed(1)}% Below Target</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-blue-600 bg-blue-50 p-2 rounded-lg">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">On Target</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* New Section: Investment Details */}
          <div className="bg-white rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Investment Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {format(new Date(asset.investmentDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Next Distribution</p>
                <p className="text-sm font-medium text-gray-900">
                  {format(new Date(asset.nextDistribution), 'MMM dd, yyyy')}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Distribution Frequency</p>
                <p className="text-sm font-medium text-gray-900">{asset.redemptionFrequency}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Asset Type</p>
                <p className="text-sm font-medium text-gray-900">{asset.assetType}</p>
              </div>
            </div>
          </div>

          {/* New Section: Risk Metrics */}
          <div className="bg-white rounded-xl p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Risk Assessment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Volatility</p>
                  <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Low</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">Liquidity</p>
                  <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Medium</span>
                </div>
              </div>
            </div>
          </div>

          {/* Maturity Timeline - Move it up for better visibility */}
          <div className="bg-white rounded-xl p-4 mb-4 -mt-6 mx-4 relative z-20 shadow-lg border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#d71921]" />
                <p className="text-sm font-medium text-gray-900">Maturity Status</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                maturityInfo.daysLeft > 0 
                  ? 'bg-orange-100 text-orange-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {maturityInfo.daysLeft > 0 
                  ? `${maturityInfo.daysLeft} days locked` 
                  : 'Ready to Liquidate'}
              </span>
            </div>
            
            <div className="relative pt-2">
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#d71921] to-[#ff4b55] rounded-full transition-all duration-500 relative"
                  style={{ 
                    width: `${Math.max(0, Math.min(100, (1 - maturityInfo.daysLeft / 365) * 100))}%` 
                  }}
                >
                  {/* Animated glow effect */}
                  <div 
                    className="absolute top-0 right-0 h-full w-4 animate-pulse"
                    style={{ 
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <div className="text-xs">
                  <p className="text-gray-500">Investment Date</p>
                  <p className="font-medium text-gray-700">{format(new Date(asset.investmentDate), 'MMM dd, yyyy')}</p>
                </div>
                <div className="text-xs text-right">
                  <p className="text-gray-500">Maturity Date</p>
                  <p className="font-medium text-gray-700">{format(maturityInfo.date, 'MMM dd, yyyy')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Yield Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm mt-4 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Yield Performance</h2>
          <div className="h-64">
            <Line data={yieldData} options={chartOptions} />
          </div>
        </div>

        {/* Transaction History - Update the transaction history section */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm mt-4 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Transaction History</h2>
            <select 
              className="text-sm border rounded-lg px-2 py-1"
              onChange={(e) => setTransactionFilter(e.target.value)}
            >
              <option value="all">All Transactions</option>
              <option value="investment">Investments</option>
              <option value="yield">Yield Payments</option>
            </select>
          </div>
          
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'investment' 
                        ? 'bg-green-100' 
                        : tx.type === 'yield' 
                          ? 'bg-blue-100'
                          : 'bg-red-100'
                    }`}>
                      {tx.type === 'investment' ? (
                        <ArrowUp className="w-4 h-4 text-green-600" />
                      ) : tx.type === 'yield' ? (
                        <RefreshCw className="w-4 h-4 text-blue-600" />
                      ) : (
                        <ArrowDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {tx.type === 'investment' ? 'Investment' : tx.type === 'yield' ? 'Yield Payment' : 'Withdrawal'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(tx.date), 'MMM dd, yyyy • HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      tx.type === 'investment' 
                        ? 'text-green-600' 
                        : tx.type === 'yield'
                          ? 'text-blue-600'
                          : 'text-red-600'
                    }`}>
                      {tx.type === 'investment' ? '+' : tx.type === 'yield' ? '+' : '-'}${tx.amount}
                    </p>
                    <p className="text-xs text-gray-500">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Bar - Adjust bottom padding to accommodate BottomNavigation */}
      <div className="fixed bottom-[50px] left-0 right-0 bg-white border-t border-gray-200 p-4 z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <button 
            onClick={handleLiquidate}
            disabled={maturityInfo.daysLeft > 0}
            className={`flex-1 px-4 py-3 border-2 rounded-xl font-medium transition-colors
              ${maturityInfo.daysLeft > 0 
                ? 'border-gray-200 text-gray-400 bg-gray-50' 
                : 'border-[#d71921] text-[#d71921] hover:bg-red-50'}`}
          >
            {maturityInfo.daysLeft > 0 ? 'Locked' : 'Liquidate Position'}
          </button>
          <button 
            onClick={handleInvestMore}
            className="flex-1 px-4 py-3 bg-[#d71921] text-white rounded-xl font-medium hover:bg-[#b5171a] transition-colors"
          >
            Invest More
          </button>
        </div>
      </div>

      {/* Add BottomNavigation */}
      <BottomNavigation />
    </div>
  );
}

// Helper component for metric cards
const MetricCard = ({ icon, label, value, subtext }) => (
  <div className="bg-gray-50 rounded-xl p-4">
    <div className="flex items-center space-x-2 mb-2">
      {icon}
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <p className="text-lg font-semibold text-gray-900">{value}</p>
    <p className="text-xs text-gray-500 mt-1">{subtext}</p>
  </div>
); 