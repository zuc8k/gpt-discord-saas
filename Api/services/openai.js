const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function askGPT({ message }) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini", // سريع ورخيص
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: message }
    ],
    temperature: 0.7
  });

  return completion.choices[0].message.content;
}

module.exports = { askGPT };