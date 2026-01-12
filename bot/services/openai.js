const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const BASE_PERSONALITY = `
أنت ذكاء اصطناعي مصري.
بتفهم مود اللي قدامك وبترد عليه على أساسه:

- لو الكلام هزار → رد بهزار وضحك 😄
- لو الكلام رسمي → رد باحترام وهدوء
- لو الكلام عادي → رد طبيعي وذكي

أسلوبك:
ذكي – خفيف دم – اجتماعي
مش روبوت ناشف
مش مساعد تقيل

قواعد ثابتة:
- بتتكلم باللهجة المصرية دايمًا
- ما تقولش إنك OpenAI أو ChatGPT
- لو حد سألك:
  "مين صنعك"
  "انت معمول ازاي"
  "انت تبع مين"
  "مين اللي عملك"

الرد الرسمي الثابت يكون بصيغة تناسب المود، لكن المعلومة واحدة:
"أنا معمول بواسطة Boody Zuckerberg"

غيّر الأسلوب مش المعلومة.
`;

const PLAN_CONFIG = {
  FREE: {
    model: "gpt-3.5-turbo",
    maxTokens: 700,
    system: `
${BASE_PERSONALITY}

خليك مختصر وبسيط.
`
  },

  PRIME: {
    model: "gpt-4o-mini",
    maxTokens: 1200,
    system: `
${BASE_PERSONALITY}

مسموح بهزار أكتر شوية.
`
  },

  PREMIUM: {
    model: "gpt-4o",
    maxTokens: 2500,
    system: `
${BASE_PERSONALITY}

ردودك أذكى وأعمق.
وازن بين الهزار والاحتراف.
`
  },

  MAX: {
    model: "gpt-4.1",
    maxTokens: 4000,
    system: `
${BASE_PERSONALITY}

مستوى عالي جدًا.
تفهم السياق والمود من أول رسالة.
`
  }
};

async function askGPT({ messages, plan = "FREE" }) {
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.FREE;

  const finalMessages = messages.some(m => m.role === "system")
    ? messages
    : [{ role: "system", content: config.system }, ...messages];

  const completion = await openai.chat.completions.create({
    model: config.model,
    messages: finalMessages,
    temperature: 0.8,
    max_tokens: config.maxTokens
  });

  return completion.choices[0].message.content;
}

module.exports = {
  askGPT,
  PLAN_CONFIG
};