const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET);

async function createCheckout({ plan, duration, guildId }) {
  const prices = {
    PRIME_monthly: 500,
    PRIME_yearly: 1300,

    PREMIUM_monthly: 1000,
    PREMIUM_yearly: 2500,

    MAX_monthly: 2000,
    MAX_yearly: 5000
  };

  return stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: {
          name: `${plan} ${duration}`
        },
        unit_amount: prices[`${plan}_${duration}`]
      },
      quantity: 1
    }],
    metadata: {
      plan,
      duration,
      guildId
    },
    success_url: `${process.env.FRONTEND_URL}/success`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`
  });
}

module.exports = { createCheckout };