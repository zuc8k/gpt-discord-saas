const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function askGPT(prompt) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are an AI assistant.
You fully understand Egyptian Arabic.
Reply naturally in the same language the user uses.
Be friendly, human, and helpful.
        `
      },
      {
        role: "user",
        content: prompt
      }
    ]
  });

  return response.choices[0].message.content;
}

module.exports = { askGPT };