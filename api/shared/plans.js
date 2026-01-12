module.exports = {
  FREE: {
    days: 7,
    dailyLines: 500,
    monthlyLines: 10000,
    yearlyLines: 20000
  },

  PRIME: {
    price: { monthly: 5, yearly: 13 },
    dailyLines: 500,
    monthlyLines: 10000,
    yearlyLines: 20000
  },

  PREMIUM: {
    price: { monthly: 10, yearly: 25 },
    dailyLines: 1000,
    monthlyLines: 20000,
    yearlyLines: 40000
  },

  MAX: {
    price: { monthly: 20, yearly: 50 },
    dailyLines: 2000,
    monthlyLines: 40000,
    yearlyLines: 80000
  }
};