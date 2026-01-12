const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/*
  ================== PLAN → MODEL CONFIG ==================
  اتحكم في الجودة / التكلفة من هنا بس
*/
const PLAN_CONFIG = {
  FREE: {
    model: "gpt-3.5-turbo",
    maxTokens: 700,
    system:
      "You are a helpful assistant. Keep answers short and simple. You can reply in Egyptian Arabic if the user does."
  },

  PRIME: {
    model: "gpt-4o-mini",
    maxTokens: 1200,
    system:
      "You are a helpful assistant. Be clear and accurate. You may use Egyptian Arabic naturally."
  },

  PREMIUM: {
    model: "gpt-4o",
    maxTokens: 2500,
    system:
      "You are an advanced assistant. Give detailed and high-quality answers. Use Egyptian Arabic when appropriate."
  },

  MAX: {
    model: "gpt-4.1",
    maxTokens: 4000,
    system:
      "You are a professional AI assistant. Think deeply, answer perfectly, and adapt to the user's language including Egyptian Arabic."
  }
};

/* =======================================================
   🧠 HELPER: تجهيز الرسائل
======================================================= */
function buildMessages(messages, planConfig) {
  const hasSystem = messages.some(m => m.role === "system");

  if (hasSystem) return messages;

  return [
    { role: "system", content: planConfig.system },
    ...messages
  ];
}

/* =======================================================
   ✅ askGPT (رد عادي)
======================================================= */
async function askGPT({ messages, plan = "FREE" }) {
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.FREE;

  const finalMessages = buildMessages(messages, config);

  const completion = await openai.chat.completions.create({
    model: config.model,
    messages: finalMessages,
    temperature: 0.7,
    max_tokens: config.maxTokens
  });

  return completion.choices[0].message.content;
}

/* =======================================================
   🔥 askGPTStream (Streaming – زي ChatGPT)
======================================================= */
async function askGPTStream({ messages, plan = "FREE", onToken }) {
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.FREE;
  const finalMessages = buildMessages(messages, config);

  const stream = await openai.chat.completions.create({
    model: config.model,
    messages: finalMessages,
    temperature: 0.7,
    max_tokens: config.maxTokens,
    stream: true
  });

  let fullText = "";

  for await (const chunk of stream) {
    const token = chunk.choices?.[0]?.delta?.content;
    if (token) {
      fullText += token;
      if (onToken) onToken(token);
    }
  }

  return fullText;
}

/* =======================================================
   🖼️ askGPTWithImage (دعم الصور)
======================================================= */
async function askGPTWithImage({
  message,
  imageUrl,
  plan = "FREE"
}) {
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.FREE;

  const completion = await openai.chat.completions.create({
    model: config.model === "gpt-3.5-turbo" ? "gpt-4o" : config.model,
    messages: [
      {
        role: "system",
        content: config.system
      },
      {
        role: "user",
        content: [
          { type: "text", text: message },
          {
            type: "image_url",
            image_url: { url: imageUrl }
          }
        ]
      }
    ],
    max_tokens: config.maxTokens
  });

  return completion.choices[0].message.content;
}

module.exports = {
  askGPT,
  askGPTStream,
  askGPTWithImage,
  PLAN_CONFIG
};