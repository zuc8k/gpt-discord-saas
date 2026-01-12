module.exports = {
  FREE: {
    days: 7,                // مدة التجربة
    dailyLines: 500,        // ليمت يومي
    monthlyLines: 10000,    // ليمت شهري
    yearlyLines: 20000
  },

  PRIME: {
    price: {
      monthly: 5,           // USD
      yearly: 13
    },
    dailyLines: 1500,
    monthlyLines: 10000,
    yearlyLines: 20000
  },

  PREMIUM: {
    price: {
      monthly: 10,
      yearly: 25
    },
    dailyLines: 3000,
    monthlyLines: 20000,
    yearlyLines: 40000
  },

  MAX: {
    price: {
      monthly: 20,
      yearly: 50
    },
    dailyLines: 8000,
    monthlyLines: 40000,
    yearlyLines: 80000
  }
};