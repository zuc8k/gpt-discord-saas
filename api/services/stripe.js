const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET);

const plans = require("../shared/plans");
const Invoice = require("../models/Invoice");

/**
 * Create Stripe Checkout Session
 * @param {String} guildId
 * @param {String} plan  PRIME | PREMIUM | MAX
 * @param {String} duration monthly | yearly
 * @param {String} currency usd | egp
 */
async function createCheckout({
  guildId,
  plan,
  duration,
  currency = "usd"
}) {
  // ================== VALIDATION ==================
  if (!plans[plan] || !plans[plan].price?.[duration]) {
    throw new Error("Invalid plan or duration");
  }

  const amountUSD = plans[plan].price[duration];

  // Stripe أقل وحدة (سنت)
  const unitAmount =
    currency === "egp"
      ? amountUSD * 50 * 100 // مثال تحويل تقريبي (عدّله براحتك)
      : amountUSD * 100;

  // ================== CREATE INVOICE ==================
  const invoice = await Invoice.create({
    guildId,
    plan,
    duration,
    amount: amountUSD,
    currency: currency.toUpperCase(),
    method: "STRIPE",
    status: "PENDING"
  });

  // ================== STRIPE SESSION ==================
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",

    line_items: [
      {
        price_data: {
          currency,
          product_data: {
            name: `GPT Bot – ${plan} (${duration})`,
            description: `Upgrade server ${guildId}`
          },
          unit_amount: unitAmount
        },
        quantity: 1
      }
    ],

    metadata: {
      invoiceId: invoice._id.toString(),
      guildId,
      plan,
      duration
    },

    success_url: `${process.env.FRONTEND_URL}/success?invoice=${invoice._id}`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel?invoice=${invoice._id}`
  });

  // ================== SAVE SESSION ID ==================
  invoice.stripeSessionId = session.id;
  await invoice.save();

  return session;
}

module.exports = { createCheckout };