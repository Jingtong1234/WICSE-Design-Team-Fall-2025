require('dotenv').config();

const API_KEY = process.env.EXCHANGE_RATE_API_KEY;
const BASE_URL = 'https://v6.exchangerate-api.com/v6';

// avoid hitting API limit
let rateCache = {};
let lastFetchTime = {};

async function getExchangeRate(fromCurrency, toCurrency) {
  const cacheKey = `${fromCurrency}_${toCurrency}`;
  const now = Date.now();
  
  //1 hour expiry
  if (rateCache[cacheKey] && (now - lastFetchTime[cacheKey] < 3600000)) {
    return rateCache[cacheKey];
  }

  try {
    const response = await fetch(
      `${BASE_URL}/${API_KEY}/pair/${fromCurrency}/${toCurrency}`
    );
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.result === 'success') {
      const rate = data.conversion_rate;
      rateCache[cacheKey] = rate;
      lastFetchTime[cacheKey] = now;
      return rate;
    } 
    else {
      throw new Error('Failed to fetch exchange rate');
    }
  } 
  catch (error) {
    console.error('Exchange rate error:', error);
    throw error;
  }
}

async function convertAmount(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  const rate = await getExchangeRate(fromCurrency, toCurrency);
  return amount * rate;
}

// credit card fee 
function applyCardFee(amount, feePercentage) {
  if (!feePercentage || feePercentage === 0) {
    return amount;
  }
  return amount * (1 + feePercentage / 100);
}

module.exports = {
  getExchangeRate,
  convertAmount,
  applyCardFee
};