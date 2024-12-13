// Transaction storage utility
const STORAGE_KEY = 'pixx_transactions';
const PORTFOLIO_KEY = 'pixx_portfolio';

export const saveTransaction = (transaction) => {
  try {
    // Get existing transactions
    const existingTransactions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    // Add new transaction
    const updatedTransactions = [...existingTransactions, {
      ...transaction,
      timestamp: new Date().toISOString()
    }];
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTransactions));

    // Update portfolio data
    updatePortfolioData(transaction);

    return true;
  } catch (error) {
    console.error('Error saving transaction:', error);
    return false;
  }
};

export const getTransactions = (address) => {
  try {
    const transactions = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return address ? transactions.filter(tx => tx.userAddress?.toLowerCase() === address.toLowerCase()) : transactions;
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

export const updatePortfolioData = (newTransaction) => {
  try {
    const portfolio = JSON.parse(localStorage.getItem(PORTFOLIO_KEY) || '{}');
    const assetKey = newTransaction.assetDetails.title;

    if (!portfolio[assetKey]) {
      portfolio[assetKey] = {
        icon: newTransaction.assetDetails.icon,
        label: newTransaction.assetDetails.title,
        value: 0,
        invested: 0,
        tokensHeld: 0,
        apy: parseFloat(newTransaction.assetDetails.floatingapy),
        transactions: []
      };
    }

    // Update portfolio based on transaction type
    if (newTransaction.type === 'investment') {
      portfolio[assetKey].invested += parseFloat(newTransaction.amount);
      portfolio[assetKey].tokensHeld += parseFloat(newTransaction.tokensReceived || 0);
    } else if (newTransaction.type === 'withdrawal') {
      portfolio[assetKey].invested -= parseFloat(newTransaction.amount);
      portfolio[assetKey].tokensHeld -= parseFloat(newTransaction.tokensWithdrawn || 0);
    }

    // Calculate current value based on token price
    portfolio[assetKey].value = portfolio[assetKey].tokensHeld * parseFloat(newTransaction.tokenPrice || 0);
    
    // Add transaction reference
    portfolio[assetKey].transactions.push({
      hash: newTransaction.hash,
      type: newTransaction.type,
      amount: newTransaction.amount,
      date: newTransaction.timestamp
    });

    localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
    return true;
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return false;
  }
};

export const getPortfolioData = (address) => {
  try {
    const portfolio = JSON.parse(localStorage.getItem(PORTFOLIO_KEY) || '{}');
    const transactions = getTransactions(address);
    
    // Calculate total portfolio value and returns
    const totalValue = Object.values(portfolio).reduce((sum, asset) => sum + asset.value, 0);
    const totalInvested = Object.values(portfolio).reduce((sum, asset) => sum + asset.invested, 0);
    const totalReturn = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

    return {
      totalValue,
      totalReturn,
      totalInvested,
      assets: Object.values(portfolio),
      transactions: transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    };
  } catch (error) {
    console.error('Error getting portfolio:', error);
    return {
      totalValue: 0,
      totalReturn: 0,
      totalInvested: 0,
      assets: [],
      transactions: []
    };
  }
}; 