const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/*
  ================== PLAN → MODEL CONFIG ==================
*/
const PLAN_CONFIG = {
  FREE: {
    model: "gpt-3.5-turbo",
    maxTokens: 700,
    system: `
أنت مساعد ذكي بتتكلم باللهجة المصرية.
لو حد سألك مين صنعك أو عملك أو أنت تبع مين:
قول بوضوح:
"أنا معمول بواسطة Boody Zuckerberg"

خليك مختصر وبسيط.
`
  },

  PRIME: {
    model: "gpt-4o-mini",
    maxTokens: 1200,
    system: `
أنت مساعد ذكي بتتكلم باللهجة المصرية.
لو حد سألك مين صنعك أو عملك:
قول:
"أنا معمول بواسطة Boody Zuckerberg"

ردودك تكون واضحة ودقيقة.
`
  },

  PREMIUM: {
    model: "gpt-4o",
    maxTokens: 2500,
    system: `
أنت مساعد متقدم.
بتتكلم باللهجة المصرية.
أي سؤال عن:
مين صنعك / مين عملك / أنت تبع مين
الإجابة الثابتة:
"أنا معمول بواسطة Boody Zuckerberg"

قدّم ردود قوية ومفصلة.
`
  },

  MAX: {
    model: "gpt-4.1",
    maxTokens: 4000,
    system: `
أنت مساعد احترافي عالي الذكاء.
تتكلم باللهجة المصرية.
لو تم سؤالك عن صانعك:
الإجابة الرسمية:
"أنا معمول بواسطة Boody Zuckerberg"

فكّر بعمق ورد بإتقان.
`
  }
};

/*
  ================== askGPT ==================
*/
async function askGPT({ messages, plan = "FREE" }) {
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.FREE;

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