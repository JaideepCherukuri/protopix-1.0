import React, { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  ChevronRight,
  Wallet,
  ArrowUpRight,
  Clock,
  FileText,
  Loader,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import ConnectButton from '../ConnectButton';
import BottomNavigation from '../components/BottomNavigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import profileImage from '../assets/images/dpixel.jpg';

const MenuButton = ({ icon: Icon, label, onClick, showBadge }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
  >
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
        <Icon className="w-5 h-5 text-gray-700" />
      </div>
      <span className="font-medium text-gray-900">{label}</span>
    </div>
    <div className="flex items-center space-x-2">
      {showBadge && (
        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
          New
        </span>
      )}
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </div>
  </button>
);

const BSC_SCAN_API_KEY = import.meta.env.VITE_BSC_SCAN_API_KEY;
const USDT_CONTRACT_ADDRESSES = {
  mainnet: import.meta.env.VITE_USDT_CONTRACT_ADDRESS_MAINNET,
  testnet: import.meta.env.VITE_USDT_CONTRACT_ADDRESS_TESTNET
};

const BSC_SCAN_ENDPOINTS = {
  mainnet: 'https://api.bscscan.com/api',
  testnet: 'https://api-testnet.bscscan.com/api'
};

const fetchWithRetry = async (url, params, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, { params });
      if (response.data.status === '1') {
        return response;
      }
      console.warn(`Retry ${i + 1}/${retries} failed:`, response.data);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    } catch (error) {
      console.error(`API call attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

const BalanceDisplay = ({ balance, isLoading, onRefresh }) => (
  <div className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm relative">
    <button
      onClick={onRefresh}
      disabled={isLoading}
      className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
      title="Refresh balance"
    >
      <RefreshCw className={`w-4 h-4 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} />
    </button>
    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
      <Wallet className="w-6 h-6 text-blue-600" />
    </div>
    <span className="font-light text-gray-500">USDT Balance</span>
    <span className="text-lg font-semibold text-gray-900 flex items-center">
      {isLoading ? (
        <span className="flex items-center space-x-2">
          <span className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-gray-500">Loading...</span>
        </span>
      ) : (
        <>
          {balance}
          <img src="https://imgur.com/35i87ah.png" alt="USDT" className="w-6 h-6 ml-2" />
        </>
      )}
    </span>
  </div>
);

export default function Account() {
  const { isConnected, address } = useAccount();
  const [notifications] = useState(3);
  const [usdtBalance, setUsdtBalance] = useState('0.00');
  const [isLoading, setIsLoading] = useState(false);
  const [networkType, setNetworkType] = useState('mainnet');

  const fetchUSDTBalance = useCallback(async () => {
    if (!address || !isConnected) {
      console.log('Skipping balance fetch: No address or not connected');
      return;
    }

    setIsLoading(true);
    try {
      const chainId = window.ethereum?.networkVersion;
      const currentNetwork = chainId === '97' ? 'testnet' : 'mainnet';
      setNetworkType(currentNetwork);

      const contractAddress = USDT_CONTRACT_ADDRESSES[currentNetwork];
      
      console.log('Fetching USDT balance:', {
        network: currentNetwork,
        chainId,
        address,
        contractAddress,
        endpoint: BSC_SCAN_ENDPOINTS[currentNetwork]
      });

      const response = await fetchWithRetry(
        BSC_SCAN_ENDPOINTS[currentNetwork],
        {
          module: 'account',
          action: 'tokenbalance',
          contractaddress: contractAddress,
          address: address,
          tag: 'latest',
          apikey: BSC_SCAN_API_KEY
        }
      );

      if (response?.data.status === '1' && response.data.result) {
        const balance = parseFloat(response.data.result) / 10**18;
        console.log('Balance fetched successfully:', {
          rawBalance: response.data.result,
          formattedBalance: balance.toFixed(2)
        });
        setUsdtBalance(balance.toFixed(2));
      } else {
        console.error('Failed to fetch balance:', response?.data);
        toast.error('Failed to fetch balance');
      }
    } catch (error) {
      console.error('Error fetching USDT balance:', {
        error,
        address,
        network: networkType
      });
      toast.error('Error fetching balance');
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected, networkType]);

  useEffect(() => {
    const handleNetworkChange = () => {
      console.log('Network changed, refreshing balance...');
      fetchUSDTBalance();
    };

    if (window.ethereum) {
      window.ethereum.on('chainChanged', handleNetworkChange);
      window.ethereum.on('accountsChanged', handleNetworkChange);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('chainChanged', handleNetworkChange);
        window.ethereum.removeListener('accountsChanged', handleNetworkChange);
      }
    };
  }, [fetchUSDTBalance]);

  useEffect(() => {
    fetchUSDTBalance();
  }, [fetchUSDTBalance]);

  const handleRefreshBalance = async () => {
    try {
      await fetchUSDTBalance();
      toast.success('Balance updated');
    } catch (error) {
      console.error('Failed to refresh balance:', error);
      toast.error('Failed to update balance');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-[rgba(18,24,39)] px-4 py-6 w-full flex justify-between items-center fixed top-0 z-10">
        <ConnectButton accountStatus="full" chainStatus="full" />
      </div>

      <div className="max-w-xl mx-auto px-4 py-6 w-full mt-20 mb-20 flex-grow">
        {!isConnected ? (
          <div className="null-state-animation flex flex-col items-center justify-center h-full">
            <div className="animation w-20 h-20 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
              <Loader className="w-10 h-10 text-gray-700 animate-spin" />
            </div>
            <p className="text-gray-400 text-lg text-center">Get started and sign-in to your account/wallet</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <img src={profileImage} alt="Profile" className="w-24 h-24 rounded-full" />
            </div>
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-500 animate-pulse" />
                <span className="text-sm font-medium text-gray-600">KYC Verified</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <BalanceDisplay 
                balance={usdtBalance}
                isLoading={isLoading}
                onRefresh={handleRefreshBalance}
              />
              <button className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:bg-gray-50 transition-colors">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-2">
                  <ArrowUpRight className="w-6 h-6 text-green-600" />
                </div>
                <span className="font-medium text-gray-900">Withdraw</span>
              </button>
            </div>

            <div className="space-y-3">
              <MenuButton 
                icon={Bell} 
                label="Notifications" 
                showBadge={notifications > 0}
                onClick={() => {}} 
              />
              <MenuButton 
                icon={Clock} 
                label="Transaction History" 
                onClick={() => {}} 
              />
              <MenuButton 
                icon={FileText} 
                label="Documents" 
                onClick={() => {}} 
              />
              <MenuButton 
                icon={Shield} 
                label="Security Settings" 
                onClick={() => {}} 
              />
              <MenuButton 
                icon={Settings} 
                label="Preferences" 
                onClick={() => {}} 
              />
              <MenuButton 
                icon={HelpCircle} 
                label="Help & Support" 
                onClick={() => {}} 
              />
            </div>
          </>
        )}
      </div>
      <div className="fixed bottom-0 w-full">
        <BottomNavigation />
      </div>
    </div>
  );
}