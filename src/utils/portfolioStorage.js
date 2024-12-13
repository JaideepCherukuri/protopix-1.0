// Constants for localStorage keys
const PORTFOLIO_ASSETS_KEY = 'portfolio_assets';
const PORTFOLIO_HISTORY_KEY = 'portfolio_history';

// Default placeholder data for assets
const defaultAssets = [
  {
    id: 'default-1',
    title: 'Stablecoin Yield',
    provider: 'Pixx Finance',
    assetType: 'Fixed Income',
    apy: '12%',
    amount: 5000,
    tokens: 4000,
    lockin: '3 months',
    backgroundImageUrl: 'https://imgur.com/XqwAXtw.png',
    isPlaceholder: true
  },
  {
    id: 'default-2',
    title: 'BTC Covered Call',
    provider: 'Pixx Finance',
    assetType: 'Options',
    apy: '18%',
    amount: 10000,
    tokens: 8000,
    lockin: '1 month',
    backgroundImageUrl: 'https://imgur.com/nZoHqUH.png',
    isPlaceholder: true
  }
];

// Default placeholder data for history
const defaultHistory = [
  {
    id: 'history-1',
    type: 'investment',
    title: 'Stablecoin Yield',
    amount: 5000,
    date: '2024-01-15T10:30:00Z',
    status: 'completed',
    currency: 'USDT',
    backgroundImageUrl: 'https://imgur.com/XqwAXtw.png',
    isPlaceholder: true
  },
  {
    id: 'history-2',
    type: 'investment',
    title: 'BTC Covered Call',
    amount: 10000,
    date: '2024-01-10T14:20:00Z',
    status: 'completed',
    currency: 'USDT',
    backgroundImageUrl: 'https://imgur.com/nZoHqUH.png',
    isPlaceholder: true
  }
];

// Initialize portfolio data
export const initializePortfolioData = () => {
  if (!localStorage.getItem(PORTFOLIO_ASSETS_KEY)) {
    localStorage.setItem(PORTFOLIO_ASSETS_KEY, JSON.stringify(defaultAssets));
  }
  if (!localStorage.getItem(PORTFOLIO_HISTORY_KEY)) {
    localStorage.setItem(PORTFOLIO_HISTORY_KEY, JSON.stringify(defaultHistory));
  }
};

// Get portfolio assets
export const getPortfolioAssets = () => {
  const assets = localStorage.getItem(PORTFOLIO_ASSETS_KEY);
  return assets ? JSON.parse(assets) : defaultAssets;
};

// Get portfolio history
export const getPortfolioHistory = () => {
  const history = localStorage.getItem(PORTFOLIO_HISTORY_KEY);
  return history ? JSON.parse(history) : defaultHistory;
};

// Helper function to clean APY value
const cleanAPYValue = (apy) => {
  if (typeof apy === 'number') return apy;
  return parseFloat(apy.toString().replace('%', ''));
};

// Update weighted average APY calculation
const calculateWeightedAPY = (amount1, apy1, amount2, apy2) => {
  const cleanApy1 = cleanAPYValue(apy1);
  const cleanApy2 = cleanAPYValue(apy2);
  
  const totalAmount = amount1 + amount2;
  const weightedAPY = ((amount1 * cleanApy1) + (amount2 * cleanApy2)) / totalAmount;
  return weightedAPY.toFixed(1);
};

// Update addInvestment function
export const addInvestment = (transaction) => {
  // Get current assets and history
  const currentAssets = getPortfolioAssets();
  const currentHistory = getPortfolioHistory();

  // Create history entry
  const historyEntry = {
    id: `history-${Date.now()}`,
    type: 'investment',
    title: transaction.investmentDetails.title,
    amount: transaction.amount,
    date: transaction.date,
    status: transaction.status,
    currency: transaction.currency,
    backgroundImageUrl: transaction.investmentDetails.backgroundImageUrl,
    hash: transaction.hash,
    transactionDetails: transaction
  };

  // Add to history
  const newHistory = [historyEntry, ...currentHistory];
  localStorage.setItem(PORTFOLIO_HISTORY_KEY, JSON.stringify(newHistory));

  // Update or add to assets
  const existingAssetIndex = currentAssets.findIndex(
    asset => asset.title === transaction.investmentDetails.title && !asset.isPlaceholder
  );

  if (existingAssetIndex !== -1) {
    // Update existing asset with proper amount addition
    const existingAsset = currentAssets[existingAssetIndex];
    const newAmount = parseFloat(transaction.amount);
    const existingAmount = parseFloat(existingAsset.amount);
    
    const updatedAsset = {
      ...existingAsset,
      amount: existingAmount + newAmount,
      tokens: parseFloat(existingAsset.tokens) + parseFloat(transaction.tokensReceived),
      apy: calculateWeightedAPY(
        existingAmount,
        existingAsset.apy,
        newAmount,
        transaction.investmentDetails.floatingapy
      )
    };
    currentAssets[existingAssetIndex] = updatedAsset;
  } else {
    // Add new asset
    const newAsset = {
      id: `asset-${Date.now()}`,
      title: transaction.investmentDetails.title,
      provider: transaction.investmentDetails.provider,
      assetType: transaction.investmentDetails.assetType,
      apy: cleanAPYValue(transaction.investmentDetails.floatingapy),
      amount: parseFloat(transaction.amount),
      tokens: parseFloat(transaction.tokensReceived),
      lockin: transaction.investmentDetails.lockin,
      backgroundImageUrl: transaction.investmentDetails.backgroundImageUrl,
      investmentDate: transaction.date
    };
    currentAssets.push(newAsset);
  }

  localStorage.setItem(PORTFOLIO_ASSETS_KEY, JSON.stringify(currentAssets));
};

// Clear portfolio data (useful for testing)
export const clearPortfolioData = () => {
  localStorage.removeItem(PORTFOLIO_ASSETS_KEY);
  localStorage.removeItem(PORTFOLIO_HISTORY_KEY);
  initializePortfolioData();
}; 