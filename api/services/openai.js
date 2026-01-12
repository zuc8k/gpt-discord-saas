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
    maxTokens: 700
  },
  PRIME: {
    model: "gpt-4o-mini",
    maxTokens: 1200
  },
  PREMIUM: {
    model: "gpt-4o",
    maxTokens: 2500
  },
  MAX: {
    model: "gpt-4.1",
    maxTokens: 4000
  }
};

/*
  ================== SYSTEM PROMPTS (MOODS) ==================
*/
const SYSTEM_PROMPTS = {
  FUN: `
You are a funny, witty AI assistant.
- Use emojis naturally 😄🔥
- You joke, tease lightly, and sound friendly.
- If the user speaks Arabic, reply in Egyptian Arabic 🇪🇬.
- If the user speaks English, reply in English 🇺🇸.
- If asked "who made you", answer confidently:
  "I'm made by Boody Zuckerberg 👑😎"
- Be helpful but never boring.
`,

  FORMAL: `
You are a professional, polite AI assistant.
- Clear, accurate, respectful tone.
- Match the user's language automatically.
- If asked "who made you", answer:
  "I was created by Boody Zuckerberg."
`
};

/*
  ================== BUILD MESSAGES ==================
*/
function buildMessages(messages, systemPrompt) {
  const hasSystem = messages.some(m => m.role === "system");
  if (hasSystem) return messages;

  return [
    { role: "system", content: systemPrompt },
    ...messages
  ];
}

/*
  ================== askGPT (Normal) ==================
  options:
  - messages
  - plan
  - mood: FUN | FORMAL
*/
async function askGPT({
  messages,
  plan = "FREE",
  mood = "FUN"
}) {
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.FREE;
  const systemPrompt = SYSTEM_PROMPTS[mood] || SYSTEM_PROMPTS.FUN;

  const finalMessages = buildMessages(messages, systemPrompt);

  const completion = await openai.chat.completions.create({
    model: config.model,
    messages: finalMessages,
    temperature: mood === "FUN" ? 0.9 : 0.6,
    max_tokens: config.maxTokens
  });

  return completion.choices[0].message.content;
}

/*
  ================== askGPTStream (Streaming) ==================
*/
async function askGPTStream({
  messages,
  plan = "FREE",
  mood = "FUN",
  onToken
}) {
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.FREE;
  const systemPrompt = SYSTEM_PROMPTS[mood] || SYSTEM_PROMPTS.FUN;

  const finalMessages = buildMessages(messages, systemPrompt);

  const stream = await openai.chat.completions.create({
    model: config.model,
    messages: finalMessages,
    temperature: mood === "FUN" ? 0.9 : 0.6,
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

/*
  ================== askGPTWithImage (Images) ==================
*/
async function askGPTWithImage({
  message,
  imageUrl,
  plan = "FREE",
  mood = "FUN"
}) {
  const config = PLAN_CONFIG[plan] || PLAN_CONFIG.FREE;
  const systemPrompt = SYSTEM_PROMPTS[mood] || SYSTEM_PROMPTS.FUN;

  const completion = await openai.chat.completions.create({
    model: config.model === "gpt-3.5-turbo" ? "gpt-4o" : config.model,
    messages: [
      { role: "system", content: systemPrompt },
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