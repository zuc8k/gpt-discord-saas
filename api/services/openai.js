const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/*
  ================== PLAN → MODEL CONFIG ==================
  غير هنا بس لو حابب تتحكم في الجودة / التكلفة
*/
const PLAN_CONFIG = {
  FREE: {
    model: "gpt-3.5-turbo",
    maxTokens: 700,
    system: "You are a helpful assistant. Keep answers short and simple."
  },

  PRIME: {
    model: "gpt-4o-mini",
    maxTokens: 1200,
    system: "You are a helpful assistant. Be clear and accurate."
  },

  PREMIUM: {
    model: "gpt-4o",
    maxTokens: 2500,
    system: "You are an advanced assistant. Give detailed and high-quality answers."
  },

  MAX: {
    model: "gpt-4.1",
    maxTokens: 4000,
    system: "You are a professional AI assistant. Think deeply and answer perfectly."
  }
};

/*
  ================== askGPT ==================
  messages: [{ role: "user" | "assistant" | "system", content: string }]
  plan: FREE | PRIME | PREMIUM | MAX
*/
async function askGPT({ messages, plan = "FREE" }) {
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.FREE;

  // لو مفيش system message نضيفه تلقائي
  const finalMessages = messages.some(m => m.role === "system")
    ? messages
    : [{ role: "system", content: config.system }, ...messages];

  const completion = await openai.chat.completions.create({
    model: config.model,
    messages: finalMessages,
    temperature: 0.7,
    max_tokens: config.maxTokens
  });

  return completion.choices[0].message.content;
}

module.exports = {
  askGPT,
  PLAN_CONFIG
};